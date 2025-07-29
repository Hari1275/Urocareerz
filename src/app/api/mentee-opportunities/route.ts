import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

export async function POST(request: NextRequest) {
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
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Only mentees can submit opportunities" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      location,
      experienceLevel,
      opportunityTypeId,
      requirements,
      benefits,
      duration,
      compensation,
      applicationDeadline,
      sourceUrl,
      sourceName,
    } = body;

    // Validate required fields
    if (!title || !description || !opportunityTypeId) {
      return NextResponse.json(
        {
          error: "Title, description, and opportunity type are required",
        },
        { status: 400 }
      );
    }

    // Create the opportunity with mentee submission structure
    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        location,
        experienceLevel,
        opportunityTypeId,
        requirements,
        benefits,
        duration,
        compensation,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
        creatorId: user.id,
        creatorRole: user.role,
        sourceUrl,
        sourceName,
        status: "PENDING", // Mentee submissions start as pending for admin approval
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
      message: "Opportunity submitted successfully",
      opportunity,
    });
  } catch (error) {
    console.error("Error creating mentee opportunity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
        { error: "Only mentees can view their submitted opportunities" },
        { status: 403 }
      );
    }

    // Get opportunities submitted by this mentee
    const opportunities = await prisma.opportunity.findMany({
      where: {
        creatorId: user.id,
        creatorRole: "MENTEE",
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      opportunities,
    });
  } catch (error) {
    console.error("Error fetching mentee opportunities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 