import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth, getAdminUser } from "@/lib/admin-auth";
import { AuditLogger } from "@/lib/audit-logger";

// POST /api/admin/opportunities/[id]/reject - Reject an opportunity
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

    // Update the opportunity status to rejected
    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: "REJECTED" },
    });

    // Log the audit event
    await AuditLogger.logOpportunityAction(
      "OPPORTUNITY_REJECTED",
      opportunityId,
      adminUser.userId,
      {
        opportunityTitle: updatedOpportunity.title,
        adminEmail: adminUser.email,
      },
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
      req.headers.get("user-agent") || undefined
    );

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

export const POST = withAdminAuth(handler);
