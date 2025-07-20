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

async function addProfilesToMentees() {
  try {
    console.log("Adding profiles to existing mentees...");

    // Get all mentees without profiles
    const menteesWithoutProfiles = await prisma.user.findMany({
      where: {
        role: "MENTEE",
        profile: null,
      },
      include: { profile: true },
    });

    console.log(
      `Found ${menteesWithoutProfiles.length} mentees without profiles`
    );

    // Sample profile data for different mentees
    const profileTemplates = [
      {
        bio: "I am a passionate developer from Puttur",
        location: "Puttur, Karnataka",
        interests: ["React", "TypeScript", "Node.js"],
        education: "B.Tech in Computer Science",
        purposeOfRegistration: "Looking for mentorship in web development",
      },
      {
        bio: "Software engineer based in Puttur",
        location: "Puttur",
        interests: ["Python", "Machine Learning", "Data Science"],
        education: "M.Tech in Data Science",
        purposeOfRegistration: "Want to learn advanced ML techniques",
      },
      {
        bio: "Full-stack developer from Puttur area",
        location: "Near Puttur, Karnataka",
        interests: ["JavaScript", "React", "MongoDB"],
        education: "B.E in Information Technology",
        purposeOfRegistration: "Seeking guidance in full-stack development",
      },
      {
        bio: "Mobile app developer",
        location: "Bangalore, Karnataka",
        interests: ["React Native", "Flutter", "Mobile Development"],
        education: "B.Tech in Computer Science",
        purposeOfRegistration: "Looking for mobile development mentorship",
      },
      {
        bio: "DevOps engineer from Puttur",
        location: "Puttur, Karnataka, India",
        interests: ["Docker", "Kubernetes", "AWS"],
        education: "B.Tech in Computer Science",
        purposeOfRegistration: "Want to learn cloud infrastructure",
      },
    ];

    // Add profiles to mentees
    for (let i = 0; i < menteesWithoutProfiles.length; i++) {
      const mentee = menteesWithoutProfiles[i];
      const profileTemplate = profileTemplates[i % profileTemplates.length];

      try {
        const profile = await prisma.profile.create({
          data: {
            userId: mentee.id,
            ...profileTemplate,
          },
        });

        console.log(
          `Added profile to ${mentee.firstName} ${mentee.lastName} (${mentee.email})`
        );
        console.log(`Location: ${profile.location}`);
      } catch (error) {
        console.error(
          `Error adding profile to ${mentee.email}:`,
          error.message
        );
      }
    }

    console.log("Profiles added successfully!");

    // Verify the profiles were added
    const allMentees = await prisma.user.findMany({
      where: { role: "MENTEE" },
      include: { profile: true },
    });

    console.log(`Total mentees in database: ${allMentees.length}`);

    const menteesWithProfiles = allMentees.filter((mentee) => mentee.profile);
    console.log(`Mentees with profiles: ${menteesWithProfiles.length}`);

    const putturMentees = menteesWithProfiles.filter((mentee) =>
      mentee.profile?.location?.toLowerCase().includes("puttur")
    );

    console.log(`Mentees with 'puttur' in location: ${putturMentees.length}`);
    putturMentees.forEach((mentee) => {
      console.log(
        `- ${mentee.firstName} ${mentee.lastName}: ${mentee.profile?.location}`
      );
    });
  } catch (error) {
    console.error("Error adding profiles to mentees:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addProfilesToMentees();
