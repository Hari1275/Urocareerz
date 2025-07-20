import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";
import { sendUserApprovalEmail } from "@/lib/email";

// POST /api/admin/users/[id]/approve - Approve a user
export const POST = withAdminAuth(
  async (req: NextRequest, context?: { params: Promise<{ id: string }> }) => {
    try {
      const params = await context?.params;
      const userId = params?.id;

      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // For OTP-based auth, "approving" means clearing the OTP secret
      // This effectively verifies the user's email
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          otpSecret: null,
          otpExpiry: null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Send email notification to user
      try {
        const userName =
          `${updatedUser.firstName || ""} ${
            updatedUser.lastName || ""
          }`.trim() || updatedUser.email;

        const emailResult = await sendUserApprovalEmail({
          email: updatedUser.email,
          userName: userName,
        });

        if (!emailResult.success) {
          console.error(
            "Failed to send user approval email:",
            emailResult.error
          );
          // Don't fail the request if email fails, just log it
        } else {
          console.log(
            "User approval email sent successfully to:",
            updatedUser.email
          );
        }
      } catch (emailError) {
        console.error("Error sending user approval email:", emailError);
        // Don't fail the request if email fails, just log it
      }

      return NextResponse.json({
        message: "User approved successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error approving user:", error);
      return NextResponse.json(
        { error: "Failed to approve user" },
        { status: 500 }
      );
    }
  }
);
