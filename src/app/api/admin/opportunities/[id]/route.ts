import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
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

  if (req.method === "GET") {
    try {
      const opportunity = await prisma.opportunity.findUnique({
        where: {
          id: opportunityId,
        },
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              applications: true,
              savedOpportunities: true,
            },
          },
        },
      });

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

  if (req.method === "PUT") {
    try {
      const body = await req.json();
      const {
        title,
        description,
        location,
        experienceLevel,
        opportunityType,
        status,
        requirements,
        benefits,
        duration,
        compensation,
        applicationDeadline,
      } = body;

      // Validate required fields
      if (!title || !description || !opportunityType || !status) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if opportunity exists
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

      // Update opportunity
      const updatedOpportunity = await prisma.opportunity.update({
        where: { id: opportunityId },
        data: {
          title,
          description,
          location,
          experienceLevel,
          opportunityType,
          status,
          requirements,
          benefits,
          duration,
          compensation,
          applicationDeadline: applicationDeadline
            ? new Date(applicationDeadline)
            : null,
        },
        include: {
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

  if (req.method === "DELETE") {
    try {
      // Check if opportunity exists
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

      // Soft delete the opportunity
      await prisma.opportunity.update({
        where: { id: opportunityId },
        data: {
          deletedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Opportunity deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      return NextResponse.json(
        { error: "Failed to delete opportunity" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = withAdminAuth(handler);
export const PUT = withAdminAuth(handler);
export const DELETE = withAdminAuth(handler);
