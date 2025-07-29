const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCreatorIds() {
  console.log('Starting to fix creator IDs for opportunities...');
  
  try {
    // Get all opportunities that don't have creatorId set
    const opportunities = await prisma.opportunity.findMany({
      where: {
        creatorId: null,
      },
      include: {
        creator: true,
      },
    });
    
    console.log(`Found ${opportunities.length} opportunities without creatorId`);
    
    if (opportunities.length === 0) {
      console.log('All opportunities already have creatorId set.');
      return;
    }
    
    // Get the first admin user to use as default creator if needed
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });
    
    if (!adminUser) {
      console.error('No admin user found. Cannot proceed with migration.');
      return;
    }
    
    console.log(`Using admin user ${adminUser.firstName} ${adminUser.lastName} as default creator`);
    
    // Update each opportunity
    for (const opp of opportunities) {
      console.log(`Fixing creatorId for opportunity: ${opp.title}`);
      
      try {
        // For now, assign the admin user as creator since we don't have the original mentor info
        await prisma.opportunity.update({
          where: { id: opp.id },
          data: {
            creatorId: adminUser.id,
            creatorRole: 'MENTOR', // Assume all existing opportunities were created by mentors
          },
        });
        
        console.log(`Successfully updated opportunity: ${opp.title}`);
      } catch (error) {
        console.error(`Failed to update opportunity ${opp.title}:`, error.message);
      }
    }
    
    // Final verification
    const finalCheck = await prisma.opportunity.findMany({
      where: {
        creatorId: null,
      },
    });
    
    console.log(`\nFinal check: ${finalCheck.length} opportunities still without creatorId`);
    
    if (finalCheck.length === 0) {
      console.log('✅ All opportunities now have creatorId set!');
    } else {
      console.log('⚠️  Some opportunities still need attention.');
    }
    
  } catch (error) {
    console.error('Fix creator IDs failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  fixCreatorIds()
    .then(() => {
      console.log('Fix creator IDs script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fix creator IDs script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixCreatorIds }; 