import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth, getAdminUser } from "@/lib/admin-auth";

async function getAnalytics(request: NextRequest) {
  try {
    // Get admin user from request (set by withAdminAuth middleware)
    const adminUser = getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
    }

    // Fetch comprehensive analytics data
    const [
      totalUsers,
      pendingUsers,
      totalOpportunities,
      pendingOpportunities,
      totalMenteeOpportunities,
      pendingMenteeOpportunities,
      totalDiscussions,
      totalApplications,
      userRegistrationsByDate,
      opportunitySubmissionsByDate,
      userRoleDistribution,
      opportunityTypeDistribution,
      recentActivity,
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: {
          deletedAt: null,
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),
      
      // Pending users (users with OTP secret - not yet verified)
      prisma.user.count({
        where: {
          deletedAt: null,
          otpSecret: { not: null },
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),
      
      // Total opportunities
      prisma.opportunity.count({
        where: {
          deletedAt: null,
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),
      
      // Pending opportunities
      prisma.opportunity.count({
        where: {
          deletedAt: null,
          status: "PENDING",
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),
      
      // Total mentee opportunities
      prisma.menteeOpportunity.count({
        where: {
          deletedAt: null,
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),
      
      // Pending mentee opportunities
      prisma.menteeOpportunity.count({
        where: {
          deletedAt: null,
          status: "PENDING",
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),
      
      // Total discussions
      prisma.discussionThread.count({
        where: {
          deletedAt: null,
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),
      
      // Total applications
      prisma.application.count({
        where: {
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),
      
      // User registrations by date (last 30 days)
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          deletedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      
      // Opportunity submissions by date (last 30 days)
      prisma.opportunity.groupBy({
        by: ['createdAt'],
        where: {
          deletedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      
      // User role distribution
      prisma.user.groupBy({
        by: ['role'],
        where: {
          deletedAt: null,
        },
        _count: {
          id: true,
        },
      }),
      
      // Opportunity type distribution
      prisma.opportunity.groupBy({
        by: ['opportunityTypeId'],
        where: {
          deletedAt: null,
        },
        _count: {
          id: true,
        },
      }),
      
      // Recent activity (last 10 audit logs)
      prisma.auditLog.findMany({
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // Get opportunity type names for distribution
    const opportunityTypes = await prisma.opportunityType.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Map opportunity type IDs to names
    const opportunityTypeMap = new Map(
      opportunityTypes.map((type: { id: string; name: string }) => [type.id, type.name])
    );

    const opportunityTypeDistributionWithNames = opportunityTypeDistribution.map((item: { opportunityTypeId: string; _count: { id: number } }) => ({
      typeId: item.opportunityTypeId,
      typeName: opportunityTypeMap.get(item.opportunityTypeId) || 'Unknown',
      count: item._count.id,
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        pendingUsers,
        totalOpportunities,
        pendingOpportunities,
        totalMenteeOpportunities,
        pendingMenteeOpportunities,
        totalDiscussions,
        totalApplications,
      },
      trends: {
        userRegistrationsByDate: userRegistrationsByDate.map((item: { createdAt: Date; _count: { id: number } }) => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count.id,
        })),
        opportunitySubmissionsByDate: opportunitySubmissionsByDate.map((item: { createdAt: Date; _count: { id: number } }) => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count.id,
        })),
      },
      distributions: {
        userRoles: userRoleDistribution.map((item: { role: string; _count: { id: number } }) => ({
          role: item.role,
          count: item._count.id,
        })),
        opportunityTypes: opportunityTypeDistributionWithNames,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the function wrapped with admin authentication
export const GET = withAdminAuth(getAnalytics); 