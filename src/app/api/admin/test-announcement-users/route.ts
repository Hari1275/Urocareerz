import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin-auth";

// GET /api/admin/test-announcement-users - Test endpoint to check which users would receive announcements
export const GET = withAdminAuth(async () => {
  try {
    // Get all users for comparison
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

    // Get users that would receive announcements (active users only)
    const announcementUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: "MENTOR" },
          { role: "MENTEE" }
        ],
        otpSecret: null, // Only verified/active users
        deletedAt: null, // Not soft-deleted
      },
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

    const breakdown = {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === 'ADMIN').length,
      nonAdmins: allUsers.filter(u => u.role !== 'ADMIN').length,
      activeUsers: allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret === null && u.deletedAt === null).length,
      pendingUsers: allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret !== null && u.otpSecret !== 'inactive_user' && u.deletedAt === null).length,
      inactiveUsers: allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret === 'inactive_user' && u.deletedAt === null).length,
      deletedUsers: allUsers.filter(u => u.deletedAt !== null).length,
    };

    return NextResponse.json({
      success: true,
      breakdown,
      announcementUsersCount: announcementUsers.length,
      announcementUsers: announcementUsers.map(user => ({
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        status: user.otpSecret === null ? 'active' : 
                user.otpSecret === 'inactive_user' ? 'inactive' : 'pending'
      })),
      query: {
        where: {
          role: { not: "ADMIN" },
          otpSecret: null,
          deletedAt: null,
        }
      }
    });

  } catch (error) {
    console.error("Error testing announcement users:", error);
    return NextResponse.json(
      { error: "Failed to test announcement users" },
      { status: 500 }
    );
  }
});
