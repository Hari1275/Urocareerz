const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    const adminEmail = "lodaka8342@hadvar.com";

    console.log("Checking admin user...");

    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("✅ User found:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Name:", user.firstName, user.lastName);
    console.log("Role:", user.role);
    console.log(
      "Status:",
      user.otpSecret ? "Pending Verification" : "Verified"
    );
    console.log("Created:", user.createdAt);

    if (user.role !== "ADMIN") {
      console.log("\n🔄 Updating role to ADMIN...");
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "ADMIN" },
      });
      console.log("✅ Role updated to ADMIN");
    } else {
      console.log("✅ User already has ADMIN role");
    }

    console.log("\n📝 Next steps:");
    console.log("1. Go to http://localhost:3000/login");
    console.log("2. Enter email: lamejoc243@dariolo.com");
    console.log('3. Click "Send OTP"');
    console.log("4. Check your email for the OTP code");
    console.log("5. Enter the OTP and login");
    console.log("6. You will be redirected to /admin dashboard");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
