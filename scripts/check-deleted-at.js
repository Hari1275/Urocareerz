const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDeletedAt() {
  try {
    console.log("Checking deletedAt field for hari's opportunities...");

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

    // Check all opportunities for hari including deletedAt
    const hariOpportunities = await prisma.menteeOpportunity.findMany({
      where: { menteeId: hari.id },
      select: {
        id: true,
        title: true,
        status: true,
        deletedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`\nTotal opportunities for hari: ${hariOpportunities.length}`);
    
    hariOpportunities.forEach((opp, index) => {
      console.log(`\n${index + 1}. ${opp.title}`);
      console.log(`   Status: ${opp.status}`);
      console.log(`   deletedAt: ${opp.deletedAt}`);
      console.log(`   Created: ${opp.createdAt}`);
    });

    // Check opportunities with deletedAt = null
    const activeOpportunities = await prisma.menteeOpportunity.findMany({
      where: { 
        menteeId: hari.id,
        deletedAt: null
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });

    console.log(`\nActive opportunities (deletedAt = null): ${activeOpportunities.length}`);
    activeOpportunities.forEach((opp, index) => {
      console.log(`  ${index + 1}. ${opp.title} (${opp.status})`);
    });

    // Check opportunities with deletedAt != null
    const deletedOpportunities = await prisma.menteeOpportunity.findMany({
      where: { 
        menteeId: hari.id,
        deletedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        status: true,
        deletedAt: true
      }
    });

    console.log(`\nDeleted opportunities (deletedAt != null): ${deletedOpportunities.length}`);
    deletedOpportunities.forEach((opp, index) => {
      console.log(`  ${index + 1}. ${opp.title} (${opp.status}) - deletedAt: ${opp.deletedAt}`);
    });

  } catch (error) {
    console.error("Error checking deletedAt:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDeletedAt(); 