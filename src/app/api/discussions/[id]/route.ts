import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

// GET /api/discussions/[id] - Get a specific discussion thread with comments
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    console.log("Fetching discussion thread with ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    // Get the discussion thread with comments
    const thread = await prisma.discussionThread.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    console.log("Thread found:", !!thread);
    if (thread) {
      console.log("Thread details:", {
        id: thread.id,
        title: thread.title,
        authorId: thread.authorId,
        deletedAt: thread.deletedAt,
      });
      console.log("Comments count:", thread.comments.length);
      if (thread.comments.length > 0) {
        console.log("Sample comment:", {
          id: thread.comments[0].id,
          content: thread.comments[0].content.substring(0, 50) + "...",
          authorId: thread.comments[0].authorId,
        });
      }
    }

    if (!thread) {
      // Let's also check if the thread exists without the deletedAt filter
      const threadWithoutFilter = await prisma.discussionThread.findUnique({
        where: { id },
        select: { id: true, deletedAt: true, title: true },
      });
      console.log("Thread without deletedAt filter:", threadWithoutFilter);

      return NextResponse.json(
        { error: "Discussion thread not found" },
        { status: 404 }
      );
    }

    // Update view count (commented out due to Prisma client issue)
    // await prisma.discussionThread.update({
    //   where: { id },
    //   data: { viewCount: { increment: 1 } },
    // });

    return NextResponse.json({ thread });
  } catch (error) {
    console.error("Error fetching discussion thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussion thread" },
      { status: 500 }
    );
  }
}

// PUT /api/discussions/[id] - Update a discussion thread
export async function PUT(
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
    const userId = decoded?.userId;

    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    // Get the discussion thread
    const threadRecord = await prisma.discussionThread.findUnique({
      where: { id },
      select: { authorId: true, deletedAt: true },
    });

    if (!threadRecord || threadRecord.deletedAt) {
      return NextResponse.json(
        { error: "Discussion thread not found" },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (threadRecord.authorId !== userId) {
      return NextResponse.json(
        { error: "You can only edit your own threads" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, content, category, tags, status } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: "Title must be between 5 and 200 characters" },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 10 || content.length > 5000) {
      return NextResponse.json(
        { error: "Content must be between 10 and 5000 characters" },
        { status: 400 }
      );
    }

    // Optional: validate category/tags as in POST
    const validCategories = [
      "GENERAL",
      "CASE_DISCUSSION",
      "CAREER_ADVICE",
      "TECHNICAL",
      "NETWORKING",
      "RESOURCES",
    ];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Update the discussion thread
    const updatedThread = await prisma.discussionThread.update({
      where: { id },
      data: {
        title,
        content,
        category,
        status,
        tags: tags ? tags.slice(0, 5) : undefined, // Limit to 5 tags
        updatedAt: new Date(),

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

    console.log("Discussion thread updated:", id);

    return NextResponse.json({
      message: "Discussion thread updated successfully",
      thread: updatedThread,
    });
  } catch (error) {
    console.error("Error updating discussion thread:", error);
    return NextResponse.json(
      { error: "Failed to update discussion thread" },
      { status: 500 }
    );
  }
}

// DELETE /api/discussions/[id] - Delete a discussion thread (soft delete)
export async function DELETE(
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
    const userId = decoded?.userId;

    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    // Get the discussion thread
    const threadRecord = await prisma.discussionThread.findUnique({
      where: { id },
      select: { authorId: true, deletedAt: true },
    });

    if (!threadRecord || threadRecord.deletedAt) {
      return NextResponse.json(
        { error: "Discussion thread not found" },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (threadRecord.authorId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own threads" },
        { status: 403 }
      );
    }

    // Soft delete the discussion thread
    await prisma.discussionThread.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    console.log("Discussion thread deleted:", id);

    return NextResponse.json({
      message: "Discussion thread deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting discussion thread:", error);
    return NextResponse.json(
      { error: "Failed to delete discussion thread" },
      { status: 500 }
    );
  }
}
