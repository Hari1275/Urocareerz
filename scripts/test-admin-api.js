const fetch = require("node-fetch");

async function testAdminAPI() {
  try {
    console.log("Testing admin API...");

    // First, let's try to get the admin API without authentication
    console.log("\n1. Testing without authentication:");
    const response1 = await fetch("http://localhost:3000/api/admin/users");
    console.log("Status:", response1.status);
    const text1 = await response1.text();
    console.log("Response:", text1);

    // Now let's try with a fake token
    console.log("\n2. Testing with fake token:");
    const response2 = await fetch("http://localhost:3000/api/admin/users", {
      headers: {
        Cookie: "token=fake_token_here",
      },
    });
    console.log("Status:", response2.status);
    const text2 = await response2.text();
    console.log("Response:", text2);
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testAdminAPI();
