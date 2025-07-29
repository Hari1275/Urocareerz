const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check users
    const userCount = await prisma.user.count();
    console.log(`Total users: ${userCount}`);

    // Check mentees specifically
    const menteeCount = await prisma.user.count({
      where: { role: "MENTEE" }
    });
    console.log(`Total mentees: ${menteeCount}`);

    // Check mentee opportunities
    const opportunityCount = await prisma.menteeOpportunity.count();
    console.log(`Total mentee opportunities: ${opportunityCount}`);

    // Get all mentees
    const mentees = await prisma.user.findMany({
      where: { role: "MENTEE" },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    console.log(`\nFound ${mentees.length} mentees:`);
    mentees.forEach((mentee, index) => {
      console.log(`  ${index + 1}. ${mentee.email} (${mentee.firstName} ${mentee.lastName})`);
    });

    // Check opportunities for each mentee
    for (const mentee of mentees) {
      const menteeOpportunities = await prisma.menteeOpportunity.findMany({
        where: { menteeId: mentee.id },
        select: { id: true, title: true, status: true }
      });
      
      console.log(`\nOpportunities for ${mentee.email}: ${menteeOpportunities.length}`);
      menteeOpportunities.forEach((opp, index) => {
        console.log(`  ${index + 1}. ${opp.title} (${opp.status})`);
      });
    }

    // Check opportunity types
    const typeCount = await prisma.opportunityType.count();
    console.log(`Total opportunity types: ${typeCount}`);

  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection(); 