import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

export async function GET(request: NextRequest) {
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

    // Verify user is a mentee
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || user.role !== "MENTEE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get saved opportunities for the user
    const savedOpportunities = await prisma.savedOpportunity.findMany({
      where: { userId: payload.userId },
      include: {
        opportunity: {
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                profile: {
                  select: {
                    specialty: true,
                  },
                },
              },
            },
            opportunityType: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedOpportunities });
  } catch (error) {
    console.error("Error fetching saved opportunities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Verify user is a mentee
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || user.role !== "MENTEE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { opportunityId } = await request.json();

    if (!opportunityId) {
      return NextResponse.json(
        { error: "Opportunity ID is required" },
        { status: 400 }
      );
    }

    // Check if opportunity exists and is approved
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { status: true },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    if (opportunity.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Cannot save unapproved opportunity" },
        { status: 400 }
      );
    }

    // Check if already saved
    const existingSave = await prisma.savedOpportunity.findUnique({
      where: {
        userId_opportunityId: {
          userId: payload.userId,
          opportunityId: opportunityId,
        },
      },
    });

    if (existingSave) {
      return NextResponse.json(
        { error: "Opportunity already saved" },
        { status: 400 }
      );
    }

    // Save the opportunity
    const savedOpportunity = await prisma.savedOpportunity.create({
      data: {
        userId: payload.userId,
        opportunityId: opportunityId,
      },
      include: {
        opportunity: {
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                profile: {
                  select: {
                    specialty: true,
                  },
                },
              },
            },
            opportunityType: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ savedOpportunity }, { status: 201 });
  } catch (error) {
    console.error("Error saving opportunity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Verify user is a mentee
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || user.role !== "MENTEE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { opportunityId } = await request.json();

    if (!opportunityId) {
      return NextResponse.json(
        { error: "Opportunity ID is required" },
        { status: 400 }
      );
    }

    // Delete the saved opportunity
    await prisma.savedOpportunity.delete({
      where: {
        userId_opportunityId: {
          userId: payload.userId,
          opportunityId: opportunityId,
        },
      },
    });

    return NextResponse.json({
      message: "Opportunity removed from saved list",
    });
  } catch (error) {
    console.error("Error removing saved opportunity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
