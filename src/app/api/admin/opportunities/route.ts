import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function handler(req: NextRequest) {
  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const type = searchParams.get("type");
      const search = searchParams.get("search");

      // Build where clause for filters
      const where: Record<string, unknown> = {};

      // Temporarily disable soft delete filtering to get data back
      // where.OR = [
      //   { deletedAt: null },
      //   { deletedAt: { lt: new Date(Date.now() - 24 * 60 * 1000) } }, // Only include if deletedAt is older than 24 hours
      // ];

      if (status && status !== "all") {
        where.status = status;
      }

      if (type && type !== "all") {
        where.opportunityType = {
          name: type,
        };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ];
      }

      const opportunities = await prisma.opportunity.findMany({
        where,
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          opportunityType: true,
          _count: {
            select: {
              applications: true,
              savedOpportunities: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Filter out recently deleted opportunities
      const filteredOpportunities = opportunities.filter(
        (opportunity: { deletedAt: Date | null }) => {
          // Filter out opportunities deleted in the last 24 hours
          if (opportunity.deletedAt) {
            const deletedTime = new Date(opportunity.deletedAt).getTime();
            const currentTime = Date.now();
            const hoursSinceDeleted =
              (currentTime - deletedTime) / (1000 * 60 * 60);
            return hoursSinceDeleted >= 24; // Only include if deleted more than 24 hours ago
          }
          return true; // Include opportunities that were never deleted
        }
      );

      return NextResponse.json({ opportunities: filteredOpportunities });
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      return NextResponse.json(
        { error: "Failed to fetch opportunities" },
        { status: 500 }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const {
        title,
        description,
        location,
        experienceLevel,
        opportunityTypeId,
        status,
        requirements,
        benefits,
        duration,
        compensation,
        applicationDeadline,
        mentorId,
      } = body;

      // Validate required fields
      if (!title || !description || !opportunityTypeId || !status) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if mentor exists and is a mentor
      if (mentorId) {
        const mentor = await prisma.user.findUnique({
          where: {
            id: mentorId,
            role: "MENTOR",
          },
        });

        if (!mentor) {
          return NextResponse.json(
            { error: "Invalid mentor selected" },
            { status: 400 }
          );
        }
      }

      // Create new opportunity
      const newOpportunity = await prisma.opportunity.create({
        data: {
          title,
          description,
          location,
          experienceLevel,
          opportunityTypeId,
          status,
          requirements,
          benefits,
          duration,
          compensation,
          applicationDeadline: applicationDeadline
            ? new Date(applicationDeadline)
            : null,
          mentorId: mentorId || null,
        },
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          opportunityType: true,
        },
      });

      return NextResponse.json(
        {
          message: "Opportunity created successfully",
          opportunity: newOpportunity,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating opportunity:", error);
      return NextResponse.json(
        { error: "Failed to create opportunity" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export const GET = withAdminAuth(handler);
export const POST = withAdminAuth(handler);
