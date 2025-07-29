import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth, getAdminUser } from "@/lib/admin-auth";
import { sendOpportunityApprovalEmail } from "@/lib/email";
import { AuditLogger } from "@/lib/audit-logger";

// POST /api/admin/opportunities/[id]/approve - Approve an opportunity
async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = getAdminUser(req);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: opportunityId } = await params;

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
    });

    // Fetch creator details separately to avoid TypeScript cache issues
    const creator = await prisma.user.findUnique({
      where: { id: (opportunity as any).creatorId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // Send email notification to creator
    const creatorName = `${
      creator.firstName || ""
    } ${
      creator.lastName || ""
    }`.trim();

    await sendOpportunityApprovalEmail({
      email: creator.email,
      mentorName: creatorName,
      opportunityTitle: updatedOpportunity.title,
    });

    // Log the audit event
    await AuditLogger.logOpportunityAction(
      "OPPORTUNITY_APPROVED",
      opportunityId,
      adminUser.userId,
      {
        opportunityTitle: updatedOpportunity.title,
        creatorEmail: creator.email,
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

export const POST = withAdminAuth(handler);
