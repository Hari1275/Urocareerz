import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyEdgeToken(token, process.env.JWT_SECRET!);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get the ID from params
    const opportunityId = params.id;
    if (!opportunityId) {
      return NextResponse.json({ error: "Missing opportunity id" }, { status: 400 });
    }

    console.log("API route: Fetching opportunity with ID:", opportunityId);

    // Get the opportunity with mentor details
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        opportunityType: true,
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                specialty: true,
              },
            },
          },
        },
      },
    });

    if (!opportunity) {
      console.log("API route: Opportunity not found with ID:", opportunityId);
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    console.log("API route: Found opportunity:", {
      id: opportunity.id,
      title: opportunity.title,
      hasOpportunityType: !!opportunity.opportunityType,
      hasMentor: !!opportunity.mentor
    });

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
