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

      // Fetch saved opportunities with mentee details
      const savedOpportunities = await prisma.savedOpportunity.findMany({
        where: {
          opportunityId: opportunityId,
        },
        include: {
          user: {
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

      // Extract mentee details from saved opportunities
      const mentees = savedOpportunities.map((saved: any) => ({
        id: saved.user.id,
        firstName: saved.user.firstName,
        lastName: saved.user.lastName,
        email: saved.user.email,
        role: saved.user.role,
        createdAt: saved.createdAt.toISOString(), // Use saved date
      }));

      return NextResponse.json({ savedMentees: mentees });
    } catch (error) {
      console.error("Error fetching saved mentees:", error);
      return NextResponse.json(
        { error: "Failed to fetch saved mentees" },
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