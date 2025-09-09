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
    // First, let's check all users for debugging
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        otpSecret: true,
        deletedAt: true,
      },
    });

    console.log(`Total users in database: ${allUsers.length}`);
    console.log('User breakdown:', {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === 'ADMIN').length,
      nonAdmins: allUsers.filter(u => u.role !== 'ADMIN').length,
      activeUsers: allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret === null && u.deletedAt === null).length,
      pendingUsers: allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret !== null && u.otpSecret !== 'inactive_user' && u.deletedAt === null).length,
      inactiveUsers: allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret === 'inactive_user' && u.deletedAt === null).length,
      deletedUsers: allUsers.filter(u => u.deletedAt !== null).length,
    });

    // Now get the users we want to send announcements to
    // Only include ACTIVE users (otpSecret: null) - exclude pending and inactive users
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["MENTOR", "MENTEE"] },
        otpSecret: null, // Only verified/active users
        // Temporarily removed deletedAt condition to test
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        otpSecret: true, // Include for debugging
      },
    });

    console.log(`Selected ${users.length} users for announcement:`);
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - otpSecret: ${user.otpSecret === null ? 'null (active)' : user.otpSecret === 'inactive_user' ? 'inactive' : 'pending'}`);  
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
