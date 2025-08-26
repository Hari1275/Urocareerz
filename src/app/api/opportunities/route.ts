import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "JWT_SECRET is not defined" },
        { status: 500 }
      );
    }

    const decoded = await verifyEdgeToken(token, secret);
    
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user and verify they are a mentor or mentee
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MENTOR" && user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Only mentors and mentees can post opportunities" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      location,
      experienceLevel,
      opportunityTypeId,
      requirements,
      benefits,
      duration,
      compensation,
      applicationDeadline,
      sourceUrl,
      sourceName,
    } = body;

    // Validate required fields
    if (!title || !description || !opportunityTypeId) {
      return NextResponse.json(
        {
          error: "Title, description, and opportunity type are required",
        },
        { status: 400 }
      );
    }

    // Create the opportunity with unified structure
    const opportunity = await (prisma.opportunity.create({
      data: {
        title,
        description,
        location,
        experienceLevel,
        opportunityTypeId,
        requirements,
        benefits,
        duration,
        compensation,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
        creatorId: user.id,
        creatorRole: user.role,
        sourceUrl,
        sourceName,
        status: "PENDING",
      } as any,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        opportunityType: true,
      } as any,
    }) as any);

    return NextResponse.json(
      {
        message: "Opportunity posted successfully",
        opportunity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error posting opportunity:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Opportunities API: Request received');
    
    // Verify authentication
    const token = request.cookies.get("token")?.value;
    console.log('Opportunities API: Token found:', !!token);
    console.log('Opportunities API: Token length:', token?.length || 0);
    
    if (!token) {
      console.log('Opportunities API: No token found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.log('Opportunities API: JWT_SECRET not defined');
      return NextResponse.json(
        { error: "JWT_SECRET is not defined" },
        { status: 500 }
      );
    }

    console.log('Opportunities API: Attempting to verify token');
    const decoded = await verifyEdgeToken(token, secret);
    console.log('Opportunities API: Token decoded:', !!decoded);
    
    if (!decoded) {
      console.log('Opportunities API: Token verification failed');
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log('Opportunities API: User ID from token:', decoded.userId);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true } // Only select needed fields
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query parameters for pagination and filters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const search = searchParams.get('search') || '';
    const experience = searchParams.get('experience') || '';
    const type = searchParams.get('type') || '';
    const saved = searchParams.get('saved') || '';

    // Build filter conditions
    const buildFilterConditions = (baseWhere: any = {}, userId?: string) => {
      const conditions: any = { ...baseWhere };
      
      // Search filter (title, description, location)
      if (search) {
        conditions.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      // Experience level filter
      if (experience) {
        conditions.experienceLevel = experience;
      }
      
      // Opportunity type filter
      if (type) {
        // Convert type name to ID by looking up the opportunity type
        conditions.opportunityType = {
          name: { equals: type, mode: 'insensitive' }
        };
      }
      
      // Saved filter (only for mentees)
      if (saved === 'saved' && userId) {
        conditions.savedOpportunities = {
          some: {
            userId: userId
          }
        };
      } else if (saved === 'not_saved' && userId) {
        conditions.savedOpportunities = {
          none: {
            userId: userId
          }
        };
      }
      
      return conditions;
    };

    // Get opportunities based on user role with pagination
    let opportunities;
    let totalCount;
    
    if (user.role === "MENTOR") {
      // Mentors see their own opportunities
      const whereConditions = buildFilterConditions({ creatorId: user.id }, user.id);
      
      const [opportunitiesData, countData] = await Promise.all([
        (prisma.opportunity.findMany({
          where: whereConditions as any,
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
            opportunityType: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            savedOpportunities: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                applications: true,
                savedOpportunities: true,
              },
            },
          } as any,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }) as any),
        (prisma.opportunity.count({
          where: whereConditions as any,
        }) as any)
      ]);
      
      opportunities = opportunitiesData;
      totalCount = countData;
    } else if (user.role === "ADMIN") {
      // Admins see all opportunities
      const whereConditions = buildFilterConditions({}, user.id);
      
      const [opportunitiesData, countData] = await Promise.all([
        (prisma.opportunity.findMany({
          where: whereConditions as any,
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
            opportunityType: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            savedOpportunities: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                applications: true,
                savedOpportunities: true,
              },
            },
          } as any,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }) as any),
        (prisma.opportunity.count({
          where: whereConditions as any,
        }) as any)
      ]);
      
      opportunities = opportunitiesData;
      totalCount = countData;
    } else {
      // Mentees see only approved opportunities
      const whereConditions = buildFilterConditions({ status: "APPROVED" }, user.id);
      
      const [opportunitiesData, countData] = await Promise.all([
        (prisma.opportunity.findMany({
          where: whereConditions as any,
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
            opportunityType: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            savedOpportunities: {
              select: {
                userId: true,
              },
            },
            _count: {
              select: {
                applications: true,
                savedOpportunities: true,
              },
            },
          } as any,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }) as any),
        (prisma.opportunity.count({
          where: whereConditions as any,
        }) as any)
      ]);
      
      opportunities = opportunitiesData;
      totalCount = countData;
    }

    return NextResponse.json({ 
      opportunities,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
