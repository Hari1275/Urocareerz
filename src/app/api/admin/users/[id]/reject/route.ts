import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// POST /api/admin/users/[id]/reject - Reject a user
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

      // For rejection, we could either:
      // 1. Delete the user completely
      // 2. Mark them as rejected (would need a status field)
      // 3. Keep them but prevent login (by setting a rejected flag)

      // Soft delete the user
      await prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "User rejected and deleted successfully",
      });
    } catch (error) {
      console.error("Error rejecting user:", error);
      return NextResponse.json(
        { error: "Failed to reject user" },
        { status: 500 }
      );
    }
  }
);
