import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/opportunity-types - Get all active opportunity types (public)
export async function GET(req: NextRequest) {
  try {
    const opportunityTypes = await prisma.opportunityType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ opportunityTypes });
  } catch (error) {
    console.error("Error fetching opportunity types:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunity types" },
      { status: 500 }
    );
  }
}
