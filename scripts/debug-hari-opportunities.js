const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugHariOpportunities() {
  try {
    console.log("Debugging hari's opportunities...");

    // Find hari's user
    const hari = await prisma.user.findUnique({
      where: { email: "i21187654@gmail.com" },
      select: { id: true, email: true, firstName: true, lastName: true, role: true }
    });

    if (!hari) {
      console.log("Hari not found");
      return;
    }

    console.log(`Found hari: ${hari.email} (${hari.firstName} ${hari.lastName}) - ID: ${hari.id}`);

    // Check all opportunities for hari
    const hariOpportunities = await prisma.menteeOpportunity.findMany({
      where: { menteeId: hari.id },
      include: {
        opportunityType: {
          select: { name: true, color: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`\nTotal opportunities for hari: ${hariOpportunities.length}`);
    
    hariOpportunities.forEach((opp, index) => {
      console.log(`\n${index + 1}. ${opp.title}`);
      console.log(`   Status: ${opp.status}`);
      console.log(`   Type: ${opp.opportunityType.name}`);
      console.log(`   Created: ${opp.createdAt}`);
      console.log(`   Mentee ID: ${opp.menteeId}`);
    });

    // Check opportunities by status
    const opportunitiesByStatus = await prisma.menteeOpportunity.groupBy({
      by: ['status'],
      where: { menteeId: hari.id },
      _count: { status: true }
    });

    console.log("\nOpportunities by status:");
    opportunitiesByStatus.forEach(group => {
      console.log(`  ${group.status}: ${group._count.status}`);
    });

    // Test the exact API query
    console.log("\nTesting exact API query...");
    const apiQueryResult = await prisma.menteeOpportunity.findMany({
      where: {
        menteeId: hari.id,
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

    console.log(`API query result: ${apiQueryResult.length} opportunities`);
    apiQueryResult.forEach((opp, index) => {
      console.log(`  ${index + 1}. ${opp.title} (${opp.status})`);
    });

  } catch (error) {
    console.error("Error debugging hari's opportunities:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugHariOpportunities(); 