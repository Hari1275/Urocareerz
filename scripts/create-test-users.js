const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('👥 Creating test users...');

    // Create mentor users
    const mentorUsers = [
      {
        email: 'dr.smith@urocareerz.com',
        firstName: 'Dr. Michael',
        lastName: 'Smith',
        role: 'MENTOR',
        otpSecret: null, // Verified user
        profile: {
          bio: 'Chief of Urology at Memorial Hospital with 15+ years of experience in robotic surgery.',
          location: 'New York, NY',
          interests: ['Robotic Surgery', 'Prostate Cancer', 'Clinical Research'],
          education: 'MD - Harvard Medical School',
          purposeOfRegistration: 'To mentor young urologists and share knowledge'
        }
      },
      {
        email: 'dr.johnson@urocareerz.com',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'MENTOR',
        otpSecret: null,
        profile: {
          bio: 'Pediatric Urologist specializing in minimally invasive procedures for children.',
          location: 'Boston, MA',
          interests: ['Pediatric Urology', 'Minimally Invasive Surgery', 'Medical Education'],
          education: 'MD - Johns Hopkins University',
          purposeOfRegistration: 'To provide clinical training opportunities for medical students and residents'
        }
      },
      {
        email: 'dr.williams@urocareerz.com',
        firstName: 'Dr. Robert',
        lastName: 'Williams',
        role: 'MENTOR',
        otpSecret: null,
        profile: {
          bio: 'Research Director focusing on urologic oncology and clinical trials.',
          location: 'Los Angeles, CA',
          interests: ['Urologic Oncology', 'Clinical Trials', 'Research Methodology'],
          education: 'MD, PhD - Stanford University',
          purposeOfRegistration: 'To collaborate on research projects and mentor researchers'
        }
      },
      {
        email: 'dr.brown@urocareerz.com',
        firstName: 'Dr. Emily',
        lastName: 'Brown',
        role: 'MENTOR',
        otpSecret: null,
        profile: {
          bio: 'Endourologist with expertise in stone management and laser therapy.',
          location: 'Houston, TX',
          interests: ['Endourology', 'Stone Management', 'Laser Therapy'],
          education: 'MD - Baylor College of Medicine',
          purposeOfRegistration: 'To provide surgical training and mentorship'
        }
      }
    ];

    console.log('🏥 Creating mentor users...');
    for (const mentor of mentorUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: mentor.email }
      });

      if (!existingUser) {
        const createdMentor = await prisma.user.create({
          data: {
            email: mentor.email,
            firstName: mentor.firstName,
            lastName: mentor.lastName,
            role: mentor.role,
            otpSecret: mentor.otpSecret
          }
        });

        // Create profile for the mentor
        await prisma.profile.create({
          data: {
            userId: createdMentor.id,
            bio: mentor.profile.bio,
            location: mentor.profile.location,
            interests: mentor.profile.interests,
            education: mentor.profile.education,
            purposeOfRegistration: mentor.profile.purposeOfRegistration
          }
        });

        console.log(`✅ Created mentor: ${mentor.firstName} ${mentor.lastName} (${mentor.email})`);
      } else {
        console.log(`⏭️  Mentor already exists: ${mentor.email}`);
      }
    }

    // Create mentee users
    const menteeUsers = [
      {
        email: 'resident.lee@urocareerz.com',
        firstName: 'Dr. Jennifer',
        lastName: 'Lee',
        role: 'MENTEE',
        otpSecret: null,
        profile: {
          bio: 'Urology resident in final year, interested in robotic surgery and oncology.',
          location: 'Chicago, IL',
          interests: ['Robotic Surgery', 'Urologic Oncology', 'Clinical Research'],
          education: 'MD - University of Chicago',
          purposeOfRegistration: 'To find mentorship and training opportunities in robotic surgery'
        }
      },
      {
        email: 'student.garcia@urocareerz.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'MENTEE',
        otpSecret: null,
        profile: {
          bio: 'Medical student interested in urology, particularly pediatric urology.',
          location: 'Miami, FL',
          interests: ['Pediatric Urology', 'Medical Education', 'Clinical Rotations'],
          education: 'Medical Student - University of Miami',
          purposeOfRegistration: 'To find clinical rotation opportunities and mentorship'
        }
      },
      {
        email: 'fellow.kumar@urocareerz.com',
        firstName: 'Dr. Raj',
        lastName: 'Kumar',
        role: 'MENTEE',
        otpSecret: null,
        profile: {
          bio: 'Urology fellow specializing in endourology and stone management.',
          location: 'Seattle, WA',
          interests: ['Endourology', 'Stone Management', 'Research'],
          education: 'MD - University of Washington',
          purposeOfRegistration: 'To find research collaboration opportunities and advanced training'
        }
      }
    ];

    console.log('🎓 Creating mentee users...');
    for (const mentee of menteeUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: mentee.email }
      });

      if (!existingUser) {
        const createdMentee = await prisma.user.create({
          data: {
            email: mentee.email,
            firstName: mentee.firstName,
            lastName: mentee.lastName,
            role: mentee.role,
            otpSecret: mentee.otpSecret
          }
        });

        // Create profile for the mentee
        await prisma.profile.create({
          data: {
            userId: createdMentee.id,
            bio: mentee.profile.bio,
            location: mentee.profile.location,
            interests: mentee.profile.interests,
            education: mentee.profile.education,
            purposeOfRegistration: mentee.profile.purposeOfRegistration
          }
        });

        console.log(`✅ Created mentee: ${mentee.firstName} ${mentee.lastName} (${mentee.email})`);
      } else {
        console.log(`⏭️  Mentee already exists: ${mentee.email}`);
      }
    }

    console.log('\n🎉 Test users creation completed successfully!');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestUsers(); 