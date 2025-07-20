const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function migrateOpportunityTypes() {
  try {
    console.log("🔄 Starting opportunity types migration...");

    // Get all opportunity types
    const opportunityTypes = await prisma.opportunityType.findMany();
    console.log(
      `Found ${opportunityTypes.length} opportunity types:`,
      opportunityTypes.map((t) => t.name)
    );

    // Get all opportunities (we'll check for null opportunityTypeId in the loop)
    const allOpportunities = await prisma.opportunity.findMany();
    const opportunitiesWithNullType = allOpportunities.filter(
      (opp) => !opp.opportunityTypeId
    );

    console.log(
      `Found ${opportunitiesWithNullType.length} opportunities with null opportunityTypeId`
    );

    if (opportunitiesWithNullType.length === 0) {
      console.log("✅ No opportunities need migration");
      return;
    }

    // Create a mapping for old enum values to new type IDs
    const typeMapping = {
      FELLOWSHIP: opportunityTypes.find((t) => t.name === "FELLOWSHIP")?.id,
      JOB: opportunityTypes.find((t) => t.name === "JOB")?.id,
      OBSERVERSHIP: opportunityTypes.find((t) => t.name === "OBSERVERSHIP")?.id,
      RESEARCH: opportunityTypes.find((t) => t.name === "RESEARCH")?.id,
      OTHER: opportunityTypes.find((t) => t.name === "OTHER")?.id,
    };

    console.log("Type mapping:", typeMapping);

    // Update each opportunity
    for (const opportunity of opportunitiesWithNullType) {
      // Try to determine the type from the opportunity data or default to 'OTHER'
      let typeId = typeMapping["OTHER"]; // Default fallback

      // If we can't determine the type, use 'OTHER'
      if (!typeId) {
        console.log(
          `⚠️  No matching type found for opportunity ${opportunity.id}, using OTHER`
        );
        typeId = opportunityTypes.find((t) => t.name === "OTHER")?.id;
      }

      if (typeId) {
        await prisma.opportunity.update({
          where: { id: opportunity.id },
          data: { opportunityTypeId: typeId },
        });
        console.log(
          `✅ Updated opportunity ${opportunity.id} with type ID ${typeId}`
        );
      } else {
        console.log(
          `❌ Could not find valid type for opportunity ${opportunity.id}`
        );
      }
    }

    console.log("🎉 Opportunity types migration completed!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateOpportunityTypes();
