import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@/generated/prisma";
import { PrismaClient } from "@prisma/client";

import { verifyEdgeToken } from "@/lib/edge-auth";

const prisma = new PrismaClient();

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

    // Get user and verify they are a mentor
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors can post opportunities" },
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

    // Create the opportunity
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
        mentorId: user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Opportunity posted successfully",
        opportunity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error posting opportunity:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get opportunities based on user role
    let opportunities;
    if (user.role === "MENTOR") {
      // Mentors see their own opportunities
      opportunities = await prisma.opportunity.findMany({
        where: { mentorId: user.id },
        include: {
          mentor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          opportunityType: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "ADMIN") {
      // Admins see all opportunities
      opportunities = await prisma.opportunity.findMany({
        include: {
          mentor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          opportunityType: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Mentees see only approved opportunities
      opportunities = await prisma.opportunity.findMany({
        where: { status: "APPROVED" },
        include: {
          mentor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          opportunityType: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
