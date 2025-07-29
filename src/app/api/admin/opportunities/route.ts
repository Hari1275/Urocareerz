import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, getAdminUser } from "@/lib/admin-auth";
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

      const opportunities = await (prisma.opportunity.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          opportunityType: true,
          _count: {
            select: {
              applications: true,
              savedOpportunities: true,
            },
          },
        } as any,
        orderBy: { createdAt: "desc" },
      }) as any);

      return NextResponse.json({ opportunities });
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
        creatorId,
        creatorRole,
      } = body;

      // Validate required fields
      if (!title || !description || !opportunityTypeId || !status) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if creator exists and has the correct role
      if (creatorId) {
        const creator = await prisma.user.findUnique({
          where: {
            id: creatorId,
            role: creatorRole || "MENTOR",
          },
        });

        if (!creator) {
          return NextResponse.json(
            { error: "Invalid creator selected" },
            { status: 400 }
          );
        }
      }

      // Create new opportunity
      const newOpportunity = await (prisma.opportunity.create({
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
          creatorId: creatorId || null,
          creatorRole: creatorRole || "MENTOR",
        } as any,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          opportunityType: true,
        } as any,
      }) as any);

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

  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export const GET = withAdminAuth(handler);
export const POST = withAdminAuth(handler);
