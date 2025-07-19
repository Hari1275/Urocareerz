import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// GET /api/admin/users - List all users with optional filtering
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    // Build where clause
    const where: any = {};

    if (status === "pending") {
      // For OTP-based auth, we consider users "pending" if they haven't verified their email
      // This would need to be adjusted based on your specific business logic
      where.otpSecret = { not: null };
    }

    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        otpSecret: true, // To determine if user is verified
        profile: {
          select: {
            id: true,
            bio: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data to include verification status
    const transformedUsers = users.map((user) => ({
      ...user,
      isVerified: !user.otpSecret, // User is verified if no OTP secret exists
      status: user.otpSecret ? "pending" : "active",
      otpSecret: undefined, // Remove sensitive data
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
});
