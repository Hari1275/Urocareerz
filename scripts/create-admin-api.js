const fetch = require("node-fetch");

async function createAdminUser() {
  try {
    const adminEmail = "lamejoc243@dariolo.com";

    console.log("Creating admin user...");

    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: adminEmail,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Admin user created successfully!");
      console.log("Response:", data);
      console.log("\n📝 Next steps:");
      console.log("1. Check your email for the OTP code");
      console.log("2. Go to /verify");
      console.log("3. Enter email: lamejoc243@dariolo.com");
      console.log("4. Enter the OTP code from your email");
      console.log(
        "5. You will be logged in and redirected to /admin dashboard"
      );

      if (data.otp) {
        console.log("\n🔑 Development OTP (for testing):", data.otp);
      }
    } else {
      console.error("❌ Error creating admin user:", data);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("Make sure the development server is running (npm run dev)");
  }
}

createAdminUser();
