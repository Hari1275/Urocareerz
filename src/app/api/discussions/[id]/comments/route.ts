import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

// POST /api/discussions/[id]/comments - Add a comment to a discussion thread
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = await verifyEdgeToken(token, secret);
    const userId = decoded.userId;

    const params = await context.params;
    const threadId = params.id;

    console.log("Creating comment for thread ID:", threadId);

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    // Get user to check if approved
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json(
        { error: "User not found or account deleted" },
        { status: 404 }
      );
    }

    // Check if discussion thread exists and is active
    const thread = await prisma.discussionThread.findUnique({
      where: { id: threadId },
      select: { id: true, status: true },
    });

    console.log("Thread found:", !!thread);
    if (thread) {
      console.log("Thread details:", thread);
    }

    if (!thread) {
      return NextResponse.json(
        { error: "Discussion thread not found" },
        { status: 404 }
      );
    }

    if (thread.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot comment on closed or archived threads" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { content } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        { error: "Comment must be between 1 and 2000 characters" },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await prisma.discussionComment.create({
      data: {
        content,
        authorId: userId,
        threadId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    console.log("Discussion comment created:", comment.id);

    return NextResponse.json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Error creating discussion comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
