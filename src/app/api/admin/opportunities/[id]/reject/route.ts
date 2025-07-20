import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// POST /api/admin/opportunities/[id]/reject - Reject an opportunity
export const POST = withAdminAuth(
  async (req: NextRequest, context?: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context?.params;
      const opportunityId = params?.id;

      if (!opportunityId) {
        return NextResponse.json(
          { error: "Opportunity ID is required" },
          { status: 400 }
        );
      }

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

      // Update the opportunity status to rejected
      const updatedOpportunity = await prisma.opportunity.update({
        where: { id: opportunityId },
        data: { status: "REJECTED" },
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
        message: "Opportunity rejected successfully",
        opportunity: updatedOpportunity,
      });
    } catch (error) {
      console.error("Error rejecting opportunity:", error);
      return NextResponse.json(
        { error: "Failed to reject opportunity" },
        { status: 500 }
      );
    }
  }
);
