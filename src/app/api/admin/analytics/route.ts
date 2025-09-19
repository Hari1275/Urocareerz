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

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

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
      // Total users (exclude admins and recently deleted users)
      prisma.user.findMany({
        where: {
          role: { in: ["MENTOR", "MENTEE"] },
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
        select: {
          id: true,
          otpSecret: true,
          deletedAt: true,
        },
      }),

      // Pending users (users with OTP secret - not yet verified, exclude admins and recently deleted)
      prisma.user.findMany({
        where: {
          role: { in: ["MENTOR", "MENTEE"] },
          otpSecret: { not: null },
          NOT: { otpSecret: "inactive_user" },
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
        select: {
          id: true,
          otpSecret: true,
          deletedAt: true,
        },
      }),

      // Total opportunities (all opportunities, including pending)
      prisma.opportunity.count({
        where: {
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),

      // Pending opportunities
      prisma.opportunity.count({
        where: {
          status: "PENDING",
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),

      // Total mentee opportunities (opportunities created by mentees)
      prisma.opportunity.count({
        where: {
          creatorRole: "MENTEE",
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),

      // Pending mentee opportunities (mentee-created, pending approval)
      prisma.opportunity.count({
        where: {
          creatorRole: "MENTEE",
          status: "PENDING",
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
      }),

      // Total discussions (fetch all, filter by status like Discussion Management table)
      prisma.discussionThread.findMany({
        where: {
          ...(Object.keys(dateFilter).length > 0 && {
            createdAt: dateFilter,
          }),
        },
        select: {
          id: true,
          status: true,
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

      // User registrations in last 30 days (fetch all, aggregate in JS)
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: { createdAt: true },
      }),
      // Opportunity submissions in last 30 days (fetch all, aggregate in JS)
      prisma.opportunity.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: { createdAt: true },
      }),

      // User role distribution
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
      }),

      // Opportunity type distribution
      prisma.opportunity.groupBy({
        by: ['opportunityTypeId'],
        _count: {
          id: true,
        },
      }),

      // Recent activity (last 50 audit logs for better data consistency)
      prisma.auditLog.findMany({
        take: 50,
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
        where: {
          // Show activity from the last 7 days for more relevant recent data
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
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

    // After fetching userRegistrationsByDate and opportunitySubmissionsByDate as arrays of objects with createdAt
    // Aggregate counts per day in JS
    function aggregateByDay(records: { createdAt: Date | string }[]) {
      const counts: Record<string, number> = {};
      for (const rec of records) {
        const dateObj = typeof rec.createdAt === 'string' ? new Date(rec.createdAt) : rec.createdAt;
        const date = dateObj.toISOString().split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
      }
      return counts;
    }
    const userRegistrationsCounts = aggregateByDay(userRegistrationsByDate);
    const opportunitySubmissionsCounts = aggregateByDay(opportunitySubmissionsByDate);
    function getLast30Days() {
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
      }
      return days;
    }
    const last30Days = getLast30Days();
    function fillTrendDataFromCounts(counts: Record<string, number>) {
      return last30Days.map(date => ({ date, count: counts[date] || 0 }));
    }
    const userRegistrationsTrend = fillTrendDataFromCounts(userRegistrationsCounts);
    const opportunitySubmissionsTrend = fillTrendDataFromCounts(opportunitySubmissionsCounts);

    // Apply the same filtering logic as the users API (exclude recently deleted users)
    const filterRecentlyDeleted = (users: any[]) => {
      return users.filter((user) => {
        if (user.deletedAt) {
          const deletedTime = new Date(user.deletedAt).getTime();
          const currentTime = Date.now();
          const hoursSinceDeleted = (currentTime - deletedTime) / (1000 * 60 * 60);
          return hoursSinceDeleted >= 24; // Only include if deleted more than 24 hours ago
        }
        return true; // Include users that were never deleted
      });
    };

    const filteredTotalUsers = filterRecentlyDeleted(totalUsers);
    const filteredPendingUsers = filterRecentlyDeleted(pendingUsers);

    // Filter discussions by status (matching Discussion Management table logic)
    const activeDiscussions = totalDiscussions.filter((discussion: any) => discussion.status === 'ACTIVE');
    const closedDiscussions = totalDiscussions.filter((discussion: any) => discussion.status === 'CLOSED');
    const archivedDiscussions = totalDiscussions.filter((discussion: any) => discussion.status === 'ARCHIVED');

    // Total discussions = ACTIVE + CLOSED (exclude only ARCHIVED)
    const totalActiveAndClosedDiscussions = activeDiscussions.length + closedDiscussions.length;

    return NextResponse.json({
      overview: {
        totalUsers: filteredTotalUsers.length,
        pendingUsers: filteredPendingUsers.length,
        totalOpportunities,
        pendingOpportunities,
        totalMenteeOpportunities,
        pendingMenteeOpportunities,
        totalDiscussions: totalActiveAndClosedDiscussions,
        deletedDiscussions: archivedDiscussions.length,
        totalApplications,
      },
      trends: {
        userRegistrationsByDate: userRegistrationsTrend,
        opportunitySubmissionsByDate: opportunitySubmissionsTrend,
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