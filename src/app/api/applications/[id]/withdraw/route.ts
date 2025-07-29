import { NextRequest, NextResponse } from "next/server";
import { verifyEdgeToken } from "@/lib/edge-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = await verifyEdgeToken(token, secret);
    const { id } = params;

    // Get the application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        mentee: true,
        opportunity: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this application
    if (application.menteeId !== decoded?.userId) {
      return NextResponse.json(
        { error: "Unauthorized to withdraw this application" },
        { status: 403 }
      );
    }

    // Check if application can be withdrawn (only PENDING applications)
    if (application.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending applications can be withdrawn" },
        { status: 400 }
      );
    }

    // Update application status to WITHDRAWN
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status: "WITHDRAWN" },
      include: {
        opportunity: {
          include: {
            opportunityType: true,
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Application withdrawn successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
