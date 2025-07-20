const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

const opportunityTypes = [
  {
    name: "FELLOWSHIP",
    description: "Structured training programs for medical professionals",
    color: "blue",
  },
  {
    name: "JOB",
    description: "Employment opportunities in healthcare",
    color: "green",
  },
  {
    name: "OBSERVERSHIP",
    description: "Clinical observation and shadowing opportunities",
    color: "purple",
  },
  {
    name: "RESEARCH",
    description: "Research positions and projects",
    color: "yellow",
  },
  {
    name: "INTERNSHIP",
    description: "Temporary work experience opportunities",
    color: "teal",
  },
  {
    name: "VOLUNTEER",
    description: "Volunteer positions in healthcare",
    color: "orange",
  },
  {
    name: "OTHER",
    description: "Other types of opportunities",
    color: "gray",
  },
];

async function seedOpportunityTypes() {
  try {
    console.log("🌱 Seeding opportunity types...");

    for (const type of opportunityTypes) {
      const existing = await prisma.opportunityType.findUnique({
        where: { name: type.name },
      });

      if (!existing) {
        await prisma.opportunityType.create({
          data: type,
        });
        console.log(`✅ Created: ${type.name}`);
      } else {
        console.log(`⏭️  Skipped: ${type.name} (already exists)`);
      }
    }

    console.log("🎉 Opportunity types seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding opportunity types:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedOpportunityTypes();
