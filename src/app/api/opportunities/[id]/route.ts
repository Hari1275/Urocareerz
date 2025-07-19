import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: opportunityId } = await params;

    // Get the opportunity with mentor details
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        mentor: {
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
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
