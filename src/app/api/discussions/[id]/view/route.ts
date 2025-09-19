import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEdgeToken } from "@/lib/edge-auth";

// POST /api/discussions/[id]/view - Track a view for a discussion thread
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json(
                { error: "Thread ID is required" },
                { status: 400 }
            );
        }

        // Get token from cookies for user identification
        const token = req.cookies.get("token")?.value;
        let userId: string | null = null;

        if (token) {
            const secret = process.env.JWT_SECRET;
            if (secret) {
                try {
                    const decoded = await verifyEdgeToken(token, secret);
                    userId = decoded?.userId || null;
                } catch (error) {
                    console.log("Token verification failed for view tracking:", error);
                }
            }
        }

        // If no user ID, we can't track views (anonymous users)
        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required to track views" },
                { status: 401 }
            );
        }

        // Check if the discussion thread exists
        const thread = await prisma.discussionThread.findUnique({
            where: { id },
            select: { id: true, viewCount: true },
        });

        if (!thread) {
            return NextResponse.json(
                { error: "Discussion thread not found" },
                { status: 404 }
            );
        }

        // Check if user has already viewed this discussion
        const existingView = await prisma.discussionView.findUnique({
            where: {
                userId_threadId: {
                    userId: userId,
                    threadId: id
                }
            }
        });

        if (existingView) {
            // User has already viewed this discussion, return current count
            return NextResponse.json({
                success: true,
                viewCount: thread.viewCount,
                message: "View already tracked for this user",
                alreadyViewed: true
            });
        }

        // Create new view record and increment view count atomically
        await prisma.$transaction(async (tx) => {
            // Create the view record
            await tx.discussionView.create({
                data: {
                    userId: userId!,
                    threadId: id
                }
            });

            // Increment the view count
            await tx.discussionThread.update({
                where: { id },
                data: {
                    viewCount: { increment: 1 },
                    updatedAt: new Date()
                }
            });
        });

        // Get the updated view count
        const updatedThread = await prisma.discussionThread.findUnique({
            where: { id },
            select: { viewCount: true }
        });

        console.log(`New view tracked for discussion ${id} by user ${userId}. New count: ${updatedThread?.viewCount}`);

        return NextResponse.json({
            success: true,
            viewCount: updatedThread?.viewCount || thread.viewCount + 1,
            message: "View tracked successfully",
            alreadyViewed: false
        });
    } catch (error) {
        console.error("Error tracking discussion view:", error);
        return NextResponse.json(
            { error: "Failed to track view" },
            { status: 500 }
        );
    }
}
