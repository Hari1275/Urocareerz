const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkMenteeOpportunities() {
  try {
    console.log("Checking mentee opportunities...");

    // Check users with MENTEE role
    const mentees = await prisma.user.findMany({
      where: {
        role: "MENTEE",
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`Total mentees in database: ${mentees.length}`);

    if (mentees.length > 0) {
      console.log("Sample mentees:");
      mentees.slice(0, 3).forEach((mentee, index) => {
        console.log(
          `${index + 1}. ${mentee.email} (${mentee.firstName} ${mentee.lastName})`
        );
      });
    }

    // Check mentee opportunities
    const menteeOpportunities = await prisma.menteeOpportunity.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        mentee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
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

    console.log(`\nTotal mentee opportunities in database: ${menteeOpportunities.length}`);

    if (menteeOpportunities.length > 0) {
      console.log("Sample mentee opportunities:");
      menteeOpportunities.slice(0, 5).forEach((opp, index) => {
        console.log(
          `${index + 1}. ${opp.title} (${opp.status}) - Submitted by: ${opp.mentee.email} - Type: ${opp.opportunityType.name}`
        );
      });
    } else {
      console.log("No mentee opportunities found in database");
    }

    // Check opportunity types
    const opportunityTypes = await prisma.opportunityType.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        color: true,
        isActive: true,
      },
    });

    console.log(`\nTotal active opportunity types: ${opportunityTypes.length}`);

    if (opportunityTypes.length > 0) {
      console.log("Available opportunity types:");
      opportunityTypes.forEach((type, index) => {
        console.log(`${index + 1}. ${type.name} (${type.color})`);
      });
    }

  } catch (error) {
    console.error("Error checking mentee opportunities:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMenteeOpportunities(); 