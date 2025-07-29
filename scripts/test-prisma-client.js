const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrismaClient() {
  console.log('Testing Prisma client with new schema...');
  
  try {
    // Test 1: Check if we can query opportunities with creator
    console.log('\n1. Testing opportunity query with creator...');
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
      },
      take: 2,
    });
    
    console.log(`Found ${opportunities.length} opportunities`);
    opportunities.forEach(opp => {
      console.log(`- ${opp.title} (Creator: ${opp.creator.firstName} ${opp.creator.lastName}, Role: ${opp.creatorRole})`);
    });
    
    // Test 2: Check if we can create an opportunity with creator fields
    console.log('\n2. Testing opportunity creation with creator fields...');
    const testOpportunity = await prisma.opportunity.create({
      data: {
        title: 'Test Opportunity',
        description: 'Test description',
        opportunityTypeId: opportunities[0].opportunityTypeId,
        creatorId: opportunities[0].creatorId,
        creatorRole: 'MENTOR',
        status: 'PENDING',
      },
      include: {
        creator: true,
        opportunityType: true,
      },
    });
    
    console.log(`Created test opportunity: ${testOpportunity.title}`);
    console.log(`Creator: ${testOpportunity.creator.firstName} ${testOpportunity.creator.lastName}`);
    console.log(`Creator Role: ${testOpportunity.creatorRole}`);
    
    // Test 3: Clean up test opportunity
    console.log('\n3. Cleaning up test opportunity...');
    await prisma.opportunity.delete({
      where: { id: testOpportunity.id },
    });
    console.log('Test opportunity deleted');
    
    console.log('\n✅ All Prisma client tests passed!');
    
  } catch (error) {
    console.error('❌ Prisma client test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testPrismaClient()
    .then(() => {
      console.log('Prisma client test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Prisma client test failed:', error);
      process.exit(1);
    });
}

module.exports = { testPrismaClient }; 