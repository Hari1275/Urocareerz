import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "./edge-auth";

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
}

// Admin authentication middleware for API routes
export function withAdminAuth(handler: Function) {
  return async (req: NextRequest) => {
    try {
      // Get token from cookies
      const token = req.cookies.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Verify token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const decoded = (await verifyEdgeToken(token, secret)) as AdminUser;

      // Check if user is admin
      if (decoded.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      // Add admin user to request
      (req as any).adminUser = decoded;

      return await handler(req);
    } catch (error) {
      console.error("Admin auth error:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  };
}

// Helper function to get admin user from request
export function getAdminUser(req: NextRequest): AdminUser | null {
  return (req as any).adminUser || null;
}
