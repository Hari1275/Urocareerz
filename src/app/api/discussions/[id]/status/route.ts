import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: discussionId } = await params;

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = await verifyEdgeToken(token, secret);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { status } = await request.json();

    // Validate status
    if (!["ACTIVE", "CLOSED", "ARCHIVED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be ACTIVE, CLOSED, or ARCHIVED" },
        { status: 400 }
      );
    }

    // Get the discussion to check permissions
    const discussion = await prisma.discussionThread.findUnique({
      where: { id: discussionId },
      select: {
        id: true,
        authorId: true,
        status: true,
        title: true,
      },
    });

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    // Check permissions: Author can manage their own discussions, Admin can manage any
    const isAuthor = discussion.authorId === decoded.userId;
    const isAdmin = decoded.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          error:
            "You can only manage your own discussions or need admin privileges",
        },
        { status: 403 }
      );
    }

    // Update the discussion status
    const updatedDiscussion = await prisma.discussionThread.update({
      where: { id: discussionId },
      data: { status },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    console.log(
      `Discussion status updated: ${discussionId} -> ${status} by ${
        isAdmin ? "admin" : "author"
      }`
    );

    return NextResponse.json({
      message: "Discussion status updated successfully",
      discussion: updatedDiscussion,
    });
  } catch (error) {
    console.error("Error updating discussion status:", error);
    return NextResponse.json(
      { error: "Failed to update discussion status" },
      { status: 500 }
    );
  }
}
