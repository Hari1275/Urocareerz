import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("User API: Starting authentication check");
    console.log("User API: JWT_SECRET defined:", !!process.env.JWT_SECRET);

    // Get token from cookies
    const token = req.cookies.get("token")?.value;
    console.log("User API: Token found:", !!token);
    console.log(
      "User API: All cookies:",
      req.cookies.getAll().map((c) => c.name)
    );

    if (!token) {
      console.log("User API: No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify token using Edge-compatible function
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("User API: JWT_SECRET is not defined");
      throw new Error("JWT_SECRET is not defined");
    }

    console.log("User API: Verifying token...");
    const decoded = await verifyEdgeToken(token, secret);
    console.log(
      "User API: Token verified successfully, user ID:",
      decoded.userId
    );

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        termsAccepted: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user,
      message: "User authenticated successfully",
    });
  } catch (error) {
    console.error("User auth check error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
