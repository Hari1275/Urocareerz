const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDifferentQueries() {
  try {
    console.log("Testing different query approaches...");

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

    // Test 1: Query without deletedAt filter
    console.log("\n1. Query without deletedAt filter:");
    const allOpps = await prisma.menteeOpportunity.findMany({
      where: { menteeId: hari.id },
      select: { id: true, title: true, status: true }
    });
    console.log(`Result: ${allOpps.length} opportunities`);

    // Test 2: Query with deletedAt = null
    console.log("\n2. Query with deletedAt = null:");
    const nullDeletedOpps = await prisma.menteeOpportunity.findMany({
      where: { 
        menteeId: hari.id,
        deletedAt: null
      },
      select: { id: true, title: true, status: true }
    });
    console.log(`Result: ${nullDeletedOpps.length} opportunities`);

    // Test 3: Query with deletedAt undefined
    console.log("\n3. Query with deletedAt undefined:");
    const undefinedDeletedOpps = await prisma.menteeOpportunity.findMany({
      where: { 
        menteeId: hari.id,
        deletedAt: undefined
      },
      select: { id: true, title: true, status: true }
    });
    console.log(`Result: ${undefinedDeletedOpps.length} opportunities`);

    // Test 4: Query without deletedAt in where clause
    console.log("\n4. Query without deletedAt in where clause:");
    const noDeletedAtOpps = await prisma.menteeOpportunity.findMany({
      where: { menteeId: hari.id },
      select: { id: true, title: true, status: true, deletedAt: true }
    });
    console.log(`Result: ${noDeletedAtOpps.length} opportunities`);
    noDeletedAtOpps.forEach((opp, index) => {
      console.log(`  ${index + 1}. ${opp.title} - deletedAt: ${opp.deletedAt}`);
    });

    // Test 5: Query with deletedAt not equals to a date
    console.log("\n5. Query with deletedAt not equals to a date:");
    const notDeletedOpps = await prisma.menteeOpportunity.findMany({
      where: { 
        menteeId: hari.id,
        deletedAt: { not: new Date() }
      },
      select: { id: true, title: true, status: true }
    });
    console.log(`Result: ${notDeletedOpps.length} opportunities`);

    // Test 6: Raw query approach
    console.log("\n6. Testing raw query approach:");
    const rawOpps = await prisma.$queryRaw`
      SELECT id, title, status, "deletedAt" 
      FROM "MenteeOpportunity" 
      WHERE "menteeId" = ${hari.id}
    `;
    console.log(`Raw query result: ${rawOpps.length} opportunities`);
    rawOpps.forEach((opp, index) => {
      console.log(`  ${index + 1}. ${opp.title} - deletedAt: ${opp.deletedAt}`);
    });

  } catch (error) {
    console.error("Error testing different queries:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDifferentQueries(); 