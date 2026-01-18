
import db from "./models/index.js";

async function testCrash() {
  console.log("Starting reproduction script...");
  try {
    console.log("Checking if db.UserDetail is defined...");
    if (!db.UserDetail) {
      console.error("FATAL: db.UserDetail is UNDEFINED!");
      process.exit(1);
    }
    console.log("db.UserDetail is defined.");

    const userEmail = "test@example.com";
    console.log(`Attempting findOne with email: ${userEmail}`);
    
    // Simulate authMiddleware.js line 41
    const user = await db.UserDetail.findOne({ where: { email: userEmail } });
    
    console.log("findOne returned:", user ? "User Found" : "User Not Found");
    console.log("SUCCESS: No crash occurred.");
  } catch (error) {
    console.error("CRASH REPRODUCED:");
    console.error(error);
  } finally {
    try {
        await db.sequelize.close(); 
    } catch(e) {}
  }
}

testCrash();
