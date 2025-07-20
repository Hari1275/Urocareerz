import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";
import { sendMenteeOpportunityRejectionEmail } from "@/lib/email";

// POST /api/admin/mentee-opportunities/[id]/reject - Reject a mentee opportunity
export const POST = withAdminAuth(async (req: NextRequest, context) => {
  try {
    const params = await context?.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { error: "Opportunity ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { adminNotes } = body;

    if (!adminNotes) {
      return NextResponse.json(
        { error: "Admin notes are required for rejection" },
        { status: 400 }
      );
    }

    // Get the mentee opportunity
    const menteeOpportunity = await prisma.menteeOpportunity.findUnique({
      where: { id },
      include: {
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        opportunityType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!menteeOpportunity) {
      return NextResponse.json(
        { error: "Mentee opportunity not found" },
        { status: 404 }
      );
    }

    if (menteeOpportunity.status !== "PENDING") {
      return NextResponse.json(
        { error: "Opportunity is not in pending status" },
        { status: 400 }
      );
    }

    // Update the mentee opportunity status
    const updatedOpportunity = await prisma.menteeOpportunity.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminFeedback: adminNotes,
        updatedAt: new Date(),
      },
      include: {
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        opportunityType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send rejection email to mentee
    try {
      await sendMenteeOpportunityRejectionEmail({
        menteeEmail: menteeOpportunity.mentee.email,
        menteeName: `${menteeOpportunity.mentee.firstName || ""} ${
          menteeOpportunity.mentee.lastName || ""
        }`.trim(),
        opportunityTitle: menteeOpportunity.title,
        opportunityType: menteeOpportunity.opportunityType.name,
        adminNotes: adminNotes,
      });
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      // Don't fail the request if email fails
    }

    console.log("Mentee opportunity rejected:", id);

    return NextResponse.json({
      message: "Opportunity rejected successfully",
      opportunity: updatedOpportunity,
    });
  } catch (error) {
    console.error("Error rejecting mentee opportunity:", error);
    return NextResponse.json(
      { error: "Failed to reject opportunity" },
      { status: 500 }
    );
  }
});
