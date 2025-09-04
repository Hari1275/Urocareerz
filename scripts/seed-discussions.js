const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDiscussions() {
  try {
    console.log('🌱 Starting to seed discussion threads...');

    // Get some users to use as authors
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null
      },
      take: 5
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      return;
    }

    console.log(`Found ${users.length} users for discussion creation`);

    // Sample discussion threads
    const discussionData = [
      {
        title: "Best Practices for Robotic Prostatectomy",
        content: "I'm looking for insights on best practices for robotic prostatectomy procedures. What are the key techniques that have improved your outcomes? I'm particularly interested in nerve-sparing approaches and minimizing complications.\n\nAny recent publications or studies you'd recommend?",
        category: "TECHNICAL",
        status: "ACTIVE",
        tags: ["robotics", "prostatectomy", "surgery", "best-practices"],
        authorId: users[0]?.id,
      },
      {
        title: "Career Path: Fellowship vs. Private Practice",
        content: "I'm currently a urology resident trying to decide between pursuing a fellowship (thinking endourology or oncology) versus going straight into private practice.\n\nFor those who have made this decision, what factors influenced your choice? How has it impacted your career trajectory and work-life balance?",
        category: "CAREER_ADVICE", 
        status: "ACTIVE",
        tags: ["fellowship", "private-practice", "career-planning", "residency"],
        authorId: users[1]?.id || users[0]?.id,
      },
      {
        title: "Interesting Case: Unusual Presentation of Kidney Stone",
        content: "Had an interesting case this week - a 45-year-old patient presented with what initially seemed like classic renal colic, but imaging revealed multiple stones with an unusual composition.\n\nThe patient had a history of hyperparathyroidism. CT showed staghorn calculi with mixed calcium oxalate and struvite components. Has anyone encountered similar cases? What treatment approach would you recommend?",
        category: "CASE_DISCUSSION",
        status: "ACTIVE", 
        tags: ["kidney-stones", "staghorn-calculi", "case-study", "hyperparathyroidism"],
        authorId: users[2]?.id || users[0]?.id,
      },
      {
        title: "AUA 2024 Conference Highlights",
        content: "Just returned from the AUA annual meeting. There were some fantastic presentations on immunotherapy for bladder cancer and new minimally invasive techniques for BPH.\n\nFor those who couldn't attend, here are my top takeaways:\n\n1. Promising results with combination immunotherapy protocols\n2. Water vapor therapy showing excellent long-term outcomes\n3. AI applications in urologic imaging\n\nWhat were your highlights if you attended?",
        category: "GENERAL",
        status: "ACTIVE",
        tags: ["AUA", "conference", "immunotherapy", "BPH", "AI"],
        authorId: users[3]?.id || users[0]?.id,
      },
      {
        title: "Research Collaboration Opportunity - Pediatric Urology",
        content: "Our institution is looking for collaborators on a multi-center study examining outcomes of hypospadias repair techniques.\n\nWe're specifically interested in comparing tubularized incised plate urethroplasty with newer techniques. If you have experience with pediatric reconstruction and access to patient data, please reach out.\n\nIRB approval already in place. Looking to start data collection next month.",
        category: "NETWORKING",
        status: "ACTIVE",
        tags: ["research", "collaboration", "pediatric-urology", "hypospadias"],
        authorId: users[4]?.id || users[0]?.id,
      },
      {
        title: "Essential Resources for Urology Residents",
        content: "Creating a comprehensive list of essential resources for urology residents. Here's what I've compiled so far:\n\n**Books:**\n- Campbell-Walsh-Wein Urology\n- Smith & Tanagho's General Urology\n- Hinman's Atlas of Urologic Surgery\n\n**Online Resources:**\n- AUA University\n- Urology Match website\n- Journal of Urology\n\n**Apps:**\n- AUA Guidelines app\n- Medscape\n\nWhat would you add to this list? Any hidden gems that helped during your training?",
        category: "RESOURCES",
        status: "ACTIVE",
        tags: ["resources", "education", "residency", "books", "apps"],
        authorId: users[0]?.id,
      },
      {
        title: "Managing Work-Life Balance in Urology",
        content: "As urologists, we deal with emergency cases, long surgeries, and demanding schedules. How do you maintain a healthy work-life balance?\n\nI'm struggling with:\n- Call schedules disrupting family time\n- Staying current with literature\n- Finding time for research\n- Physical and mental health\n\nWould love to hear strategies that have worked for others in our field.",
        category: "GENERAL",
        status: "ACTIVE",
        tags: ["work-life-balance", "wellness", "career", "family"],
        authorId: users[1]?.id || users[0]?.id,
      },
      {
        title: "New Guidelines for UTI Management",
        content: "The latest AUA/IDSA guidelines for UTI management have some interesting updates. Key changes include:\n\n- Revised recommendations for asymptomatic bacteriuria\n- Updated antibiotic resistance considerations\n- New approaches for recurrent UTI prevention\n\nHas anyone started implementing these changes in practice? What challenges have you encountered?",
        category: "TECHNICAL",
        status: "CLOSED", // Mix of statuses for testing
        tags: ["guidelines", "UTI", "antibiotics", "AUA"],
        authorId: users[2]?.id || users[0]?.id,
      }
    ];

    console.log(`Creating ${discussionData.length} discussion threads...`);

    for (const discussion of discussionData) {
      if (discussion.authorId) {
        const createdDiscussion = await prisma.discussionThread.create({
          data: discussion,
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        });
        console.log(`✅ Created discussion: "${createdDiscussion.title}" by ${createdDiscussion.author.firstName} ${createdDiscussion.author.lastName}`);
      }
    }

    console.log('\n🎉 Discussion threads seeding completed successfully!');
    console.log(`📊 Created ${discussionData.length} discussion threads`);

  } catch (error) {
    console.error('❌ Error seeding discussion threads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedDiscussions();