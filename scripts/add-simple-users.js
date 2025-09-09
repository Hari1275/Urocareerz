const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSimpleUsers() {
  try {
    console.log('Adding simple test users for announcements...');

    const testUsers = [
      {
        email: 'mentor1@test.com',
        firstName: 'John',
        lastName: 'Mentor',
        role: 'MENTOR',
      },
      {
        email: 'mentee1@test.com',
        firstName: 'Jane',
        lastName: 'Mentee',
        role: 'MENTEE',
      },
    ];

    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            ...userData,
            otpSecret: null, // Active user
            termsAccepted: true,
          },
        });
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    }

    // Check total users
    const totalUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        otpSecret: true,
        deletedAt: true,
      }
    });

    console.log('\n📊 Current users in database:');
    totalUsers.forEach(user => {
      const status = user.otpSecret === null ? 'active' : 
                    user.otpSecret === 'inactive_user' ? 'inactive' : 'pending';
      console.log(`- ${user.email} (${user.role}) - ${status}${user.deletedAt ? ' [DELETED]' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSimpleUsers();
