const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addOpportunitiesForHari() {
  try {
    console.log("Adding opportunities for hari (i21187654@gmail.com)...");

    // Find the mentee
    const mentee = await prisma.user.findUnique({
      where: { email: "i21187654@gmail.com" },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (!mentee) {
      console.log("Mentee not found with email i21187654@gmail.com");
      return;
    }

    console.log(`Found mentee: ${mentee.email} (${mentee.firstName} ${mentee.lastName})`);

    // Get opportunity types
    const opportunityTypes = await prisma.opportunityType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    if (opportunityTypes.length === 0) {
      console.log("No opportunity types found.");
      return;
    }

    // Test mentee opportunities data for hari
    const testOpportunities = [
      {
        title: "Research Fellowship at Mayo Clinic",
        description: "Exciting research fellowship opportunity focusing on urological oncology. Work with leading researchers on cutting-edge treatments and clinical trials.",
        location: "Rochester, MN",
        experienceLevel: "SENIOR",
        opportunityTypeId: opportunityTypes.find(t => t.name === "FELLOWSHIP")?.id || opportunityTypes[0].id,
        requirements: "Medical degree, research experience, strong analytical skills",
        benefits: "Competitive stipend, health insurance, research funding, publication opportunities",
        duration: "18 months",
        compensation: "$65,000/year",
        applicationDeadline: "2024-12-15",
        sourceUrl: "https://careers.mayoclinic.org/fellowship",
        sourceName: "Mayo Clinic Careers",
        status: "APPROVED"
      },
      {
        title: "Urology Internship Program",
        description: "Hands-on internship program providing exposure to various urological procedures and patient care in a clinical setting.",
        location: "New York, NY",
        experienceLevel: "ENTRY",
        opportunityTypeId: opportunityTypes.find(t => t.name === "INTERNSHIP")?.id || opportunityTypes[0].id,
        requirements: "Currently enrolled in medical school, interest in urology",
        benefits: "Clinical experience, mentorship, networking opportunities, potential for future residency",
        duration: "8 weeks",
        compensation: "Unpaid (academic credit available)",
        applicationDeadline: "2024-11-30",
        sourceUrl: "https://nyuhospital.org/internships",
        sourceName: "NYU Hospital",
        status: "PENDING"
      },
      {
        title: "Urology Observership Program",
        description: "Observership program allowing medical students to shadow experienced urologists and learn about the field.",
        location: "Los Angeles, CA",
        experienceLevel: "ENTRY",
        opportunityTypeId: opportunityTypes.find(t => t.name === "OBSERVERSHIP")?.id || opportunityTypes[0].id,
        requirements: "Medical student, letter of recommendation, valid ID",
        benefits: "Direct observation of procedures, networking, career guidance",
        duration: "4 weeks",
        compensation: "Free",
        applicationDeadline: "2024-12-31",
        sourceUrl: "https://uclahealth.org/observership",
        sourceName: "UCLA Health",
        status: "PENDING"
      },
      {
        title: "Urology Job - Staff Physician",
        description: "Full-time staff physician position in a busy urology practice. Opportunity to work with a diverse patient population.",
        location: "Chicago, IL",
        experienceLevel: "SENIOR",
        opportunityTypeId: opportunityTypes.find(t => t.name === "JOB")?.id || opportunityTypes[0].id,
        requirements: "Board certified urologist, valid medical license, 3+ years experience",
        benefits: "Competitive salary, health insurance, retirement plan, continuing education",
        duration: "Full-time",
        compensation: "$350,000/year",
        applicationDeadline: "2024-10-15",
        sourceUrl: "https://chicagourology.com/careers",
        sourceName: "Chicago Urology Associates",
        status: "REJECTED"
      },
      {
        title: "Urology Conference - EAU Annual Congress",
        description: "European Association of Urology Annual Congress. Premier international conference for urology professionals.",
        location: "Paris, France",
        experienceLevel: "MID",
        opportunityTypeId: opportunityTypes.find(t => t.name === "CONFERENCE")?.id || opportunityTypes[0].id,
        requirements: "Medical background, interest in urology, abstract submission",
        benefits: "International networking, latest research presentations, continuing education credits",
        duration: "5 days",
        compensation: "Registration fee covered, travel stipend available",
        applicationDeadline: "2024-09-01",
        sourceUrl: "https://eaucongress.org",
        sourceName: "European Association of Urology",
        status: "CONVERTED"
      }
    ];

    // Create mentee opportunities
    for (const opportunityData of testOpportunities) {
      const opportunity = await prisma.menteeOpportunity.create({
        data: {
          ...opportunityData,
          menteeId: mentee.id,
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

    console.log("\nTest mentee opportunities added successfully for hari!");
    
    // Display summary
    const totalOpportunities = await prisma.menteeOpportunity.count({
      where: { menteeId: mentee.id }
    });
    
    console.log(`\nTotal opportunities for ${mentee.email}: ${totalOpportunities}`);
    
    const opportunitiesByStatus = await prisma.menteeOpportunity.groupBy({
      by: ['status'],
      where: { menteeId: mentee.id },
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

addOpportunitiesForHari(); 