import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// PUT /api/admin/users/[id]/status - Update user status
export const PUT = withAdminAuth(
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

      const { status } = await req.json();

      // Validate status
      const validStatuses = ["active", "inactive"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status. Must be one of: active, inactive" },
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

      // Update the user's status
      // For active status, clear OTP secret (verified)
      // For inactive status, set OTP secret (unverified)
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          otpSecret: status === "active" ? null : "inactive_user",
          otpExpiry:
            status === "active"
              ? null
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          otpSecret: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        message: `User status updated to ${status} successfully`,
        user: {
          ...updatedUser,
          status: updatedUser.otpSecret ? "inactive" : "active",
        },
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      return NextResponse.json(
        { error: "Failed to update user status" },
        { status: 500 }
      );
    }
  }
);
