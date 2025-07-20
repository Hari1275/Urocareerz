import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";
import { sendOpportunityApprovalEmail } from "@/lib/email";

// POST /api/admin/opportunities/[id]/approve - Approve an opportunity
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

      // Send email notification to mentor
      try {
        const mentorName =
          `${updatedOpportunity.mentor.firstName || ""} ${
            updatedOpportunity.mentor.lastName || ""
          }`.trim() || "Mentor";

        const emailResult = await sendOpportunityApprovalEmail({
          email: updatedOpportunity.mentor.email,
          mentorName: mentorName,
          opportunityTitle: updatedOpportunity.title,
        });

        if (!emailResult.success) {
          console.error(
            "Failed to send opportunity approval email:",
            emailResult.error
          );
          // Don't fail the request if email fails, just log it
        } else {
          console.log(
            "Opportunity approval email sent successfully to:",
            updatedOpportunity.mentor.email
          );
        }
      } catch (emailError) {
        console.error("Error sending opportunity approval email:", emailError);
        // Don't fail the request if email fails, just log it
      }

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
