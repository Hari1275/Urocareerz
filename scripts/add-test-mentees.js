const { PrismaClient } = require("@prisma/client");

// Use the same Prisma client configuration as the API
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "mongodb+srv://thewebpeopledevelopmentteam:tnxW1k9cAhq7nd1G@urocareerz.5x6g22hn.mongodb.net/uroCareerz",
    },
  },
});

async function addTestMentees() {
  try {
    console.log("Adding test mentees...");

    // Create test mentees with puttur location
    const testMentees = [
      {
        email: "mentee1@test.com",
        firstName: "John",
        lastName: "Doe",
        role: "MENTEE",
        profile: {
          create: {
            bio: "I am a passionate developer from Puttur",
            location: "Puttur, Karnataka",
            interests: ["React", "TypeScript", "Node.js"],
            education: "B.Tech in Computer Science",
            purposeOfRegistration: "Looking for mentorship in web development",
          },
        },
      },
      {
        email: "mentee2@test.com",
        firstName: "Jane",
        lastName: "Smith",
        role: "MENTEE",
        profile: {
          create: {
            bio: "Software engineer based in Puttur",
            location: "Puttur",
            interests: ["Python", "Machine Learning", "Data Science"],
            education: "M.Tech in Data Science",
            purposeOfRegistration: "Want to learn advanced ML techniques",
          },
        },
      },
      {
        email: "mentee3@test.com",
        firstName: "Mike",
        lastName: "Johnson",
        role: "MENTEE",
        profile: {
          create: {
            bio: "Full-stack developer from Puttur area",
            location: "Near Puttur, Karnataka",
            interests: ["JavaScript", "React", "MongoDB"],
            education: "B.E in Information Technology",
            purposeOfRegistration: "Seeking guidance in full-stack development",
          },
        },
      },
      {
        email: "mentee4@test.com",
        firstName: "Sarah",
        lastName: "Wilson",
        role: "MENTEE",
        profile: {
          create: {
            bio: "Mobile app developer",
            location: "Bangalore, Karnataka",
            interests: ["React Native", "Flutter", "Mobile Development"],
            education: "B.Tech in Computer Science",
            purposeOfRegistration: "Looking for mobile development mentorship",
          },
        },
      },
      {
        email: "mentee5@test.com",
        firstName: "David",
        lastName: "Brown",
        role: "MENTEE",
        profile: {
          create: {
            bio: "DevOps engineer from Puttur",
            location: "Puttur, Karnataka, India",
            interests: ["Docker", "Kubernetes", "AWS"],
            education: "B.Tech in Computer Science",
            purposeOfRegistration: "Want to learn cloud infrastructure",
          },
        },
      },
    ];

    for (const menteeData of testMentees) {
      const existingUser = await prisma.user.findUnique({
        where: { email: menteeData.email },
      });

      if (!existingUser) {
        const mentee = await prisma.user.create({
          data: menteeData,
          include: {
            profile: true,
          },
        });
        console.log(
          `Created mentee: ${mentee.firstName} ${mentee.lastName} (${mentee.email})`
        );
        console.log(`Location: ${mentee.profile?.location}`);
      } else {
        console.log(`Mentee already exists: ${menteeData.email}`);
      }
    }

    console.log("Test mentees added successfully!");

    // Verify the mentees were added
    const allMentees = await prisma.user.findMany({
      where: { role: "MENTEE" },
      include: { profile: true },
    });

    console.log(`Total mentees in database: ${allMentees.length}`);

    const putturMentees = allMentees.filter((mentee) =>
      mentee.profile?.location?.toLowerCase().includes("puttur")
    );

    console.log(`Mentees with 'puttur' in location: ${putturMentees.length}`);
    putturMentees.forEach((mentee) => {
      console.log(
        `- ${mentee.firstName} ${mentee.lastName}: ${mentee.profile?.location}`
      );
    });
  } catch (error) {
    console.error("Error adding test mentees:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestMentees();
