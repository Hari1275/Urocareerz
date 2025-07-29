import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

// Define the type for the application object
type ApplicationWithRelations = {
  id: string;
  opportunityId: string;
  menteeId: string;
  status: string;
  coverLetter: string | null;
  createdAt: Date;
  mentee: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    profile?: {
      resume: string | null;
    } | null;
  };
  opportunity: {
    title: string;
  };
};

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyEdgeToken(token, process.env.JWT_SECRET!);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user is a mentor
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all opportunities posted by this mentor
    const mentorOpportunities = await prisma.opportunity.findMany({
      where: { creatorId: payload.userId },
      select: { id: true },
    });

    const opportunityIds = mentorOpportunities.map((opp: { id: string }) => opp.id);

    if (opportunityIds.length === 0) {
      return NextResponse.json({ applications: [] });
    }

    // Get applications for mentor's opportunities
    const applications = await prisma.application.findMany({
      where: {
        opportunityId: { in: opportunityIds },
      },
      include: {
        opportunity: {
          select: {
            title: true,
          },
        },
        mentee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              select: {
                resume: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform the data to match the frontend interface
    const transformedApplications = applications.map((app: ApplicationWithRelations) => ({
      id: app.id,
      opportunityId: app.opportunityId,
      menteeId: app.menteeId,
      menteeName:
        `${app.mentee.firstName || ""} ${app.mentee.lastName || ""}`.trim() ||
        app.mentee.email,
      menteeEmail: app.mentee.email,
      status: app.status,
      appliedAt: app.createdAt.toISOString(),
      resumeUrl: app.mentee.profile?.resume || null,
      coverLetter: app.coverLetter,
    }));

    return NextResponse.json({ applications: transformedApplications });
  } catch (error) {
    console.error("Error fetching mentor applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
