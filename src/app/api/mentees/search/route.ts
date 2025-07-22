import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = await verifyEdgeToken(token, secret);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user is a mentor
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true },
    });

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const interests = searchParams.get("interests");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    console.log("Search params:", { interests, location, search, limit, page });

    // Build the where clause
    const where: any = {
      role: "MENTEE",
      ...(location || interests || search ? {
        AND: [
          {
            profile: {
              isNot: null,
            },
          },
          ...(location && location.trim() ? [{
            profile: {
              location: {
                contains: location.trim(),
                mode: "insensitive",
              },
            },
          }] : []),
          ...(interests && interests.trim() ? (() => {
            const interestArray = interests
              .split(",")
              .map((interest) => interest.trim())
              .filter((interest) => interest.length > 0);
            
            return interestArray.length > 0 ? [{
              profile: {
                interests: {
                  hasSome: interestArray,
                },
              },
            }] : [];
          })() : []),
          ...(search && search.trim() ? [{
            OR: [
              { firstName: { contains: search.trim(), mode: "insensitive" } },
              { lastName: { contains: search.trim(), mode: "insensitive" } },
              { email: { contains: search.trim(), mode: "insensitive" } },
              {
                profile: {
                  bio: { contains: search.trim(), mode: "insensitive" },
                },
              },
              {
                profile: {
                  location: { contains: search.trim(), mode: "insensitive" },
                },
              },
              {
                profile: {
                  education: { contains: search.trim(), mode: "insensitive" },
                },
              },
              {
                profile: {
                  purposeOfRegistration: {
                    contains: search.trim(),
                    mode: "insensitive",
                  },
                },
              },
            ],
          }] : []),
        ],
      } : {}),
    };

    console.log("Final where clause:", JSON.stringify(where, null, 2));

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch mentees with their profiles
    const [mentees, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              bio: true,
              location: true,
              interests: true,
              education: true,
              purposeOfRegistration: true,
              avatar: true,
              yearsOfExperience: true,
              specialty: true,
              workplace: true,
              availabilityStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    console.log(`Found ${mentees.length} mentees out of ${totalCount} total`);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      mentees,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        limit,
      },
      searchInfo: {
        location: location || null,
        interests: interests || null,
        search: search || null,
        appliedFilters: {
          hasLocationFilter: !!location,
          hasInterestsFilter: !!interests,
          hasSearchFilter: !!search,
        },
      },
    });
  } catch (error) {
    console.error("Error searching mentees:", error);

    // Provide more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorDetails = {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : "Unknown",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorDetails,
        // Don't expose sensitive details in production
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}
