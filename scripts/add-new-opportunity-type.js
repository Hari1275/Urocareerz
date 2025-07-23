const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addNewOpportunityType() {
  try {
    // Add a new opportunity type
    const newOpportunityType = await prisma.opportunityType.create({
      data: {
        name: 'INTERNSHIP',
        description: 'Paid or unpaid internship opportunities for students and recent graduates',
        color: 'indigo',
        isActive: true,
      },
    });

    console.log('✅ New opportunity type created successfully:');
    console.log('ID:', newOpportunityType.id);
    console.log('Name:', newOpportunityType.name);
    console.log('Description:', newOpportunityType.description);
    console.log('Color:', newOpportunityType.color);
    console.log('Status:', newOpportunityType.isActive ? 'Active' : 'Inactive');

    // You can add more opportunity types here
    const additionalTypes = [
      {
        name: 'VOLUNTEER',
        description: 'Volunteer opportunities for community service and skill development',
        color: 'pink',
      },
      {
        name: 'WORKSHOP',
        description: 'Educational workshops and training sessions',
        color: 'red',
      },
      {
        name: 'CONFERENCE',
        description: 'Professional conferences and networking events',
        color: 'teal',
      },
    ];

    for (const type of additionalTypes) {
      const created = await prisma.opportunityType.create({
        data: {
          ...type,
          isActive: true,
        },
      });
      console.log(`✅ Created: ${created.name} (${created.color})`);
    }

  } catch (error) {
    console.error('❌ Error creating opportunity type:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addNewOpportunityType(); 