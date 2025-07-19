import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// DELETE /api/admin/opportunities/[id] - Delete an opportunity
export const DELETE = withAdminAuth(
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

      // Delete the opportunity (cascade will handle related records)
      await prisma.opportunity.delete({
        where: { id: opportunityId },
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
);
