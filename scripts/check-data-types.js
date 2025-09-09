const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDataTypes() {
  try {
    console.log('🔍 Checking exact data types and values...\n');

    // Get first few users to inspect their exact values
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        email: true,
        role: true,
        otpSecret: true,
        deletedAt: true,
      }
    });

    console.log('📋 Sample user data with exact types:');
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  email: "${user.email}" (${typeof user.email})`);
      console.log(`  role: "${user.role}" (${typeof user.role})`);
      console.log(`  otpSecret: ${user.otpSecret} (${typeof user.otpSecret})`);
      console.log(`  deletedAt: ${user.deletedAt} (${typeof user.deletedAt})`);
    });

    // Test specific role values
    console.log('\n📋 Testing specific role queries:');
    
    const mentorCount = await prisma.user.count({
      where: { role: "MENTOR" }
    });
    console.log(`MENTOR count: ${mentorCount}`);
    
    const menteeCount = await prisma.user.count({
      where: { role: "MENTEE" }
    });
    console.log(`MENTEE count: ${menteeCount}`);
    
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" }
    });
    console.log(`ADMIN count: ${adminCount}`);

    // Test otpSecret null specifically
    console.log('\n📋 Testing otpSecret null:');
    const nullOtpCount = await prisma.user.count({
      where: { otpSecret: null }
    });
    console.log(`otpSecret null count: ${nullOtpCount}`);

    // Test deletedAt null specifically
    console.log('\n📋 Testing deletedAt null:');
    const nullDeletedCount = await prisma.user.count({
      where: { deletedAt: null }
    });
    console.log(`deletedAt null count: ${nullDeletedCount}`);

    // Test combining conditions one by one
    console.log('\n📋 Testing combined conditions step by step:');
    
    const mentorsOnly = await prisma.user.count({
      where: { role: "MENTOR" }
    });
    console.log(`Step 1 - role=MENTOR: ${mentorsOnly}`);
    
    const mentorsWithNullOtp = await prisma.user.count({
      where: { 
        role: "MENTOR",
        otpSecret: null 
      }
    });
    console.log(`Step 2 - role=MENTOR + otpSecret=null: ${mentorsWithNullOtp}`);
    
    const mentorsComplete = await prisma.user.count({
      where: { 
        role: "MENTOR",
        otpSecret: null,
        deletedAt: null
      }
    });
    console.log(`Step 3 - role=MENTOR + otpSecret=null + deletedAt=null: ${mentorsComplete}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDataTypes();
