const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToUnifiedOpportunities() {
  console.log('Starting migration to unified opportunities...');
  
  try {
    // Step 1: Check current state of opportunities
    console.log('Checking current opportunities...');
    const allOpportunities = await prisma.opportunity.findMany({
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
    });
    
    console.log(`Found ${allOpportunities.length} total opportunities`);
    
    // Step 2: Analyze the opportunities
    const mentorOpportunities = allOpportunities.filter(opp => opp.creatorRole === 'MENTOR');
    const menteeOpportunities = allOpportunities.filter(opp => opp.creatorRole === 'MENTEE');
    const opportunitiesWithoutRole = allOpportunities.filter(opp => !opp.creatorRole);
    
    console.log(`- ${mentorOpportunities.length} mentor opportunities`);
    console.log(`- ${menteeOpportunities.length} mentee opportunities`);
    console.log(`- ${opportunitiesWithoutRole.length} opportunities without creator role`);
    
    // Step 3: Update opportunities that don't have creatorRole set
    if (opportunitiesWithoutRole.length > 0) {
      console.log('\nUpdating opportunities without creator role...');
      
      for (const opp of opportunitiesWithoutRole) {
        console.log(`Updating opportunity: ${opp.title}`);
        
        try {
          await prisma.opportunity.update({
            where: { id: opp.id },
            data: {
              creatorRole: 'MENTOR', // Assume existing opportunities were created by mentors
            },
          });
          console.log(`Successfully updated opportunity: ${opp.title}`);
        } catch (error) {
          console.error(`Failed to update opportunity ${opp.title}:`, error.message);
        }
      }
    } else {
      console.log('\nAll opportunities already have creator roles assigned.');
    }
    
    // Step 4: Final status check
    const finalCheck = await prisma.opportunity.findMany({
      select: {
        id: true,
        title: true,
        creatorRole: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
    
    console.log('\n=== Final Migration Status ===');
    console.log(`Total opportunities: ${finalCheck.length}`);
    
    const mentorCount = finalCheck.filter(opp => opp.creatorRole === 'MENTOR').length;
    const menteeCount = finalCheck.filter(opp => opp.creatorRole === 'MENTEE').length;
    const unassignedCount = finalCheck.filter(opp => !opp.creatorRole).length;
    
    console.log(`- Mentor opportunities: ${mentorCount}`);
    console.log(`- Mentee opportunities: ${menteeCount}`);
    console.log(`- Unassigned opportunities: ${unassignedCount}`);
    
    if (unassignedCount === 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('All opportunities are now in the unified structure.');
    } else {
      console.log('\n⚠️  Some opportunities still need attention.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateToUnifiedOpportunities()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToUnifiedOpportunities }; 