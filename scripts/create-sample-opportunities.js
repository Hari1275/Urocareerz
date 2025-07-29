const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleOpportunities() {
  console.log('Creating sample opportunities...');
  
  try {
    // Get or create opportunity types
    const fellowshipType = await prisma.opportunityType.upsert({
      where: { name: 'Fellowship' },
      update: {},
      create: {
        name: 'Fellowship',
        description: 'Fellowship opportunities in urology',
        color: 'blue',
      },
    });

    const researchType = await prisma.opportunityType.upsert({
      where: { name: 'Research' },
      update: {},
      create: {
        name: 'Research',
        description: 'Research opportunities in urology',
        color: 'green',
      },
    });

    const clinicalType = await prisma.opportunityType.upsert({
      where: { name: 'Clinical' },
      update: {},
      create: {
        name: 'Clinical',
        description: 'Clinical opportunities in urology',
        color: 'purple',
      },
    });

    // Get or create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@urocareerz.com' },
      update: {},
      create: {
        email: 'admin@urocareerz.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        termsAccepted: true,
      },
    });

    // Get or create mentor user
    const mentorUser = await prisma.user.upsert({
      where: { email: 'mentor@urocareerz.com' },
      update: {},
      create: {
        email: 'mentor@urocareerz.com',
        firstName: 'Dr. John',
        lastName: 'Smith',
        role: 'MENTOR',
        termsAccepted: true,
      },
    });

    // Get or create mentee user
    const menteeUser = await prisma.user.upsert({
      where: { email: 'mentee@urocareerz.com' },
      update: {},
      create: {
        email: 'mentee@urocareerz.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'MENTEE',
        termsAccepted: true,
      },
    });

    // Create sample opportunities
    const opportunities = [
      {
        title: 'Urology Fellowship Program',
        description: 'A comprehensive fellowship program in urology with hands-on clinical experience.',
        location: 'New York, NY',
        experienceLevel: 'Advanced',
        opportunityTypeId: fellowshipType.id,
        creatorId: mentorUser.id,
        creatorRole: 'MENTOR',
        status: 'APPROVED',
        requirements: 'Board certified in urology, minimum 3 years experience',
        benefits: 'Competitive salary, health insurance, CME allowance',
        duration: '2 years',
        compensation: '$120,000/year',
        applicationDeadline: new Date('2025-06-30'),
      },
      {
        title: 'Urology Research Assistant',
        description: 'Join our research team working on innovative urological treatments.',
        location: 'Boston, MA',
        experienceLevel: 'Mid',
        opportunityTypeId: researchType.id,
        creatorId: mentorUser.id,
        creatorRole: 'MENTOR',
        status: 'APPROVED',
        requirements: 'MD or PhD in related field, research experience preferred',
        benefits: 'Flexible hours, publication opportunities, conference attendance',
        duration: '1 year',
        compensation: '$80,000/year',
        applicationDeadline: new Date('2025-05-15'),
      },
      {
        title: 'Clinical Urology Position',
        description: 'Exciting opportunity for a urologist to join our growing practice.',
        location: 'Los Angeles, CA',
        experienceLevel: 'Mid',
        opportunityTypeId: clinicalType.id,
        creatorId: mentorUser.id,
        creatorRole: 'MENTOR',
        status: 'PENDING',
        requirements: 'Board certified urologist, California license',
        benefits: 'Partnership track, modern facilities, work-life balance',
        duration: 'Permanent',
        compensation: '$250,000/year',
        applicationDeadline: new Date('2025-07-31'),
      },
      {
        title: 'LinkedIn Urology Fellowship',
        description: 'Great fellowship opportunity I found on LinkedIn for urology residents.',
        location: 'Chicago, IL',
        experienceLevel: 'Entry',
        opportunityTypeId: fellowshipType.id,
        creatorId: menteeUser.id,
        creatorRole: 'MENTEE',
        status: 'PENDING',
        sourceUrl: 'https://linkedin.com/jobs/view/123456',
        sourceName: 'LinkedIn',
        requirements: 'Urology resident, strong academic record',
        benefits: 'Comprehensive training, research opportunities',
        duration: '1 year',
        compensation: '$60,000/year',
        applicationDeadline: new Date('2025-04-30'),
      },
    ];

    for (const oppData of opportunities) {
      const opportunity = await prisma.opportunity.create({
        data: oppData,
      });
      console.log(`Created opportunity: ${opportunity.title}`);
    }

    console.log('✅ Sample opportunities created successfully!');
    console.log(`- ${opportunities.length} opportunities created`);
    console.log('- Mix of mentor and mentee submissions');
    console.log('- Different statuses and opportunity types');

  } catch (error) {
    console.error('Error creating sample opportunities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createSampleOpportunities()
    .then(() => {
      console.log('Sample opportunities script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sample opportunities script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSampleOpportunities }; 