const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminEmail = "lodaka8342@hadvar.com";

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log("Admin user already exists:");
      console.log("ID:", existingUser.id);
      console.log("Email:", existingUser.email);
      console.log("Role:", existingUser.role);
      console.log("Created:", existingUser.createdAt);

      // Update role to ADMIN if not already
      if (existingUser.role !== "ADMIN") {
        const updatedUser = await prisma.user.update({
          where: { email: adminEmail },
          data: { role: "ADMIN" },
        });
        console.log("Updated user role to ADMIN");
      }

      return;
    }

    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        // For admin, we don't need OTP verification since they're manually created
        otpSecret: null,
        otpExpiry: null,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("ID:", adminUser.id);
    console.log("Email:", adminUser.email);
    console.log("Role:", adminUser.role);
    console.log("Created:", adminUser.createdAt);
    console.log("\n📝 Next steps:");
    console.log("1. Go to /login");
    console.log("2. Enter email: lamejoc243@dariolo.com");
    console.log('3. Click "Send OTP"');
    console.log("4. Check your email for the OTP code");
    console.log("5. Enter the OTP and login");
    console.log("6. You will be redirected to /admin dashboard");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
