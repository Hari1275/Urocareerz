import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// GET /api/admin/mentee-opportunities - Get all mentee opportunity submissions
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.opportunityTypeId = type;
    }

    // Get mentee opportunities with pagination
    const [opportunities, total] = await Promise.all([
      prisma.menteeOpportunity.findMany({
        where,
        include: {
          opportunityType: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          mentee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.menteeOpportunity.count({ where }),
    ]);

    // Get opportunity types for filtering
    const opportunityTypes = await prisma.opportunityType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      opportunities,
      opportunityTypes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching mentee opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentee opportunities" },
      { status: 500 }
    );
  }
});
