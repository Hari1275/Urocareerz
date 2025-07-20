import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = await verifyEdgeToken(token, secret);

    // Update user to mark terms as accepted
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { termsAccepted: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        termsAccepted: true,
      },
    });

    return NextResponse.json({
      message: "Terms accepted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error accepting terms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
