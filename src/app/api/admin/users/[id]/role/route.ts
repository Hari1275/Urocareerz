import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// PUT /api/admin/users/[id]/role - Update user role
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
      const { role } = await req.json();

      // Validate role
      const validRoles = ["MENTEE", "MENTOR", "ADMIN"];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: "Invalid role. Must be one of: MENTEE, MENTOR, ADMIN" },
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

      // Update the user's role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
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
        message: "User role updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      return NextResponse.json(
        { error: "Failed to update user role" },
        { status: 500 }
      );
    }
  }
);
