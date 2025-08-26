import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get user and verify they are a mentee
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Only mentees can edit their submitted opportunities" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if the opportunity exists and belongs to the user
    const existingOpportunity = await prisma.opportunity.findFirst({
      where: {
        id,
        creatorId: user.id,
        creatorRole: "MENTEE",
      },
    });

    if (!existingOpportunity) {
      return NextResponse.json(
        { error: "Opportunity not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    // Only allow editing if status is PENDING
    if (existingOpportunity.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending submissions can be edited" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
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
      sourceUrl,
      sourceName,
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        {
          error: "Title and description are required",
        },
        { status: 400 }
      );
    }

    // Update the opportunity
    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        title,
        description,
        location: location || null,
        experienceLevel: experienceLevel || null,
        requirements: requirements || null,
        benefits: benefits || null,
        duration: duration || null,
        compensation: compensation || null,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
        sourceUrl: sourceUrl || null,
        sourceName: sourceName || null,
        updatedAt: new Date(),
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
        opportunityType: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Opportunity updated successfully",
      opportunity: updatedOpportunity,
    });
  } catch (error) {
    console.error("Error updating mentee opportunity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get user and verify they are a mentee
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Only mentees can delete their submitted opportunities" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if the opportunity exists and belongs to the user
    const existingOpportunity = await prisma.opportunity.findFirst({
      where: {
        id,
        creatorId: user.id,
        creatorRole: "MENTEE",
      },
    });

    if (!existingOpportunity) {
      return NextResponse.json(
        { error: "Opportunity not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Only allow deletion if status is PENDING
    if (existingOpportunity.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending submissions can be deleted" },
        { status: 400 }
      );
    }

    // Delete the opportunity
    await prisma.opportunity.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Opportunity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting mentee opportunity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}