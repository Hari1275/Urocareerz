const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log("Checking admin user...");

    const adminUser = await prisma.user.findFirst({
      where: {
        email: "lodaka8342@hadvar.com",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        otpSecret: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    if (adminUser) {
      console.log("Admin user found:");
      console.log(`- Email: ${adminUser.email}`);
      console.log(`- Role: ${adminUser.role}`);
      console.log(`- Status: ${adminUser.otpSecret ? "pending" : "active"}`);
      console.log(`- Deleted: ${adminUser.deletedAt ? "Yes" : "No"}`);
    } else {
      console.log("Admin user not found!");
    }

    // Check all users with ADMIN role
    const allAdmins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        otpSecret: true,
        deletedAt: true,
      },
    });

    console.log(`\nTotal admin users: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(
        `${index + 1}. ${admin.email} - Status: ${
          admin.otpSecret ? "pending" : "active"
        } - Deleted: ${admin.deletedAt ? "Yes" : "No"}`
      );
    });
  } catch (error) {
    console.error("Error checking admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
