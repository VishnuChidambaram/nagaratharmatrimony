import request from 'supertest';
import { app } from './server.js';

async function testValidation(name, payload, expectedSuccess, expectedErrorPart = null) {
  console.log(`\nTesting: ${name}`);
  try {
    const res = await request(app)
      .post('/validate-registration')
      .send(payload)
      .set('Content-Type', 'application/json');
      
    const data = res.body; // Supertest parses JSON automatically
    
    if (data.success === expectedSuccess) {
      if (!expectedSuccess && expectedErrorPart) {
        const errorMsg = Array.isArray(data.errors) ? data.errors.join(", ") : data.message;
        // console.log("DEBUG: errorMsg received:", errorMsg);
        if (errorMsg && errorMsg.includes(expectedErrorPart)) {
             console.log("✅ Passed (Error message matched)");
        } else {
             console.log(`❌ Failed. Expected error containing "${expectedErrorPart}", got "${errorMsg}"`);
        }
      } else {
        console.log("✅ Passed");
      }
    } else {
      console.log(`❌ Failed. Expected success: ${expectedSuccess}, got: ${data.success}`);
      // console.log("Response:", data);
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

async function runTests() {
  console.log("Starting Verification Tests...");

  // Test 1: Empty Data
  await testValidation("Empty Data", {}, false, "Name is required");

  // Test 2: Invalid Email
  await testValidation("Invalid Email", { 
      name: "Test User", 
      email: "invalid-email", 
      phone: "1234567890",
      password: "Password@123",
      gender: "Male",
      dateOfBirth: "2000-01-01"
  }, false, "Invalid email format");

  // Test 3: Weak Password
  await testValidation("Weak Password", { 
      name: "Test User", 
      email: "test@example.com", 
      phone: "9876543210", 
      password: "weak", 
      gender: "Male",
      dateOfBirth: "2000-01-01"
  }, false, "Password must be at least");

  // Test 4: Young Age
  await testValidation("Under Age (1 year old)", { 
      name: "Baby User", 
      email: "baby@example.com", 
      phone: "9876543210", 
      password: "Password@123", 
      gender: "Male",
      dateOfBirth: new Date().toISOString().split('T')[0] 
  }, false, "at least 2 years old");

  // Test 5: Valid Data
  const randomEmail = `test_verification_${Date.now()}@example.com`;
  await testValidation("Valid New User", { 
      name: "New User", 
      email: randomEmail, 
      phone: "9876543210", 
      password: "Password@123", 
      gender: "Male",
      dateOfBirth: "1995-01-01"
  }, true);
  
  // Clean up: We don't need to explicitly close the server as we didn't start one listening on a port manually in this script, 
  // but Sequelize connection might need closing if we wanted a clean exit, but for this script process.exit is fine.
  process.exit(0);
}

runTests();
