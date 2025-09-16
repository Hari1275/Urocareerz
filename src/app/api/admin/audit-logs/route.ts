import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth, getAdminUser } from "@/lib/admin-auth";

async function getAuditLogs(request: NextRequest) {
  try {
    // Get admin user from request (set by withAdminAuth middleware)
    const adminUser = getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (action) {
      where.action = action;
    }
    
    if (entityType) {
      where.entityType = entityType;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        // Parse date and set to start of day in UTC
        const start = new Date(startDate + 'T00:00:00.000Z');
        where.createdAt.gte = start;
      }
      if (endDate) {
        // Parse date and set to end of day in UTC
        const end = new Date(endDate + 'T23:59:59.999Z');
        where.createdAt.lte = end;
      }
    }

    // Fetch audit logs with user information
    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
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
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      auditLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the function wrapped with admin authentication
export const GET = withAdminAuth(getAuditLogs); 