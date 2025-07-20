import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";
import { sendCustomAnnouncementEmail } from "@/lib/email";

// POST /api/admin/announcements - Send custom announcement to all users
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Get all active users (excluding admins)
    const users = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" },
        otpSecret: null, // Only approved users
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No users found to send announcement to" },
        { status: 400 }
      );
    }

    // Send email to each user
    const emailPromises = users.map(
      async (user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
      }) => {
        try {
          const userName =
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email;

          const emailResult = await sendCustomAnnouncementEmail({
            email: user.email,
            userName: userName,
            announcementTitle: title,
            announcementContent: content,
          });

          return {
            userId: user.id,
            email: user.email,
            success: emailResult.success,
            error: emailResult.error,
          };
        } catch (error) {
          return {
            userId: user.id,
            email: user.email,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }
    );

    const results = await Promise.all(emailPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Announcement sent to ${successful} users${
        failed > 0 ? `, ${failed} failed` : ""
      }`,
      totalUsers: users.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    console.error("Error sending announcement:", error);
    return NextResponse.json(
      { error: "Failed to send announcement" },
      { status: 500 }
    );
  }
});
