import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { sendApplicationStatusEmail } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyEdgeToken(token, process.env.JWT_SECRET!);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user is a mentor
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, firstName: true, lastName: true },
    });

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { status } = await request.json();

    if (!status || !["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'ACCEPTED' or 'REJECTED'" },
        { status: 400 }
      );
    }

    // Get the application and verify it belongs to an opportunity posted by this mentor
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        opportunity: {
          select: {
            mentorId: true,
            title: true,
          },
        },
        mentee: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the opportunity belongs to this mentor
    if (application.opportunity.mentorId !== payload.userId) {
      return NextResponse.json(
        {
          error:
            "Access denied. You can only review applications for your own opportunities.",
        },
        { status: 403 }
      );
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: { status },
      include: {
        opportunity: {
          select: {
            title: true,
          },
        },
        mentee: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send email notification to mentee about the status update
    try {
      const menteeName =
        `${application.mentee.firstName || ""} ${
          application.mentee.lastName || ""
        }`.trim() || application.mentee.email;
      const mentorName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Mentor";

      const emailResult = await sendApplicationStatusEmail({
        email: application.mentee.email,
        menteeName: menteeName,
        opportunityTitle: application.opportunity.title,
        status: status,
        mentorName: mentorName,
      });

      if (!emailResult.success) {
        console.error(
          "Failed to send application status email:",
          emailResult.error
        );
        // Don't fail the request if email fails, just log it
      } else {
        console.log(
          "Application status email sent successfully to:",
          application.mentee.email
        );
      }
    } catch (emailError) {
      console.error("Error sending application status email:", emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
