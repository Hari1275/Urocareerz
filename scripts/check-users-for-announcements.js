const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsersForAnnouncements() {
  try {
    console.log('🔍 Checking users for announcements...\n');

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        otpSecret: true,
        deletedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total users in database: ${allUsers.length}\n`);

    // Categorize users
    const admins = allUsers.filter(u => u.role === 'ADMIN');
    const nonAdmins = allUsers.filter(u => u.role !== 'ADMIN');
    const activeUsers = allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret === null && u.deletedAt === null);
    const pendingUsers = allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret !== null && u.otpSecret !== 'inactive_user' && u.deletedAt === null);
    const inactiveUsers = allUsers.filter(u => u.role !== 'ADMIN' && u.otpSecret === 'inactive_user' && u.deletedAt === null);
    const deletedUsers = allUsers.filter(u => u.deletedAt !== null);

    console.log('📈 User breakdown:');
    console.log(`  - Admins: ${admins.length}`);
    console.log(`  - Non-admins: ${nonAdmins.length}`);
    console.log(`  - Active users (otpSecret=null): ${activeUsers.length}`);
    console.log(`  - Pending users (otpSecret!=null): ${pendingUsers.length}`);
    console.log(`  - Inactive users (otpSecret='inactive_user'): ${inactiveUsers.length}`);
    console.log(`  - Deleted users: ${deletedUsers.length}`);

    console.log('\n👥 All users:');
    allUsers.forEach((user, index) => {
      const status = user.otpSecret === null ? 'ACTIVE' : 
                    user.otpSecret === 'inactive_user' ? 'INACTIVE' : 'PENDING';
      const deleted = user.deletedAt ? ' [DELETED]' : '';
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`     Role: ${user.role}, Status: ${status}${deleted}`);
      console.log(`     otpSecret: ${user.otpSecret === null ? 'null' : user.otpSecret}`);
      console.log('');
    });

    console.log('🎯 Users that SHOULD receive announcements (non-admin, not deleted, not inactive):');
    const eligibleUsers = allUsers.filter(u => 
      u.role !== 'ADMIN' && 
      u.deletedAt === null && 
      u.otpSecret !== 'inactive_user'
    );
    
    if (eligibleUsers.length === 0) {
      console.log('  ❌ No eligible users found!');
    } else {
      eligibleUsers.forEach((user, index) => {
        const status = user.otpSecret === null ? 'ACTIVE' : 'PENDING';
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsersForAnnouncements();
