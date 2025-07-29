const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testMenteeAPI() {
  try {
    console.log("Testing mentee opportunities API...");

    // Get a mentee user
    const mentee = await prisma.user.findFirst({
      where: { 
        role: "MENTEE",
        email: "i21187654@gmail.com"
      },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!mentee) {
      console.log("No mentee found with email mentee@gmail.com");
      return;
    }

    console.log(`Testing for mentee: ${mentee.email} (${mentee.firstName} ${mentee.lastName})`);

    // Simulate the API query
    const opportunities = await prisma.menteeOpportunity.findMany({
      where: {
        menteeId: mentee.id,
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

    console.log(`\nFound ${opportunities.length} opportunities for this mentee:`);
    
    opportunities.forEach((opp, index) => {
      console.log(`\n${index + 1}. ${opp.title}`);
      console.log(`   Status: ${opp.status}`);
      console.log(`   Type: ${opp.opportunityType.name} (${opp.opportunityType.color})`);
      console.log(`   Created: ${opp.createdAt}`);
      console.log(`   Description: ${opp.description.substring(0, 100)}...`);
    });

    // Test the response format
    const apiResponse = { opportunities };
    console.log(`\nAPI Response format:`, JSON.stringify(apiResponse, null, 2).substring(0, 500) + "...");

  } catch (error) {
    console.error("Error testing mentee API:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testMenteeAPI(); 