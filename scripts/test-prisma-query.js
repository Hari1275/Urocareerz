const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrismaQuery() {
  try {
    console.log('🔍 Testing Prisma queries directly...\n');

    // Test 1: Get all users
    console.log('📋 Test 1: All users');
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        otpSecret: true,
        deletedAt: true,
      }
    });
    console.log(`Total users: ${allUsers.length}`);

    // Test 2: Original query with NOT syntax
    console.log('\n📋 Test 2: Original query (role: { not: "ADMIN" })');
    try {
      const originalQuery = await prisma.user.findMany({
        where: {
          role: { not: "ADMIN" },
          otpSecret: null,
          deletedAt: null,
        },
        select: {
          email: true,
          role: true,
          otpSecret: true,
        }
      });
      console.log(`Original query result: ${originalQuery.length} users`);
      originalQuery.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    } catch (error) {
      console.error('❌ Original query failed:', error.message);
    }

    // Test 3: OR query
    console.log('\n📋 Test 3: OR query (MENTOR or MENTEE)');
    try {
      const orQuery = await prisma.user.findMany({
        where: {
          OR: [
            { role: "MENTOR" },
            { role: "MENTEE" }
          ],
          otpSecret: null,
          deletedAt: null,
        },
        select: {
          email: true,
          role: true,
          otpSecret: true,
        }
      });
      console.log(`OR query result: ${orQuery.length} users`);
      orQuery.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    } catch (error) {
      console.error('❌ OR query failed:', error.message);
    }

    // Test 4: Step by step filtering
    console.log('\n📋 Test 4: Step-by-step filtering');
    
    // Step 1: Non-admin users
    const nonAdmins = await prisma.user.findMany({
      where: {
        NOT: { role: "ADMIN" }
      },
      select: {
        email: true,
        role: true,
        otpSecret: true,
        deletedAt: true,
      }
    });
    console.log(`Step 1 - Non-admin users: ${nonAdmins.length}`);

    // Step 2: Non-admin + otpSecret null
    const nonAdminsActive = nonAdmins.filter(u => u.otpSecret === null);
    console.log(`Step 2 - Non-admin + otpSecret=null: ${nonAdminsActive.length}`);

    // Step 3: Non-admin + otpSecret null + not deleted
    const final = nonAdminsActive.filter(u => u.deletedAt === null);
    console.log(`Step 3 - Final (not deleted): ${final.length}`);
    final.forEach(u => console.log(`  - ${u.email} (${u.role}) otpSecret=${u.otpSecret} deleted=${u.deletedAt}`));

    // Test 5: Simple alternative query
    console.log('\n📋 Test 5: Simple alternative');
    const simple = await prisma.user.findMany({
      where: {
        role: { in: ["MENTOR", "MENTEE"] },
        otpSecret: null,
        deletedAt: null,
      },
      select: {
        email: true,
        role: true,
        otpSecret: true,
      }
    });
    console.log(`Simple query result: ${simple.length} users`);
    simple.forEach(u => console.log(`  - ${u.email} (${u.role})`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaQuery();
