import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "./lib/edge-auth";

// Define which paths are protected (require authentication)
const protectedPaths = ["/dashboard", "/profile"];

// Define which paths require admin role
const adminPaths = ["/admin", "/api/admin"];

// Define which paths are public (don't require authentication)
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/verify",
  "/api/login/send-otp",
  "/api/register",
  "/api/verify-otp",
  "/api/resend-otp",
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("Middleware: Processing path:", pathname);
  console.log("Middleware: JWT_SECRET defined:", !!process.env.JWT_SECRET);

  // Check if the path is an API route
  const isApiRoute = pathname.startsWith("/api");

  // Skip middleware for public paths and non-protected API routes
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    console.log("Middleware: Skipping public path");
    return NextResponse.next();
  }

  // For protected API routes, we let the route handler handle authentication
  if (
    isApiRoute &&
    !pathname.startsWith("/api/user") &&
    !pathname.startsWith("/api/profile") &&
    !pathname.startsWith("/api/logout") &&
    !pathname.startsWith("/api/upload") &&
    !pathname.startsWith("/api/download")
  ) {
    console.log("Middleware: Skipping API route");
    return NextResponse.next();
  }

  // Check if path is protected or is a protected API route
  const isProtected =
    protectedPaths.some((path) => pathname.startsWith(path)) ||
    (isApiRoute &&
      (pathname.startsWith("/api/user") ||
        pathname.startsWith("/api/profile") ||
        pathname.startsWith("/api/logout") ||
        pathname.startsWith("/api/upload") ||
        pathname.startsWith("/api/download")));

  // Check if path requires admin role
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  // Get token from cookies
  const token = req.cookies.get("token")?.value;

  console.log("Middleware: Token found:", !!token);
  console.log(
    "Middleware: All cookies:",
    req.cookies.getAll().map((c) => c.name)
  );

  // Special handling for landing page (/) - redirect authenticated users to appropriate dashboard
  if (pathname === "/") {
    if (token) {
      try {
        // Verify token using Edge-compatible function
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error("JWT_SECRET is not defined");
        }

        const decoded = await verifyEdgeToken(token, secret);

        // User is authenticated, redirect to appropriate dashboard based on role
        if (decoded.role === "MENTOR") {
          return NextResponse.redirect(new URL("/dashboard/mentor", req.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } catch {
        // Token is invalid, continue to show landing page
        return NextResponse.next();
      }
    }
    // No token, show landing page
    return NextResponse.next();
  }

  if (isProtected || isAdminPath) {
    console.log("Middleware: Processing protected path");

    // If no token, redirect to login
    if (!token) {
      console.log("Middleware: No token found, redirecting to login");
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify token using Edge-compatible function
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const decoded = await verifyEdgeToken(token, secret);

      console.log(
        "Middleware: Token verified successfully, user role:",
        decoded.role
      );

      // Check if the path requires admin role and the user is not an admin
      if (isAdminPath && decoded.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Token is valid, continue
      console.log("Middleware: Token valid, continuing to protected path");
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware: Token verification failed:", error);
      // Token is invalid, redirect to login
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // For all other routes, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
