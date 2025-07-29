import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

// Fuzzy search function using Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[len2][len1];
}

// Fuzzy search function
function fuzzySearch(query: string, text: string): boolean {
  if (!query || !text) return false;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower.includes(queryLower)) return true;
  
  // Fuzzy match with threshold
  const distance = levenshteinDistance(queryLower, textLower);
  const maxDistance = Math.max(1, Math.floor(textLower.length * 0.3)); // 30% threshold
  
  return distance <= maxDistance;
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyEdgeToken(token, process.env.JWT_SECRET!);
    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const interests = searchParams.get('interests') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build search conditions - start with basic mentee filter
    const whereConditions: any = {
      role: "MENTEE",
      deletedAt: null, // Only active users
    };

    console.log('Search params:', { query, location, experienceLevel, interests, page, limit });
    console.log('Initial where conditions:', whereConditions);

    // First, let's check if there are any mentees at all
    const totalMentees = await prisma.user.count({
      where: {
        role: "MENTEE",
        deletedAt: null,
      }
    });
    
    console.log('Total mentees in database:', totalMentees);

    // Try a different approach - fetch all users and filter in memory
    const allUsers = await prisma.user.findMany({
      include: {
        profile: {
          select: {
            bio: true,
            location: true,
            interests: true,
            education: true,
            avatar: true,
            yearsOfExperience: true,
            specialty: true,
            workplace: true,
            availabilityStatus: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter mentees in memory
    const mentees = allUsers.filter(user => user.role === "MENTEE" && user.deletedAt === null);
    console.log('Filtered mentees count:', mentees.length);

    console.log('Fetched mentees:', mentees.length);
    console.log('Sample mentee:', mentees[0]);

    // Apply fuzzy search if query exists
    let filteredMentees = mentees;
    if (query.trim()) {
      console.log('Applying fuzzy search for query:', query);
      filteredMentees = mentees.filter(mentee => {
        const searchableText = [
          mentee.firstName || '',
          mentee.lastName || '',
          mentee.email || '',
          mentee.profile?.location || '',
          mentee.profile?.education || '',
          mentee.profile?.bio || '',
          mentee.profile?.interests?.join(' ') || '',
          mentee.profile?.specialty || '',
          mentee.profile?.workplace || ''
        ].join(' ').toLowerCase();

        console.log('Searchable text for mentee:', mentee.firstName, ':', searchableText);
        const isMatch = fuzzySearch(query, searchableText);
        console.log('Is match:', isMatch);
        return isMatch;
      });
      console.log('After fuzzy search:', filteredMentees.length);
    }

    // Apply location filter if specified
    if (location.trim()) {
      console.log('Applying location filter:', location);
      filteredMentees = filteredMentees.filter(mentee => {
        const menteeLocation = mentee.profile?.location || '';
        const isMatch = menteeLocation.toLowerCase().includes(location.toLowerCase());
        console.log('Location match for', mentee.firstName, ':', menteeLocation, '->', isMatch);
        return isMatch;
      });
      console.log('After location filter:', filteredMentees.length);
    }

    // Apply experience level filter if specified
    if (experienceLevel.trim()) {
      console.log('Applying experience level filter:', experienceLevel);
      filteredMentees = filteredMentees.filter(mentee => {
        const yearsExp = mentee.profile?.yearsOfExperience || 0;
        let isMatch = false;
        
        switch (experienceLevel) {
          case 'student':
            isMatch = yearsExp <= 2;
            break;
          case 'resident':
            isMatch = yearsExp >= 3 && yearsExp <= 6;
            break;
          case 'fellow':
            isMatch = yearsExp >= 7 && yearsExp <= 10;
            break;
          case 'attending':
            isMatch = yearsExp >= 11;
            break;
          default:
            isMatch = true;
        }
        
        console.log('Experience match for', mentee.firstName, ':', yearsExp, 'years ->', isMatch);
        return isMatch;
      });
      console.log('After experience filter:', filteredMentees.length);
    }

    // Apply interests filter if specified
    if (interests.trim()) {
      console.log('Applying interests filter:', interests);
      filteredMentees = filteredMentees.filter(mentee => {
        if (!mentee.profile?.interests) return false;
        const isMatch = mentee.profile.interests.some(interest => 
          interest.toLowerCase().includes(interests.toLowerCase())
        );
        console.log('Interests match for', mentee.firstName, ':', mentee.profile.interests, '->', isMatch);
        return isMatch;
      });
      console.log('After interests filter:', filteredMentees.length);
    }

    // Get total count for pagination - use the filtered count
    const totalCount = filteredMentees.length;

    return NextResponse.json({
      mentees: filteredMentees,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Error searching mentees:", error);
    return NextResponse.json(
      { error: "Failed to search mentees" },
      { status: 500 }
    );
  }
}
