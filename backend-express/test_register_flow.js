
import fetch from "node-fetch";

async function testRegister() {
  const url = "http://127.0.0.1:5000/register";
  const uniqueId = Date.now();
  const body = {
    name: "Test User",
    email: `test_reg_${uniqueId}@example.com`,
    phone: `99${String(uniqueId).slice(-8)}`,
    password: "Password@123",
    gender: "Male",
    dateOfBirth: "1990-01-01",
    // Add other minimal required fields here?
  };

  console.log(`Testing registration at ${url}...`);
  console.log("Payload:", body);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", data);

    if (response.ok && data.success) {
      console.log("SUCCESS: Registration succeeded.");
    } else {
      console.log("FAILURE: Registration failed (expected if testing duplicates, but unexpected for new user).");
    }
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testRegister();
