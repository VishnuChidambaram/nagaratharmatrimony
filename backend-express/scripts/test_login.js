import db from "../models/index.js";
import bcrypt from "bcrypt";

async function testLogin() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected\n");
    
    const email = "user1@example.com";
    const password = "SamplePassword123";
    
    console.log("🔍 Testing Login Flow");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);
    
    // Find user
    const user = await db.UserDetail.findOne({ where: { email } });
    
    if (!user) {
      console.log("❌ User NOT found in database!");
      process.exit(1);
    }
    
    console.log("✅ User found in database");
    console.log(`   User ID: ${user.user_id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Gender: ${user.gender}`);
    console.log(`   Has Password: ${!!user.password}`);
    console.log(`   Session ID: ${user.sessionId || '(none)'}\n`);
    
    // Test password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log("❌ Password does NOT match!");
      console.log("   The password in the database might be different.\n");
      process.exit(1);
    }
    
    console.log("✅ Password matches!");
    console.log("\n📊 Login Test Result: SUCCESS");
    console.log("   The user CAN log in with these credentials.\n");
    
    // Show what data would be returned
    console.log("📋 User Profile Summary:");
    console.log(`   Temple: ${user.yourTemple || '(not set)'}`);
    console.log(`   Division: ${user.yourDivision || '(not set)'}`);
    console.log(`   Date of Birth: ${user.dateOfBirth || '(not set)'}`);
    console.log(`   Phone: ${user.phone || '(not set)'}\n`);
    
    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testLogin();
