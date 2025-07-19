import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// POST /api/admin/opportunities/[id]/approve - Approve an opportunity
export const POST = withAdminAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const opportunityId = params.id;

      // Find the opportunity
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
      });

      if (!opportunity) {
        return NextResponse.json(
          { error: "Opportunity not found" },
          { status: 404 }
        );
      }

      // Update the opportunity status to approved
      const updatedOpportunity = await prisma.opportunity.update({
        where: { id: opportunityId },
        data: { status: "APPROVED" },
        include: {
          mentor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Opportunity approved successfully",
        opportunity: updatedOpportunity,
      });
    } catch (error) {
      console.error("Error approving opportunity:", error);
      return NextResponse.json(
        { error: "Failed to approve opportunity" },
        { status: 500 }
      );
    }
  }
);
