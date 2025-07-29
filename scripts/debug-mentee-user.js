const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugMenteeUser() {
  try {
    console.log("Debugging mentee user...");

    // Find all users with mentee@gmail.com
    const users = await prisma.user.findMany({
      where: { 
        email: "mentee@gmail.com"
      },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`Found ${users.length} users with email mentee@gmail.com:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Role: ${user.role}, Created: ${user.createdAt}`);
    });

    // Check all mentee opportunities
    const allOpportunities = await prisma.menteeOpportunity.findMany({
      include: {
        mentee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        opportunityType: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    console.log(`\nTotal mentee opportunities in database: ${allOpportunities.length}`);
    
    allOpportunities.forEach((opp, index) => {
      console.log(`\n${index + 1}. ${opp.title}`);
      console.log(`   Mentee: ${opp.mentee.email} (ID: ${opp.menteeId})`);
      console.log(`   Status: ${opp.status}`);
      console.log(`   Type: ${opp.opportunityType.name}`);
    });

    // Test with the first user ID
    if (users.length > 0) {
      const firstUserId = users[0].id;
      console.log(`\nTesting with user ID: ${firstUserId}`);
      
      const opportunitiesForUser = await prisma.menteeOpportunity.findMany({
        where: {
          menteeId: firstUserId,
          deletedAt: null,
        },
        include: {
          opportunityType: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`Opportunities for user ID ${firstUserId}: ${opportunitiesForUser.length}`);
      opportunitiesForUser.forEach((opp, index) => {
        console.log(`  ${index + 1}. ${opp.title} (${opp.status})`);
      });
    }

  } catch (error) {
    console.error("Error debugging mentee user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugMenteeUser(); 