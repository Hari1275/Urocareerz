import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";
import { sendMenteeOpportunityApprovalEmail } from "@/lib/email";

// POST /api/admin/mentee-opportunities/[id]/approve - Approve a mentee opportunity
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
    const { adminNotes, convertToRegular } = body;

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
        status: convertToRegular ? "CONVERTED" : "APPROVED",
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

    // If converting to regular opportunity, create a new opportunity
    if (convertToRegular) {
      // Find an admin user to assign as mentor
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (adminUser) {
        await prisma.opportunity.create({
          data: {
            title: menteeOpportunity.title,
            description: menteeOpportunity.description,
            location: menteeOpportunity.location,
            experienceLevel: menteeOpportunity.experienceLevel,
            opportunityTypeId: menteeOpportunity.opportunityTypeId,
            mentorId: adminUser.id,
            requirements: menteeOpportunity.requirements,
            benefits: menteeOpportunity.benefits,
            duration: menteeOpportunity.duration,
            compensation: menteeOpportunity.compensation,
            applicationDeadline: menteeOpportunity.applicationDeadline,
            status: "APPROVED",
          },
        });
      }
    }

    // Send approval email to mentee
    try {
      await sendMenteeOpportunityApprovalEmail({
        menteeEmail: menteeOpportunity.mentee.email,
        menteeName: `${menteeOpportunity.mentee.firstName || ""} ${
          menteeOpportunity.mentee.lastName || ""
        }`.trim(),
        opportunityTitle: menteeOpportunity.title,
        opportunityType: menteeOpportunity.opportunityType.name,
        isConverted: convertToRegular,
        adminNotes: adminNotes || "",
      });
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Don't fail the request if email fails
    }

    console.log("Mentee opportunity approved:", id);

    return NextResponse.json({
      message: convertToRegular
        ? "Opportunity approved and converted to regular opportunity"
        : "Opportunity approved successfully",
      opportunity: updatedOpportunity,
    });
  } catch (error) {
    console.error("Error approving mentee opportunity:", error);
    return NextResponse.json(
      { error: "Failed to approve opportunity" },
      { status: 500 }
    );
  }
});
