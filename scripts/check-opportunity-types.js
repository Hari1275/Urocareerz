const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOpportunityTypes() {
  try {
    console.log('🔍 Checking existing opportunity types...\n');
    
    const opportunityTypes = await prisma.opportunityType.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (opportunityTypes.length === 0) {
      console.log('❌ No opportunity types found in the database.');
      return;
    }

    console.log(`✅ Found ${opportunityTypes.length} opportunity types:\n`);
    
    opportunityTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type.name}`);
      console.log(`   Description: ${type.description || 'No description'}`);
      console.log(`   Color: ${type.color}`);
      console.log(`   Status: ${type.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Created: ${type.createdAt.toISOString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking opportunity types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOpportunityTypes(); 