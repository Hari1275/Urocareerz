import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple debugging endpoint to check discussions
export async function GET() {
  try {
    console.log("🔍 Debug: Checking discussions in database...");

    // Count all discussions
    const totalDiscussions = await prisma.discussionThread.count();
    console.log(`Total discussions in DB: ${totalDiscussions}`);

    // Get all discussions without filters
    const allDiscussions = await prisma.discussionThread.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        deletedAt: true,
        createdAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log("All discussions:", allDiscussions);

    // Check users
    const totalUsers = await prisma.user.count();
    console.log(`Total users in DB: ${totalUsers}`);

    return NextResponse.json({
      totalDiscussions,
      totalUsers,
      discussions: allDiscussions,
      message: "Debug data retrieved successfully",
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error },
      { status: 500 }
    );
  }
}