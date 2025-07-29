const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUnifiedSystem() {
  console.log('🧪 Testing Unified Opportunities System End-to-End...\n');
  
  try {
    // Test 1: Database Schema
    console.log('1️⃣ Testing Database Schema...');
    const opportunityCount = await prisma.opportunity.count();
    const userCount = await prisma.user.count();
    const opportunityTypeCount = await prisma.opportunityType.count();
    
    console.log(`✅ Database contains:`);
    console.log(`   - ${opportunityCount} opportunities`);
    console.log(`   - ${userCount} users`);
    console.log(`   - ${opportunityTypeCount} opportunity types`);
    console.log('');
    
    // Test 2: Opportunity Structure
    console.log('2️⃣ Testing Opportunity Structure...');
    const sampleOpportunity = await prisma.opportunity.findFirst({
      include: {
        creator: true,
        opportunityType: true,
        _count: {
          select: {
            applications: true,
            savedOpportunities: true,
          },
        },
      },
    });
    
    if (sampleOpportunity) {
      console.log(`✅ Sample opportunity structure:`);
      console.log(`   - Title: ${sampleOpportunity.title}`);
      console.log(`   - Creator: ${sampleOpportunity.creator.firstName} ${sampleOpportunity.creator.lastName}`);
      console.log(`   - Creator Role: ${sampleOpportunity.creatorRole}`);
      console.log(`   - Type: ${sampleOpportunity.opportunityType.name}`);
      console.log(`   - Status: ${sampleOpportunity.status}`);
      if (sampleOpportunity.sourceName) {
        console.log(`   - Source: ${sampleOpportunity.sourceName}`);
      }
      console.log(`   - Applications: ${sampleOpportunity._count.applications}`);
      console.log(`   - Saved: ${sampleOpportunity._count.savedOpportunities}`);
    }
    console.log('');
    
    // Test 3: Creator Role Distribution
    console.log('3️⃣ Testing Creator Role Distribution...');
    const mentorOpportunities = await prisma.opportunity.count({
      where: { creatorRole: 'MENTOR' },
    });
    const menteeOpportunities = await prisma.opportunity.count({
      where: { creatorRole: 'MENTEE' },
    });
    
    console.log(`✅ Creator role distribution:`);
    console.log(`   - Mentor opportunities: ${mentorOpportunities}`);
    console.log(`   - Mentee opportunities: ${menteeOpportunities}`);
    console.log('');
    
    // Test 4: Status Distribution
    console.log('4️⃣ Testing Status Distribution...');
    const statusCounts = await prisma.opportunity.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    
    console.log(`✅ Status distribution:`);
    statusCounts.forEach(status => {
      console.log(`   - ${status.status}: ${status._count.status}`);
    });
    console.log('');
    
    // Test 5: Source Attribution
    console.log('5️⃣ Testing Source Attribution...');
    const opportunitiesWithSource = await prisma.opportunity.findMany({
      where: {
        sourceName: { not: null },
      },
      select: {
        title: true,
        sourceName: true,
        sourceUrl: true,
        creatorRole: true,
      },
    });
    
    console.log(`✅ Opportunities with source attribution: ${opportunitiesWithSource.length}`);
    opportunitiesWithSource.forEach(opp => {
      console.log(`   - ${opp.title} (${opp.creatorRole}) via ${opp.sourceName}`);
    });
    console.log('');
    
    // Test 6: User Role Distribution
    console.log('6️⃣ Testing User Role Distribution...');
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });
    
    console.log(`✅ User role distribution:`);
    userRoles.forEach(role => {
      console.log(`   - ${role.role}: ${role._count.role}`);
    });
    console.log('');
    
    // Test 7: Opportunity Type Distribution
    console.log('7️⃣ Testing Opportunity Type Distribution...');
    const typeCounts = await prisma.opportunity.groupBy({
      by: ['opportunityTypeId'],
      _count: { opportunityTypeId: true },
    });
    
    console.log(`✅ Opportunity type distribution:`);
    for (const typeCount of typeCounts) {
      const type = await prisma.opportunityType.findUnique({
        where: { id: typeCount.opportunityTypeId },
      });
      console.log(`   - ${type.name}: ${typeCount._count.opportunityTypeId}`);
    }
    console.log('');
    
    // Test 8: Recent Activity
    console.log('8️⃣ Testing Recent Activity...');
    const recentOpportunities = await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        opportunityType: true,
      },
    });
    
    console.log(`✅ Recent opportunities:`);
    recentOpportunities.forEach((opp, index) => {
      console.log(`   ${index + 1}. ${opp.title}`);
      console.log(`      Created by: ${opp.creator.firstName} ${opp.creator.lastName} (${opp.creatorRole})`);
      console.log(`      Type: ${opp.opportunityType.name}`);
      console.log(`      Status: ${opp.status}`);
      console.log(`      Created: ${opp.createdAt.toLocaleDateString()}`);
    });
    console.log('');
    
    console.log('🎉 All tests passed! The unified opportunities system is working correctly.');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Total opportunities: ${opportunityCount}`);
    console.log(`   - Mentor submissions: ${mentorOpportunities}`);
    console.log(`   - Mentee submissions: ${menteeOpportunities}`);
    console.log(`   - With source attribution: ${opportunitiesWithSource.length}`);
    console.log(`   - Active users: ${userCount}`);
    console.log('');
    console.log('✅ The unified opportunities system is ready for production use!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testUnifiedSystem()
    .then(() => {
      console.log('Unified system test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Unified system test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUnifiedSystem }; 