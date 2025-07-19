const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function addTestOpportunities() {
  try {
    // First, let's find a mentor user to assign opportunities to
    const mentor = await prisma.user.findFirst({
      where: { role: "MENTOR" },
    });

    if (!mentor) {
      console.log("No mentor found. Creating a test mentor...");
      const testMentor = await prisma.user.create({
        data: {
          email: "test.mentor@example.com",
          firstName: "Dr. John",
          lastName: "Smith",
          role: "MENTOR",
        },
      });
      console.log("Created test mentor:", testMentor.email);
    }

    const mentorId = mentor
      ? mentor.id
      : (await prisma.user.findFirst({ where: { role: "MENTOR" } })).id;

    // Create test opportunities
    const testOpportunities = [
      {
        title: "Urology Fellowship Program",
        description:
          "Join our prestigious urology fellowship program. Gain hands-on experience in advanced urological procedures and research.",
        opportunityType: "FELLOWSHIP",
        location: "New York, NY",
        experienceLevel: "mid",
        requirements:
          "Medical degree, completed residency, strong research background",
        benefits:
          "Competitive salary, research opportunities, conference attendance",
        duration: "2 years",
        compensation: "$80,000/year",
        status: "APPROVED",
        mentorId: mentorId,
      },
      {
        title: "Urology Research Assistant",
        description:
          "Exciting research opportunity in urological oncology. Work on cutting-edge clinical trials and publications.",
        opportunityType: "RESEARCH",
        location: "Boston, MA",
        experienceLevel: "entry",
        requirements:
          "Bachelor's degree in biology or related field, research experience preferred",
        benefits: "Publication opportunities, networking, flexible hours",
        duration: "1 year",
        compensation: "$45,000/year",
        status: "APPROVED",
        mentorId: mentorId,
      },
      {
        title: "Urology Observership",
        description:
          "Shadow experienced urologists in a busy academic medical center. Perfect for medical students and residents.",
        opportunityType: "OBSERVERSHIP",
        location: "Chicago, IL",
        experienceLevel: "entry",
        requirements: "Medical student or resident, letter of recommendation",
        benefits:
          "Hands-on learning, networking, potential research opportunities",
        duration: "4 weeks",
        compensation: "Unpaid",
        status: "APPROVED",
        mentorId: mentorId,
      },
      {
        title: "Urology Nurse Practitioner Position",
        description:
          "Join our urology team as a nurse practitioner. Work with patients in both clinical and surgical settings.",
        opportunityType: "JOB",
        location: "Los Angeles, CA",
        experienceLevel: "senior",
        requirements:
          "NP license, 3+ years experience in urology or related field",
        benefits: "Competitive salary, health benefits, continuing education",
        duration: "Full-time",
        compensation: "$120,000/year",
        status: "APPROVED",
        mentorId: mentorId,
      },
    ];

    console.log("Adding test opportunities...");

    for (const opportunity of testOpportunities) {
      const created = await prisma.opportunity.create({
        data: opportunity,
      });
      console.log(`Created opportunity: ${created.title} (${created.status})`);
    }

    console.log("✅ Test opportunities added successfully!");
    console.log(
      "You can now test the opportunity board at: http://localhost:3001/opportunities"
    );
  } catch (error) {
    console.error("Error adding test opportunities:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestOpportunities();
