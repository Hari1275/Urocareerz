const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testORCondition() {
  try {
    console.log("Testing OR condition approach...");

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

    // Test the OR condition approach
    const opportunities = await prisma.menteeOpportunity.findMany({
      where: {
        menteeId: hari.id,
        OR: [
          { deletedAt: null },
          { deletedAt: undefined }
        ]
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

    console.log(`\nOR condition result: ${opportunities.length} opportunities`);
    
    opportunities.forEach((opp, index) => {
      console.log(`\n${index + 1}. ${opp.title}`);
      console.log(`   Status: ${opp.status}`);
      console.log(`   Type: ${opp.opportunityType.name} (${opp.opportunityType.color})`);
    });

  } catch (error) {
    console.error("Error testing OR condition:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testORCondition(); 