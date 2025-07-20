import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

// GET /api/mentee-opportunities - Get mentee's submitted opportunities
export async function GET(req: NextRequest) {
  try {
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
    const userId = decoded.userId;

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only mentees can view their own submissions
    if (user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Access denied. Only mentees can view their submissions." },
        { status: 403 }
      );
    }

    // Get mentee's submitted opportunities
    const opportunities = await prisma.menteeOpportunity.findMany({
      where: {
        menteeId: userId,
        deletedAt: null,
      },
      include: {
        opportunityType: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Error fetching mentee opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}

// POST /api/mentee-opportunities - Submit a new opportunity for admin approval
export async function POST(req: NextRequest) {
  try {
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
    const userId = decoded.userId;

    // Get user to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only mentees can submit opportunities
    if (user.role !== "MENTEE") {
      return NextResponse.json(
        { error: "Access denied. Only mentees can submit opportunities." },
        { status: 403 }
      );
    }

    const body = await req.json();
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
        { error: "Title, description, and opportunity type are required" },
        { status: 400 }
      );
    }

    // Validate opportunity type exists
    const opportunityType = await prisma.opportunityType.findUnique({
      where: { id: opportunityTypeId },
    });

    if (!opportunityType) {
      return NextResponse.json(
        { error: "Invalid opportunity type" },
        { status: 400 }
      );
    }

    // Create mentee opportunity submission
    const menteeOpportunity = await prisma.menteeOpportunity.create({
      data: {
        title,
        description,
        location,
        experienceLevel,
        opportunityTypeId,
        menteeId: userId,
        requirements,
        benefits,
        duration,
        compensation,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
        sourceUrl,
        sourceName,
        status: "PENDING",
      },
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
    });

    console.log("Mentee opportunity submitted:", menteeOpportunity.id);

    return NextResponse.json({
      message: "Opportunity submitted successfully for admin review",
      opportunity: menteeOpportunity,
    });
  } catch (error) {
    console.error("Error submitting mentee opportunity:", error);
    return NextResponse.json(
      { error: "Failed to submit opportunity" },
      { status: 500 }
    );
  }
}
