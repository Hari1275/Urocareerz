import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

// GET /api/discussions - Get all discussion threads
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const myDiscussions = searchParams.get("myDiscussions") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get current user for filtering own discussions
    let currentUserId: string | null = null;
    if (myDiscussions) {
      const token = req.cookies.get("token")?.value;
      console.log("Token found for myDiscussions filter:", !!token);
      if (token) {
        const secret = process.env.JWT_SECRET;
        if (secret) {
          try {
            const decoded = await verifyEdgeToken(token, secret);
            currentUserId = decoded?.userId || null;
            console.log("Decoded user ID for filtering:", currentUserId);
          } catch (error) {
            console.log("Token verification failed for filtering:", error);
          }
        } else {
          console.log("JWT_SECRET is missing");
        }
      } else {
        console.log("No token found in cookies");
      }
    }

    // Build where clause
    const where: any = {
      // Note: Temporarily ignoring soft delete filter due to MongoDB null handling issues
      // TODO: Fix the deletedAt field handling for proper soft delete filtering
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    // Filter by user's own discussions if requested
    if (myDiscussions && currentUserId) {
      where.authorId = currentUserId;
      console.log("✅ Applied myDiscussions filter with authorId:", currentUserId);
    } else if (myDiscussions && !currentUserId) {
      console.log("⚠️ WARNING: myDiscussions requested but no valid user ID found");
      // Return empty result when myDiscussions is requested but no user is authenticated
      return NextResponse.json({
        threads: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    console.log("🔍 Discussion list query where clause:", where);
    console.log("📨 Request parameters:", { category, status, myDiscussions, page, limit, currentUserId });

    // Get discussion threads with pagination
    const [threads, total] = await Promise.all([
      prisma.discussionThread.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.discussionThread.count({ where }),
    ]);

    console.log("✅ Found threads:", threads.length, "Total:", total);
    if (threads.length > 0 && myDiscussions) {
      console.log("👤 Sample thread author IDs:", threads.slice(0, 3).map(t => t.author.id));
      console.log("🔎 Expected author ID:", currentUserId);
      console.log("✅ All threads match current user:", threads.every(t => t.author.id === currentUserId));
    }

    return NextResponse.json({
      threads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching discussion threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussion threads" },
      { status: 500 }
    );
  }
}

// POST /api/discussions - Create a new discussion thread
export async function POST(req: NextRequest) {
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

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "User ID not found in token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

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

    const body = await req.json();
    const { title, content, category = "GENERAL", tags = [] } = body;

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

    // Validate category (keep in sync with prisma enum DiscussionCategory)
    const validCategories = [
      "GENERAL",
      "CASE_DISCUSSION",
      "CAREER_ADVICE",
      "TECHNICAL",
      "NETWORKING",
      "RESOURCES",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Create the discussion thread
    const thread = await prisma.discussionThread.create({
      data: {
        title,
        content,
        category,
        tags,
        authorId: userId,
        status: "ACTIVE",
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log("Discussion thread created:", thread.id);
    console.log("Thread details:", {
      id: thread.id,
      title: thread.title,
      authorId: thread.authorId,
      deletedAt: thread.deletedAt,
      status: thread.status,
    });

    // Let's also verify the thread was actually saved by fetching it back
    const savedThread = await prisma.discussionThread.findUnique({
      where: { id: thread.id },
      select: {
        id: true,
        title: true,
        status: true,
        deletedAt: true,
        authorId: true,
      },
    });
    console.log("Verification - saved thread:", savedThread);

    return NextResponse.json({
      message: "Discussion thread created successfully",
      thread,
    });
  } catch (error) {
    console.error("Error creating discussion thread:", error);
    return NextResponse.json(
      { error: "Failed to create discussion thread" },
      { status: 500 }
    );
  }
}