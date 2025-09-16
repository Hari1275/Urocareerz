import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function handler(req: NextRequest) {
  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const role = searchParams.get("role");
      const search = searchParams.get("search");

      // Build where clause for filters
      const where: Record<string, unknown> = {};

      // Temporarily disable soft delete filtering to get data back
      // where.OR = [
      //   { deletedAt: null },
      //   { deletedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Only include if deletedAt is older than 24 hours
      // ];

      if (status === "active") {
        where.otpSecret = null; // Verified users
      } else if (status === "pending") {
        where.AND = [
          { otpSecret: { not: null } }, // Has otpSecret
          { otpSecret: { not: "inactive_user" } } // But not inactive
        ];
      } else if (status === "inactive") {
        where.otpSecret = "inactive_user"; // Inactive users
      }

      if (role && role !== "all") {
        where.role = role;
      }

      if (search) {
        const searchTerms = search.trim().split(/\s+/); // Split by whitespace
        
        // Helper function to check if term matches a role
        const getRoleMatch = (term: string) => {
          const termLower = term.toLowerCase();
          if (termLower.includes('mentee')) return 'MENTEE';
          if (termLower.includes('mentor')) return 'MENTOR';
          if (termLower.includes('admin')) return 'ADMIN';
          return null;
        };
        
        if (searchTerms.length === 1) {
          // Single term search - search across all fields
          const term = searchTerms[0];
          const roleMatch = getRoleMatch(term);
          const orConditions = [
            { email: { contains: term, mode: "insensitive" } },
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
          ];
          
          // Add role condition if term matches a role
          if (roleMatch) {
            orConditions.push({ role: roleMatch });
          }
          
          // If there are existing AND conditions, combine with them
          if (where.AND) {
            where.AND = [...where.AND, { OR: orConditions }];
          } else {
            where.OR = orConditions;
          }
        } else {
          // Multi-term search - all terms must be found across any field
          const searchConditions = searchTerms.map(term => {
            const roleMatch = getRoleMatch(term);
            const orConditions = [
              { email: { contains: term, mode: "insensitive" } },
              { firstName: { contains: term, mode: "insensitive" } },
              { lastName: { contains: term, mode: "insensitive" } },
            ];
            
            // Add role condition if term matches a role
            if (roleMatch) {
              orConditions.push({ role: roleMatch });
            }
            
            return { OR: orConditions };
          });
          if (where.AND) {
            where.AND = [...where.AND, ...searchConditions];
          } else {
            where.AND = searchConditions;
          }
        }
      }

      console.log("Users API: Where clause:", JSON.stringify(where, null, 2));

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          otpSecret: true,
          deletedAt: true, // Add this to see deletedAt values
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      console.log("Users API: Found", users.length, "users");
      console.log(
        "Users API: Sample user deletedAt values:",
        users
          .slice(0, 3)
          .map((u: { id: string; deletedAt: Date | null }) => ({
            id: u.id,
            deletedAt: u.deletedAt,
          }))
      );

      // Transform data for frontend and filter out recently deleted users
      const transformedUsers = users
        .filter((user: { deletedAt: Date | null }) => {
          // Filter out users deleted in the last 24 hours
          if (user.deletedAt) {
            const deletedTime = new Date(user.deletedAt).getTime();
            const currentTime = Date.now();
            const hoursSinceDeleted =
              (currentTime - deletedTime) / (1000 * 60 * 60);
            return hoursSinceDeleted >= 24; // Only include if deleted more than 24 hours ago
          }
          return true; // Include users that were never deleted
        })
        .map(
          (user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            role: string;
            otpSecret: string | null;
            createdAt: Date;
            updatedAt: Date;
          }) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status:
              user.otpSecret === "inactive_user"
                ? "inactive"
                : user.otpSecret
                ? "pending"
                : "active",
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          })
        );
      return NextResponse.json({ users: transformedUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { email, firstName, lastName, role } = body;

      // Validate required fields
      if (!email || !firstName || !lastName || !role) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }

      // Create new user (admin-created users don't need OTP verification)
      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          role,
          // Admin-created users are automatically verified
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
        },
      });

      return NextResponse.json(
        {
          message: "User created successfully",
          user: newUser,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = withAdminAuth(handler);
export const POST = withAdminAuth(handler);
