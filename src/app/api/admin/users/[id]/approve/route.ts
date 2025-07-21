import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth, getAdminUser } from "@/lib/admin-auth";
import { sendUserApprovalEmail } from "@/lib/email";
import { AuditLogger } from "@/lib/audit-logger";

// POST /api/admin/users/[id]/approve - Approve a user
export const POST = withAdminAuth(
  async (req: NextRequest, context?: { params: Promise<{ [key: string]: string }> }) => {
    try {
      const params = await context?.params;
      const userId = params?.id;

      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      // Get admin user for audit logging
      const adminUser = getAdminUser(req);
      if (!adminUser) {
        return NextResponse.json({ error: "Admin user not found" }, { status: 401 });
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

      // Log the audit event
      await AuditLogger.logUserAction(
        "USER_APPROVED",
        userId,
        userId,
        adminUser.userId,
        {
          userEmail: updatedUser.email,
          userRole: updatedUser.role,
          adminEmail: adminUser.email,
        },
        req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
        req.headers.get("user-agent") || undefined
      );

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
