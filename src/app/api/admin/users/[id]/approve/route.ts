import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// POST /api/admin/users/[id]/approve - Approve a user
export const POST = withAdminAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const userId = params.id;

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
