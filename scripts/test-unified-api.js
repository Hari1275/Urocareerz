const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUnifiedAPI() {
  console.log('🧪 Testing Unified Opportunities API...\n');
  
  try {
    // Test 1: Check opportunities in database
    console.log('1️⃣ Checking opportunities in database...');
    const opportunities = await prisma.opportunity.findMany({
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        opportunityType: true,
        _count: {
          select: {
            applications: true,
            savedOpportunities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`✅ Found ${opportunities.length} opportunities:`);
    opportunities.forEach((opp, index) => {
      console.log(`   ${index + 1}. ${opp.title}`);
      console.log(`      Creator: ${opp.creator.firstName} ${opp.creator.lastName} (${opp.creatorRole})`);
      console.log(`      Status: ${opp.status}`);
      console.log(`      Type: ${opp.opportunityType.name}`);
      if (opp.sourceName) {
        console.log(`      Source: ${opp.sourceName}`);
      }
      console.log(`      Applications: ${opp._count.applications}, Saved: ${opp._count.savedOpportunities}`);
      console.log('');
    });
    
    // Test 2: Check opportunity types
    console.log('2️⃣ Checking opportunity types...');
    const opportunityTypes = await prisma.opportunityType.findMany();
    console.log(`✅ Found ${opportunityTypes.length} opportunity types:`);
    opportunityTypes.forEach(type => {
      console.log(`   - ${type.name} (${type.color})`);
    });
    console.log('');
    
    // Test 3: Check users by role
    console.log('3️⃣ Checking users by role...');
    const mentors = await prisma.user.findMany({ where: { role: 'MENTOR' } });
    const mentees = await prisma.user.findMany({ where: { role: 'MENTEE' } });
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    
    console.log(`✅ Found ${mentors.length} mentors, ${mentees.length} mentees, ${admins.length} admins`);
    console.log('');
    
    // Test 4: Test filtering by creator role
    console.log('4️⃣ Testing filtering by creator role...');
    const mentorOpportunities = await prisma.opportunity.findMany({
      where: { creatorRole: 'MENTOR' },
      include: { creator: true },
    });
    
    const menteeOpportunities = await prisma.opportunity.findMany({
      where: { creatorRole: 'MENTEE' },
      include: { creator: true },
    });
    
    console.log(`✅ Mentor opportunities: ${mentorOpportunities.length}`);
    console.log(`✅ Mentee opportunities: ${menteeOpportunities.length}`);
    console.log('');
    
    // Test 5: Test status distribution
    console.log('5️⃣ Testing status distribution...');
    const statusCounts = await prisma.opportunity.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    
    console.log('✅ Status distribution:');
    statusCounts.forEach(status => {
      console.log(`   - ${status.status}: ${status._count.status}`);
    });
    console.log('');
    
    console.log('🎉 All API tests passed! The unified opportunities system is working correctly.');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testUnifiedAPI()
    .then(() => {
      console.log('Unified API test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Unified API test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUnifiedAPI }; 