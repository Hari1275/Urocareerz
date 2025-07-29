const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const allUsers = await prisma.user.findMany();
    console.log(`Found ${allUsers.length} total users:`);
    
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Created: ${user.createdAt}`);
    });
    
    const mentorUsers = await prisma.user.findMany({
      where: { role: 'MENTOR' }
    });
    console.log(`\nFound ${mentorUsers.length} mentor users:`);
    
    mentorUsers.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
    const menteeUsers = await prisma.user.findMany({
      where: { role: 'MENTEE' }
    });
    console.log(`\nFound ${menteeUsers.length} mentee users:`);
    
    menteeUsers.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 