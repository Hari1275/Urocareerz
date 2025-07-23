const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMoreOpportunityTypes() {
  try {
    console.log('🚀 Adding new opportunity types with new colors...\n');
    
    const newTypes = [
      {
        name: 'WORKSHOP',
        description: 'Educational workshops and training sessions for skill development',
        color: 'red',
      },
      {
        name: 'CONFERENCE',
        description: 'Professional conferences and networking events',
        color: 'indigo',
      },
      {
        name: 'MENTORSHIP',
        description: 'One-on-one mentoring and guidance programs',
        color: 'pink',
      },
      {
        name: 'CERTIFICATION',
        description: 'Professional certification and credentialing programs',
        color: 'purple',
      },
    ];

    for (const type of newTypes) {
      // Check if type already exists
      const existing = await prisma.opportunityType.findFirst({
        where: { name: type.name }
      });

      if (existing) {
        console.log(`⚠️  ${type.name} already exists (${existing.color})`);
        continue;
      }

      const created = await prisma.opportunityType.create({
        data: {
          ...type,
          isActive: true,
        },
      });
      
      console.log(`✅ Created: ${created.name} (${created.color})`);
      console.log(`   Description: ${created.description}`);
      console.log('');
    }

    console.log('🎉 Finished adding new opportunity types!');

  } catch (error) {
    console.error('❌ Error adding opportunity types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreOpportunityTypes(); 