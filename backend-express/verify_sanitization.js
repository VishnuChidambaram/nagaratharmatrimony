import axios from 'axios';

const API_URL = 'http://localhost:5000';

async function testSanitization() {
  console.log("--- Sanitization & Validation Test ---");
  
  try {
    // 1. Test registration trimming
    console.log("1. Testing registration trimming...");
    const regData = {
      name: "  Trim Test  ",
      email: " trim@example.com ",
      phone: " 9876543210 ",
      password: "password123",
      gender: "Male",
      dateOfBirth: "1990-01-01"
    };
    
    // We'll use the /validate-registration endpoint for this test
    const res = await axios.post(`${API_URL}/api/validate-registration`, regData);
    console.log("   Validation result:", res.data.success);

    // 2. Test invalid data
    console.log("2. Testing invalid data types...");
    try {
      await axios.post(`${API_URL}/api/validate-registration`, {
        ...regData,
        gender: "Invalid"
      });
    } catch (error) {
      console.log("   Caught expected error:", error.response.data.message);
      console.log("   Errors:", JSON.stringify(error.response.data.errors));
    }

    console.log("--- Test Completed ---");
  } catch (error) {
    console.error("Test failed:", error.response?.data || error.message);
  }
}

testSanitization();
