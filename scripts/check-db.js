const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("Checking database...");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        otpSecret: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    console.log(`Total users in database: ${users.length}`);

    if (users.length > 0) {
      console.log("Sample users:");
      users.slice(0, 3).forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.email} (${user.role}) - Status: ${
            user.otpSecret ? "pending" : "active"
          }`
        );
      });
    } else {
      console.log("No users found in database");
    }

    const opportunities = await prisma.opportunity.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    console.log(`\nTotal opportunities in database: ${opportunities.length}`);

    if (opportunities.length > 0) {
      console.log("Sample opportunities:");
      opportunities.slice(0, 3).forEach((opp, index) => {
        console.log(`${index + 1}. ${opp.title} (${opp.status})`);
      });
    }
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
