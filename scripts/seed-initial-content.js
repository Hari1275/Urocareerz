const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

const initialOpportunities = [
  {
    title: "Urology Research Fellowship",
    description:
      "Join our research team for a comprehensive fellowship in urological research. This position offers hands-on experience in clinical trials, data analysis, and publication opportunities.",
    location: "New York, NY",
    experienceLevel: "Resident/Fellow",
    requirements:
      "MD/DO degree, interest in urological research, strong analytical skills",
    benefits:
      "Competitive salary, health insurance, conference attendance, publication opportunities",
    duration: "12 months",
    compensation: "$65,000 - $75,000 annually",
    applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
  },
  {
    title: "Urology Observership Program",
    description:
      "Gain valuable clinical experience through our structured observership program. Work alongside experienced urologists in a busy academic medical center.",
    location: "Boston, MA",
    experienceLevel: "Medical Student",
    requirements:
      "Currently enrolled in medical school, strong academic record, letter of recommendation",
    benefits:
      "Hands-on clinical experience, networking opportunities, letter of recommendation",
    duration: "4-8 weeks",
    compensation: "Unpaid (educational experience)",
    applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  },
  {
    title: "Urology Clinical Research Coordinator",
    description:
      "Coordinate clinical research studies in urology. This position involves patient recruitment, data collection, and study management.",
    location: "Los Angeles, CA",
    experienceLevel: "Entry Level",
    requirements:
      "Bachelor's degree in health sciences, strong organizational skills, attention to detail",
    benefits:
      "Health insurance, paid time off, professional development opportunities",
    duration: "Full-time position",
    compensation: "$45,000 - $55,000 annually",
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
  },
  {
    title: "Urology Surgical Assistant",
    description:
      "Assist urologists in surgical procedures. This role provides excellent exposure to urological surgery and patient care.",
    location: "Chicago, IL",
    experienceLevel: "Experienced",
    requirements:
      "Surgical technologist certification or equivalent experience, strong teamwork skills",
    benefits:
      "Competitive salary, health benefits, continuing education support",
    duration: "Full-time position",
    compensation: "$50,000 - $65,000 annually",
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  {
    title: "Urology Data Analyst",
    description:
      "Analyze urological data and contribute to research publications. Work with large datasets and statistical analysis.",
    location: "Remote",
    experienceLevel: "Mid-level",
    requirements:
      "Master's degree in biostatistics or related field, experience with statistical software",
    benefits: "Remote work, flexible schedule, publication opportunities",
    duration: "Contract position (6-12 months)",
    compensation: "$70,000 - $85,000 annually",
    applicationDeadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
  },
];

async function seedInitialContent() {
  try {
    console.log("🌱 Starting initial content seeding...");

    // Get the first admin user to assign as mentor for these opportunities
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      return;
    }

    // Get opportunity types
    const opportunityTypes = await prisma.opportunityType.findMany({
      where: { isActive: true },
    });

    if (opportunityTypes.length === 0) {
      console.log(
        "❌ No opportunity types found. Please seed opportunity types first."
      );
      return;
    }

    // Create opportunities
    for (const opportunityData of initialOpportunities) {
      // Assign a random opportunity type
      const randomType =
        opportunityTypes[Math.floor(Math.random() * opportunityTypes.length)];

      const opportunity = await prisma.opportunity.create({
        data: {
          ...opportunityData,
          opportunityTypeId: randomType.id,
          mentorId: adminUser.id,
          status: "APPROVED", // Pre-approve initial content
        },
      });

      console.log(`✅ Created opportunity: ${opportunity.title}`);
    }

    console.log("🎉 Initial content seeding completed successfully!");
    console.log(`📊 Created ${initialOpportunities.length} opportunities`);
  } catch (error) {
    console.error("❌ Error seeding initial content:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedInitialContent();
