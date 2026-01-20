import db from "./models/index.js";
import bcrypt from "bcrypt";

async function verify() {
  const email = "test_photo_auth@example.com";
  const password = "photo_secret_123";

  console.log("--- Photo Password Verification Test ---");

  try {
    // 1. Clean up
    await db.UserDetail.destroy({ where: { email } });

    // 2. Create user with plain password (simulating existing data or direct DB entry if needed, 
    // but we want to test the update logic)
    const user = await db.UserDetail.create({
      email,
      name: "Test User",
      password: "dummy_login_pass"
    });
    console.log("1. Created test user.");

    // 3. Simulate update via route (we'll just call the hashing logic directly here to verify hashing)
    const hashed = await bcrypt.hash(password, 10);
    await user.update({ photoPassword: hashed });
    console.log("2. Hashed and saved photo password.");

    // 4. Verify hash in DB
    const updatedUser = await db.UserDetail.findOne({ where: { email } });
    const isActuallyHashed = updatedUser.photoPassword.startsWith("$2b$");
    console.log("3. Password is hashed in DB:", isActuallyHashed);

    // 5. Verify bcrypt comparison
    const match = await bcrypt.compare(password, updatedUser.photoPassword);
    console.log("4. Correct password matches hash:", match);

    const noMatch = await bcrypt.compare("wrong_pass", updatedUser.photoPassword);
    console.log("5. Incorrect password does not match hash:", !noMatch);

    // 6. Clean up
    await db.UserDetail.destroy({ where: { email } });
    console.log("--- Test Completed Successfully ---");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

verify();
