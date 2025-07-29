const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Starting to seed test data...');

    // First, let's create some opportunity types
    console.log('📝 Creating opportunity types...');
    
    const opportunityTypes = [
      {
        name: 'Research Fellowship',
        description: 'Research opportunities in urology',
        color: '#3B82F6', // Blue
        isActive: true
      },
      {
        name: 'Clinical Rotation',
        description: 'Clinical training and observation opportunities',
        color: '#10B981', // Green
        isActive: true
      },
      {
        name: 'Conference Presentation',
        description: 'Present research at urology conferences',
        color: '#F59E0B', // Amber
        isActive: true
      },
      {
        name: 'Publication Collaboration',
        description: 'Collaborate on research publications',
        color: '#8B5CF6', // Purple
        isActive: true
      },
      {
        name: 'Surgical Training',
        description: 'Hands-on surgical training opportunities',
        color: '#EF4444', // Red
        isActive: true
      }
    ];

    const createdTypes = [];
    for (const type of opportunityTypes) {
      const createdType = await prisma.opportunityType.upsert({
        where: { name: type.name },
        update: type,
        create: type
      });
      createdTypes.push(createdType);
      console.log(`✅ Created opportunity type: ${createdType.name}`);
    }

    // Get existing users to use as creators
    console.log('👥 Finding users for opportunity creation...');
    
    // Debug: Check all users first
    const allUsers = await prisma.user.findMany({
      where: {
        deletedAt: null
      }
    });
    console.log(`Found ${allUsers.length} total users:`, allUsers.map(u => ({ email: u.email, role: u.role })));
    
    const users = await prisma.user.findMany({
      where: {
        role: 'MENTOR'
      },
      take: 5
    });

    if (users.length === 0) {
      console.log('❌ No mentor users found. Please create some mentor users first.');
      return;
    }

    console.log(`Found ${users.length} mentor users`);

    // Create test opportunities
    console.log('🎯 Creating test opportunities...');
    
    const opportunities = [
      {
        title: 'Prostate Cancer Research Fellowship',
        description: 'Join our research team investigating novel treatments for advanced prostate cancer. This fellowship offers hands-on experience in clinical trials, data analysis, and manuscript preparation.',
        location: 'New York, NY',
        experienceLevel: 'Resident',
        requirements: 'MD/DO degree, interest in urologic oncology, basic research skills',
        benefits: 'Stipend provided, conference attendance, publication opportunities',
        duration: '12 months',
        compensation: '$50,000/year',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'PENDING',
        creatorId: users[0]?.id,
        creatorRole: 'MENTOR',
        opportunityTypeId: createdTypes[0]?.id
      },
      {
        title: 'Robotic Surgery Training Program',
        description: 'Comprehensive training in robotic-assisted urologic surgery. Learn from experienced surgeons in a state-of-the-art facility.',
        location: 'Los Angeles, CA',
        experienceLevel: 'Fellow',
        requirements: 'Urology residency completed, basic laparoscopic skills',
        benefits: 'Hands-on training, certification, networking opportunities',
        duration: '6 months',
        compensation: 'Unpaid training opportunity',
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: 'APPROVED',
        creatorId: users[0]?.id,
        creatorRole: 'MENTOR',
        opportunityTypeId: createdTypes[4]?.id
      },
      {
        title: 'AUA Conference Presentation Opportunity',
        description: 'Present your research findings at the American Urological Association Annual Meeting. Mentorship provided for abstract preparation and presentation skills.',
        location: 'Chicago, IL',
        experienceLevel: 'Resident',
        requirements: 'Original research project, abstract submission',
        benefits: 'Conference registration covered, networking, career development',
        duration: '3 months',
        compensation: 'Travel expenses covered',
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        status: 'PENDING',
        creatorId: users[1]?.id || users[0]?.id,
        creatorRole: 'MENTOR',
        opportunityTypeId: createdTypes[2]?.id
      },
      {
        title: 'Clinical Rotation in Pediatric Urology',
        description: 'Gain experience in pediatric urology through this clinical rotation. Work with children and their families in a supportive environment.',
        location: 'Boston, MA',
        experienceLevel: 'Medical Student',
        requirements: 'Medical student in good standing, interest in pediatrics',
        benefits: 'Clinical experience, letters of recommendation, mentorship',
        duration: '4 weeks',
        compensation: 'Unpaid rotation',
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'APPROVED',
        creatorId: users[1]?.id || users[0]?.id,
        creatorRole: 'MENTOR',
        opportunityTypeId: createdTypes[1]?.id
      },
      {
        title: 'Research Publication Collaboration',
        description: 'Collaborate on a systematic review of minimally invasive treatments for BPH. Opportunity to be first author on high-impact publication.',
        location: 'Remote',
        experienceLevel: 'Resident',
        requirements: 'Literature review skills, statistical analysis knowledge',
        benefits: 'First authorship, publication in top journal, research experience',
        duration: '8 months',
        compensation: 'Unpaid collaboration',
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        status: 'PENDING',
        creatorId: users[2]?.id || users[0]?.id,
        creatorRole: 'MENTOR',
        opportunityTypeId: createdTypes[3]?.id
      },
      {
        title: 'Endourology Fellowship',
        description: 'Advanced training in endourological procedures including stone management, laser therapy, and minimally invasive techniques.',
        location: 'Houston, TX',
        experienceLevel: 'Fellow',
        requirements: 'Urology residency, interest in endourology',
        benefits: 'Comprehensive training, certification, job placement assistance',
        duration: '12 months',
        compensation: '$60,000/year',
        applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
        status: 'APPROVED',
        creatorId: users[2]?.id || users[0]?.id,
        creatorRole: 'MENTOR',
        opportunityTypeId: createdTypes[4]?.id
      },
      {
        title: 'Quality Improvement Project',
        description: 'Lead a quality improvement initiative in urology department. Focus on reducing surgical site infections and improving patient outcomes.',
        location: 'Philadelphia, PA',
        experienceLevel: 'Resident',
        requirements: 'Quality improvement experience, data analysis skills',
        benefits: 'Leadership experience, publication opportunity, QI certification',
        duration: '6 months',
        compensation: 'Unpaid project',
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        status: 'REJECTED',
        creatorId: users[3]?.id || users[0]?.id,
        creatorRole: 'MENTOR',
        opportunityTypeId: createdTypes[0]?.id
      },
      {
        title: 'International Medical Mission',
        description: 'Join our medical mission to provide urological care in underserved communities. Gain experience in resource-limited settings.',
        location: 'Nairobi, Kenya',
        experienceLevel: 'Resident',
        requirements: 'Medical license, travel documentation, cultural sensitivity',
        benefits: 'International experience, cultural immersion, humanitarian work',
        duration: '2 weeks',
        compensation: 'Travel and accommodation provided',
        applicationDeadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days from now
        status: 'PENDING',
        creatorId: users[3]?.id || users[0]?.id,
        creatorRole: 'MENTOR',
        opportunityTypeId: createdTypes[1]?.id
      }
    ];

    const createdOpportunities = [];
    for (const opportunity of opportunities) {
      const createdOpportunity = await prisma.opportunity.create({
        data: opportunity
      });
      createdOpportunities.push(createdOpportunity);
      console.log(`✅ Created opportunity: ${createdOpportunity.title} (${createdOpportunity.status})`);
    }

    // Create some test applications
    console.log('📋 Creating test applications...');
    
    const mentees = await prisma.user.findMany({
      where: {
        role: 'MENTEE'
      },
      take: 3
    });

    if (mentees.length > 0) {
      const applications = [
        {
          opportunityId: createdOpportunities[1]?.id, // Robotic Surgery Training
          menteeId: mentees[0]?.id,
          coverLetter: 'I am very interested in robotic surgery and believe this training program would be perfect for my career goals. I have completed my residency and am eager to learn advanced techniques.',
          status: 'PENDING'
        },
        {
          opportunityId: createdOpportunities[3]?.id, // Pediatric Urology Rotation
          menteeId: mentees[1]?.id || mentees[0]?.id,
          coverLetter: 'As a medical student interested in pediatrics, I would love the opportunity to rotate in pediatric urology. I have experience working with children and am passionate about this field.',
          status: 'ACCEPTED'
        },
        {
          opportunityId: createdOpportunities[4]?.id, // Research Publication
          menteeId: mentees[2]?.id || mentees[0]?.id,
          coverLetter: 'I have strong research skills and experience in systematic reviews. I am excited about the opportunity to collaborate on this important publication about BPH treatments.',
          status: 'PENDING'
        }
      ];

      for (const application of applications) {
        if (application.opportunityId && application.menteeId) {
          const createdApplication = await prisma.application.create({
            data: application
          });
          console.log(`✅ Created application for opportunity ID: ${createdApplication.opportunityId}`);
        }
      }
    }

    // Create some saved opportunities
    console.log('💾 Creating saved opportunities...');
    
    if (mentees.length > 0) {
      const savedOpportunities = [
        {
          opportunityId: createdOpportunities[0]?.id, // Prostate Cancer Research
          userId: mentees[0]?.id
        },
        {
          opportunityId: createdOpportunities[2]?.id, // AUA Conference
          userId: mentees[0]?.id
        },
        {
          opportunityId: createdOpportunities[5]?.id, // Endourology Fellowship
          userId: mentees[1]?.id || mentees[0]?.id
        }
      ];

      for (const saved of savedOpportunities) {
        if (saved.opportunityId && saved.userId) {
          const createdSaved = await prisma.savedOpportunity.create({
            data: saved
          });
          console.log(`✅ Created saved opportunity for user ID: ${createdSaved.userId}`);
        }
      }
    }

    console.log('\n🎉 Test data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Created ${createdTypes.length} opportunity types`);
    console.log(`   - Created ${createdOpportunities.length} opportunities`);
    console.log(`   - Created applications and saved opportunities`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedTestData(); 