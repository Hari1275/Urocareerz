import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opportunityId } = await params;

    // Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = await verifyEdgeToken(token, secret);

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 401 }
      );
    }

    // Check if user is mentor or mentee
    if (decoded.role !== "MENTOR" && decoded.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Mentor or mentee access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      location,
      experienceLevel,
      requirements,
      benefits,
      duration,
      compensation,
      applicationDeadline,
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Check if opportunity exists and belongs to the creator
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: {
        id: opportunityId,
      },
    });

    if (!existingOpportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Check if the opportunity belongs to the current user
    if ((existingOpportunity as any).creatorId !== decoded.userId) {
      return NextResponse.json(
        { error: "You can only edit your own opportunities" },
        { status: 403 }
      );
    }

    // Update opportunity
    const updatedOpportunity = await (prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        title,
        description,
        location,
        experienceLevel,
        requirements,
        benefits,
        duration,
        compensation,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
      },
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

    return NextResponse.json({
      opportunity: updatedOpportunity,
      message: "Opportunity updated successfully",
    });
  } catch (error) {
    console.error("Error updating opportunity:", error);
    return NextResponse.json(
      { error: "Failed to update opportunity" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opportunityId } = await params;

    const opportunity = await (prisma.opportunity.findUnique({
      where: {
        id: opportunityId,
      },
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
        _count: {
          select: {
            applications: true,
            savedOpportunities: true,
          },
        },
      } as any,
    }) as any);

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opportunityId } = await params;

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = await verifyEdgeToken(token, secret);
    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 401 }
      );
    }

    // Fetch opportunity
    const existing = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Only creator can delete
    if ((existing as any).creatorId !== decoded.userId) {
      return NextResponse.json(
        { error: "You can only delete your own opportunities" },
        { status: 403 }
      );
    }

    // Soft delete by setting deletedAt
    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { deletedAt: new Date() },
    } as any);

    return NextResponse.json({ message: "Opportunity deleted" });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    return NextResponse.json(
      { error: "Failed to delete opportunity" },
      { status: 500 }
    );
  }
}
