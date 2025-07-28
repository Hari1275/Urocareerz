import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { prisma } from "@/lib/prisma";

async function handler(
  req: NextRequest,
  context?: { params: Promise<{ id: string }> }
) {
  const params = await context?.params;
  const opportunityId = params?.id;

  if (!opportunityId) {
    return NextResponse.json(
      { error: "Opportunity ID is required" },
      { status: 400 }
    );
  }

  if (req.method === "PUT") {
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

      if (!decoded) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        );
      }

      // Check if user is mentor
      if (decoded.role !== "MENTOR") {
        return NextResponse.json(
          { error: "Mentor access required" },
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

      // Check if opportunity exists and belongs to the mentor
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

      // Check if the opportunity belongs to the current mentor
      if (existingOpportunity.mentorId !== decoded.userId) {
        return NextResponse.json(
          { error: "You can only edit your own opportunities" },
          { status: 403 }
        );
      }

      // Update opportunity
      const updatedOpportunity = await prisma.opportunity.update({
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
          opportunityType: true,
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Opportunity updated successfully",
        opportunity: updatedOpportunity,
      });
    } catch (error) {
      console.error("Error updating opportunity:", error);
      return NextResponse.json(
        { error: "Failed to update opportunity" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const PUT = handler;
