const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testAPIWithoutDeletedFilter() {
  try {
    console.log("Testing API query without deletedAt filter...");

    // Find hari's user
    const hari = await prisma.user.findUnique({
      where: { email: "i21187654@gmail.com" },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!hari) {
      console.log("Hari not found");
      return;
    }

    console.log(`Found hari: ${hari.email} (${hari.firstName} ${hari.lastName}) - ID: ${hari.id}`);

    // Test the API query without deletedAt filter
    const opportunities = await prisma.menteeOpportunity.findMany({
      where: {
        menteeId: hari.id,
        // Removed deletedAt: null filter
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

    console.log(`\nAPI query result (without deletedAt filter): ${opportunities.length} opportunities`);
    
    opportunities.forEach((opp, index) => {
      console.log(`\n${index + 1}. ${opp.title}`);
      console.log(`   Status: ${opp.status}`);
      console.log(`   Type: ${opp.opportunityType.name} (${opp.opportunityType.color})`);
      console.log(`   Created: ${opp.createdAt}`);
    });

    // Test the response format
    const apiResponse = { opportunities };
    console.log(`\nAPI Response format:`, JSON.stringify(apiResponse, null, 2).substring(0, 500) + "...");

  } catch (error) {
    console.error("Error testing API without deletedAt filter:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIWithoutDeletedFilter(); 