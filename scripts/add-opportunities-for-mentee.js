const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addOpportunitiesForMentee() {
  try {
    console.log("Adding opportunities for mentee@gmail.com...");

    // Find the mentee
    const mentee = await prisma.user.findUnique({
      where: { email: "mentee@gmail.com" },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!mentee) {
      console.log("Mentee not found. Creating mentee@gmail.com...");
      const newMentee = await prisma.user.create({
        data: {
          email: "mentee@gmail.com",
          firstName: "mentee",
          lastName: "dev",
          role: "MENTEE",
        },
        select: { id: true, email: true, firstName: true, lastName: true }
      });
      console.log(`Created mentee: ${newMentee.email}`);
    }

    const menteeId = mentee ? mentee.id : (await prisma.user.findUnique({
      where: { email: "mentee@gmail.com" },
      select: { id: true }
    })).id;

    // Get opportunity types
    const opportunityTypes = await prisma.opportunityType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    if (opportunityTypes.length === 0) {
      console.log("No opportunity types found.");
      return;
    }

    // Test mentee opportunities data
    const testOpportunities = [
      {
        title: "Research Assistant Position at Johns Hopkins",
        description: "Exciting opportunity to work on cutting-edge urology research projects. The position involves data analysis, literature reviews, and assisting with clinical studies.",
        location: "Baltimore, MD",
        experienceLevel: "ENTRY",
        opportunityTypeId: opportunityTypes.find(t => t.name === "RESEARCH")?.id || opportunityTypes[0].id,
        requirements: "Bachelor's degree in biology or related field, strong analytical skills, attention to detail",
        benefits: "Competitive salary, health insurance, professional development opportunities",
        duration: "12 months",
        compensation: "$45,000/year",
        applicationDeadline: "2024-12-31",
        sourceUrl: "https://jobs.jhu.edu/research-assistant",
        sourceName: "Johns Hopkins Careers",
        status: "PENDING"
      },
      {
        title: "Urology Fellowship Program",
        description: "Comprehensive fellowship program offering hands-on experience in various urological procedures and patient care.",
        location: "Boston, MA",
        experienceLevel: "SENIOR",
        opportunityTypeId: opportunityTypes.find(t => t.name === "FELLOWSHIP")?.id || opportunityTypes[0].id,
        requirements: "Medical degree, completed residency, valid medical license",
        benefits: "Comprehensive training, mentorship, research opportunities",
        duration: "24 months",
        compensation: "$75,000/year",
        applicationDeadline: "2024-11-15",
        sourceUrl: "https://bostonmedical.org/fellowships",
        sourceName: "Boston Medical Center",
        status: "APPROVED"
      },
      {
        title: "Urology Conference - AUA Annual Meeting",
        description: "Join the largest gathering of urologists worldwide. Network with professionals, attend workshops, and present research.",
        location: "San Antonio, TX",
        experienceLevel: "MID",
        opportunityTypeId: opportunityTypes.find(t => t.name === "CONFERENCE")?.id || opportunityTypes[0].id,
        requirements: "Medical background, interest in urology",
        benefits: "Networking opportunities, continuing education credits, exposure to latest research",
        duration: "5 days",
        compensation: "Registration fee covered",
        applicationDeadline: "2024-10-01",
        sourceUrl: "https://auaannualmeeting.org",
        sourceName: "American Urological Association",
        status: "PENDING"
      },
      {
        title: "Mentorship Program for Medical Students",
        description: "Connect with experienced urologists for guidance on career development, research projects, and professional growth.",
        location: "Remote",
        experienceLevel: "ENTRY",
        opportunityTypeId: opportunityTypes.find(t => t.name === "MENTORSHIP")?.id || opportunityTypes[0].id,
        requirements: "Currently enrolled in medical school, interest in urology",
        benefits: "One-on-one mentorship, career guidance, research collaboration opportunities",
        duration: "Ongoing",
        compensation: "Free",
        applicationDeadline: "2024-12-31",
        sourceUrl: "https://urocareerz.com/mentorship",
        sourceName: "UroCareerz Platform",
        status: "CONVERTED"
      },
      {
        title: "Urology Certification Course",
        description: "Comprehensive certification program covering essential urological procedures and best practices.",
        location: "Chicago, IL",
        experienceLevel: "MID",
        opportunityTypeId: opportunityTypes.find(t => t.name === "CERTIFICATION")?.id || opportunityTypes[0].id,
        requirements: "Medical degree, basic urology experience",
        benefits: "Professional certification, hands-on training, continuing education credits",
        duration: "6 months",
        compensation: "$5,000",
        applicationDeadline: "2024-09-30",
        sourceUrl: "https://urologycertification.org",
        sourceName: "Urology Certification Institute",
        status: "REJECTED"
      }
    ];

    // Create mentee opportunities
    for (const opportunityData of testOpportunities) {
      const opportunity = await prisma.menteeOpportunity.create({
        data: {
          ...opportunityData,
          menteeId: menteeId,
          applicationDeadline: opportunityData.applicationDeadline ? new Date(opportunityData.applicationDeadline) : null,
        },
        include: {
          mentee: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          opportunityType: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      });

      console.log(`Created opportunity: ${opportunity.title} (${opportunity.status})`);
    }

    console.log("\nTest mentee opportunities added successfully for mentee@gmail.com!");
    
    // Display summary
    const totalOpportunities = await prisma.menteeOpportunity.count({
      where: { menteeId: menteeId }
    });
    
    console.log(`\nTotal opportunities for mentee@gmail.com: ${totalOpportunities}`);
    
    const opportunitiesByStatus = await prisma.menteeOpportunity.groupBy({
      by: ['status'],
      where: { menteeId: menteeId },
      _count: { status: true }
    });
    
    console.log("Opportunities by status:");
    opportunitiesByStatus.forEach(group => {
      console.log(`  ${group.status}: ${group._count.status}`);
    });

  } catch (error) {
    console.error("Error adding test mentee opportunities:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addOpportunitiesForMentee(); 