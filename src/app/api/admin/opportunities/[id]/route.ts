import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: opportunityId } = await params;

  if (req.method === "GET") {
    try {
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

  if (req.method === "PUT") {
    try {
      const body = await req.json();

      const {
        title,
        description,
        location,
        experienceLevel,
        opportunityTypeId,
        status,
        requirements,
        benefits,
        duration,
        compensation,
        applicationDeadline,
        creatorId,
      } = body;

      // Validate required fields
      if (!title || !description || !opportunityTypeId || !status) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if opportunity exists
      const existingOpportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
      });

      if (!existingOpportunity) {
        return NextResponse.json(
          { error: "Opportunity not found" },
          { status: 404 }
        );
      }

      // Check if creator exists and has the correct role
      if (creatorId) {
        const creator = await prisma.user.findUnique({
          where: {
            id: creatorId,
            role: "MENTOR",
          },
        });

        if (!creator) {
          return NextResponse.json(
            { error: "Invalid creator selected" },
            { status: 400 }
          );
        }
      }

      // Update opportunity
      const updatedOpportunity = await (prisma.opportunity.update({
        where: { id: opportunityId },
        data: {
          title,
          description,
          location,
          experienceLevel,
          opportunityTypeId,
          status,
          requirements,
          benefits,
          duration,
          compensation,
          applicationDeadline: applicationDeadline
            ? new Date(applicationDeadline)
            : null,
          creatorId: creatorId || (existingOpportunity as any).creatorId,
          creatorRole: "MENTOR",
        } as any,
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
        where: { id: opportunityId },
      });

      if (!existingOpportunity) {
        return NextResponse.json(
          { error: "Opportunity not found" },
          { status: 404 }
        );
      }

      // Soft delete the opportunity
      await (prisma.opportunity.update({
        where: { id: opportunityId },
        data: { deletedAt: new Date() },
      }) as any);

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

  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export const GET = withAdminAuth(handler);
export const PUT = withAdminAuth(handler);
export const DELETE = withAdminAuth(handler);
