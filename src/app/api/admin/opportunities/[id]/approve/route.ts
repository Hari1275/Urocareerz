import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth, getAdminUser } from "@/lib/admin-auth";
import { sendOpportunityApprovalEmail } from "@/lib/email";
import { AuditLogger } from "@/lib/audit-logger";

// POST /api/admin/opportunities/[id]/approve - Approve an opportunity
export const POST = withAdminAuth(
  async (req: NextRequest, context?: { params: Promise<{ [key: string]: string }> }) => {
    try {
      const params = await context?.params;
      const opportunityId = params?.id;

      if (!opportunityId) {
        return NextResponse.json(
          { error: "Opportunity ID is required" },
          { status: 400 }
        );
      }

      // Get admin user for audit logging
      const adminUser = getAdminUser(req);
      if (!adminUser) {
        return NextResponse.json({ error: "Admin user not found" }, { status: 401 });
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

      // Log the audit event
      await AuditLogger.logOpportunityAction(
        "OPPORTUNITY_APPROVED",
        opportunityId,
        adminUser.userId,
        {
          opportunityTitle: updatedOpportunity.title,
          mentorEmail: updatedOpportunity.mentor.email,
          adminEmail: adminUser.email,
        },
        req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
        req.headers.get("user-agent") || undefined
      );

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
