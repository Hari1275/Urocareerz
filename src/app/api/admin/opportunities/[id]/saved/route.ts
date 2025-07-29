import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opportunityId } = await params;

    // Verify the opportunity exists
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { id: true, title: true },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Fetch saved opportunities with user details
    const savedOpportunities = await prisma.savedOpportunity.findMany({
      where: {
        opportunityId: opportunityId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Extract user details from saved opportunities
    const users = savedOpportunities.map((saved: any) => ({
      id: saved.user.id,
      firstName: saved.user.firstName,
      lastName: saved.user.lastName,
      email: saved.user.email,
      role: saved.user.role,
      createdAt: saved.createdAt.toISOString(),
    }));

    return NextResponse.json({ savedOpportunities: users });
  } catch (error) {
    console.error("Error fetching saved opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved opportunities" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler); 