import db from "../models/index.js";

async function debugFilters() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected\n");
    
    // Get a sample user to test with
    const testUser = await db.UserDetail.findOne({ 
      where: { email: "user1@example.com" } 
    });
    
    if (!testUser) {
      console.log("❌ Test user not found!");
      process.exit(1);
    }
    
    console.log("📋 Test User Info:");
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Gender: ${testUser.gender}`);
    console.log(`   Temple: ${testUser.yourTemple}`);
    console.log(`   Division: ${testUser.yourDivision}\n`);
    
    // Get all non-deleted users
    const allUsers = await db.UserDetail.findAll({
      where: { is_deleted: false }
    });
    
    console.log(`📊 Total Active Users: ${allUsers.length}\n`);
    
    // Simulate backend filter
    const maleGenders = ["Male", "ஆண்"];
    const femaleGenders = ["Female", "பெண்"];
    
    let targetGenders = [];
    if (maleGenders.includes(testUser.gender)) {
      targetGenders = femaleGenders;
      console.log("🔍 Backend: User is Male → Looking for Female profiles");
    } else if (femaleGenders.includes(testUser.gender)) {
      targetGenders = maleGenders;
      console.log("🔍 Backend: User is Female → Looking for Male profiles");
    } else {
      console.log("⚠️  Backend: User has undefined/other gender!");
    }
    
    const backendFiltered = allUsers.filter(u => {
      if (u.email === testUser.email) return true; // Include self
      return targetGenders.includes(u.gender);
    });
    
    console.log(`   After Backend Filter: ${backendFiltered.length} profiles\n`);
    
    // Simulate frontend filters
    let frontendFiltered = backendFiltered.filter(u => {
      // Exclude current user in frontend
      if (u.email === testUser.email) return false;
      
      // Gender filter
      const isCurrentMale = maleGenders.includes(testUser.gender);
      const isItemMale = maleGenders.includes(u.gender);
      const isItemFemale = femaleGenders.includes(u.gender);
      
      if (isCurrentMale && !isItemFemale) return false;
      if (!isCurrentMale && !isItemMale) return false;
      
      // Temple/Division filter
      if (testUser.yourTemple && u.yourTemple === testUser.yourTemple) {
        if (!u.yourDivision || !testUser.yourDivision || 
            u.yourDivision === testUser.yourDivision) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`🔍 Frontend Filters:`);
    console.log(`   Excluded current user: ${backendFiltered.length - (backendFiltered.length - 1)} profile`);
    console.log(`   After Gender Filter: calculating...`);
    console.log(`   After Temple/Division Filter: ${frontendFiltered.length} profiles\n`);
    
    if (frontendFiltered.length === 0) {
      console.log("❌ PROBLEM: All profiles filtered out!\n");
      console.log("🔍 Debugging:");
      
      // Check gender distribution
      const maleCount = allUsers.filter(u => maleGenders.includes(u.gender)).length;
      const femaleCount = allUsers.filter(u => femaleGenders.includes(u.gender)).length;
      console.log(`   Male users: ${maleCount}`);
      console.log(`   Female users: ${femaleCount}\n`);
      
      // Check temple conflicts
      const sameTemple = allUsers.filter(u => 
        u.yourTemple === testUser.yourTemple && u.email !== testUser.email
      );
      console.log(`   Same temple as test user: ${sameTemple.length}`);
      if (sameTemple.length > 0) {
        const withDiffDiv = sameTemple.filter(u => 
          u.yourDivision && testUser.yourDivision && 
          u.yourDivision !== testUser.yourDivision
        );
        console.log(`   Same temple + different division: ${withDiffDiv.length}\n`);
      }
    } else {
      console.log(`✅ SUCCESS: ${frontendFiltered.length} profiles should be visible`);
    }
    
    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

debugFilters();
