import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function handler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (req.method === "GET") {
    try {
      const opportunityId = params.id;

      // Verify the opportunity exists
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
        select: { id: true, title: true },
      });

      if (!opportunity) {
        return NextResponse.json(
          { error: "Opportunity not found" },
          { status: 404 }
        );
      }

      // Fetch applications with mentee details
      const applications = await prisma.application.findMany({
        where: {
          opportunityId: opportunityId,
        },
        include: {
          mentee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Extract mentee details from applications
      const mentees = applications.map((app: any) => ({
        id: app.mentee.id,
        firstName: app.mentee.firstName,
        lastName: app.mentee.lastName,
        email: app.mentee.email,
        role: app.mentee.role,
        createdAt: app.createdAt.toISOString(), // Use application date, not user creation date
      }));

      return NextResponse.json({ applications: mentees });
    } catch (error) {
      console.error("Error fetching applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
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