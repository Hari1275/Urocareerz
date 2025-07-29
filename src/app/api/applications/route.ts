import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { sendApplicationSubmissionEmail } from "@/lib/email";

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

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let applications;

    if (user.role === "MENTEE") {
      // Mentees see their own applications
      applications = await (prisma.application.findMany({
        where: { menteeId: payload.userId },
        include: {
          opportunity: {
            include: {
              opportunityType: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  color: true,
                },
              },
              creator: {
                select: {
                  firstName: true,
                  lastName: true,
                  profile: {
                    select: {
                      specialty: true,
                    },
                  },
                },
              },
            } as any,
          },
        },
        orderBy: { createdAt: "desc" },
      }) as any);
    } else if (user.role === "MENTOR") {
      // Mentors see applications for their opportunities
      applications = await (prisma.application.findMany({
        where: {
          opportunity: {
            creatorId: payload.userId,
          } as any,
        },
        include: {
          opportunity: {
            include: {
              opportunityType: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  color: true,
                },
              },
            },
          },
          mentee: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }) as any);
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Verify user is a mentee
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    if (!user || user.role !== "MENTEE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { opportunityId, coverLetter, resumeUrl } =
      await request.json();

    if (!opportunityId) {
      return NextResponse.json(
        { error: "Opportunity ID is required" },
        { status: 400 }
      );
    }

    // Check if opportunity exists and is approved
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { status: true },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    if (opportunity.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Cannot apply to unapproved opportunity" },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        menteeId_opportunityId: {
          menteeId: payload.userId,
          opportunityId: opportunityId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Already applied to this opportunity" },
        { status: 400 }
      );
    }

    // Create the application
    const application = await prisma.application.create({
      data: {
        menteeId: payload.userId,
        opportunityId,
        coverLetter: coverLetter || null,
      },
    });

    // Send email notification to mentor
    try {
      // Get opportunity and creator details for email
      const opportunityWithCreator = await (prisma.opportunity.findUnique({
        where: { id: opportunityId },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        } as any,
      }) as any);

      const mentee = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (opportunityWithCreator && mentee) {
        const mentorName =
          `${(opportunityWithCreator as any).creator.firstName || ""} ${
            (opportunityWithCreator as any).creator.lastName || ""
          }`.trim() || "Mentor";
        const menteeName =
          `${mentee.firstName || ""} ${
            mentee.lastName || ""
          }`.trim() || mentee.email;

        const emailResult = await sendApplicationSubmissionEmail({
          email: (opportunityWithCreator as any).creator.email,
          mentorName: mentorName,
          menteeName: menteeName,
          opportunityTitle: opportunityWithCreator.title,
          menteeEmail: mentee.email,
        });

        if (!emailResult.success) {
          console.error(
            "Failed to send application submission email:",
            emailResult.error
          );
          // Don't fail the request if email fails, just log it
        } else {
          console.log(
            "Application submission email sent successfully to:",
            (opportunityWithCreator as any).creator.email
          );
        }
      }
    } catch (emailError) {
      console.error("Error sending application submission email:", emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
