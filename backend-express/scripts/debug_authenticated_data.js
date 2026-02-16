import db from "../models/index.js";
import { Op } from "sequelize";

async function checkAuthenticatedData() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected\n");
    
    const currentUserEmail = "user1@example.com";
    const currentUser = await db.UserDetail.findOne({ 
      where: { email: currentUserEmail } 
    });
    
    if (!currentUser) {
      console.log("❌ User not found!");
      process.exit(1);
    }
    
    console.log("📋 Current User:");
    console.log(`   Email: ${currentUser.email}`);
    console.log(`   Gender: ${currentUser.gender}`);
    console.log(`   Temple: ${currentUser.yourTemple}`);
    console.log(`   Division: ${currentUser.yourDivision}\n`);
    
    // Simulate backend /all-details endpoint logic
    const maleGenders = ["Male", "ஆண்"];
    const femaleGenders = ["Female", "பெண்"];
    
    let targetGenders = [];
    if (maleGenders.includes(currentUser.gender)) {
      targetGenders = femaleGenders;
    } else if (femaleGenders.includes(currentUser.gender)) {
      targetGenders = maleGenders;
    }
    
    // Backend filter
    const whereClause = {
      [Op.and]: [
        { is_deleted: false },
        {
          [Op.or]: [
            { gender: { [Op.in]: targetGenders } },
            { email: currentUserEmail }
          ]
        }
      ]
    };

    
    const allDetails = await db.UserDetail.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
    });
    
    console.log(`🔍 Backend /all-details Response:`);
    console.log(`   Total profiles returned: ${allDetails.length}`);
    console.log(`   (Includes current user: Yes)\n`);
    
    // Simulate frontend baseFilteredData
    const baseFilteredData = allDetails.filter(item => {
      const isCurrentUser = item.email?.toLowerCase() === currentUserEmail.toLowerCase();
      
      if (isCurrentUser) {
        return false; // Frontend excludes current user
      }
      
      // Gender filter (should already be done by backend, but frontend does it again)
      const isCurrentMale = maleGenders.includes(currentUser.gender);
      const isItemMale = maleGenders.includes(item.gender);
      const isItemFemale = femaleGenders.includes(item.gender);
      
      if (isCurrentMale && !isItemFemale) return false;
      if (!isCurrentMale && !isItemMale) return false;
      
      // Temple/Division filter
      if (currentUser.yourTemple && item.yourTemple === currentUser.yourTemple) {
        if (!item.yourDivision || !currentUser.yourDivision || 
            item.yourDivision === currentUser.yourDivision) {
          console.log(`   ❌ Filtered out: ${item.email} (Same temple, invalid division)`);
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`\n🔍 Frontend Filter Results:`);
    console.log(`   After all filters: ${baseFilteredData.length} profiles\n`);
    
    if (baseFilteredData.length === 0) {
      console.log("❌ PROBLEM: All profiles filtered out!\n");
      
      // Debug why
      console.log("📊 Debugging:");
      const sameTemple = allDetails.filter(u => 
        u.yourTemple === currentUser.yourTemple && 
        u.email !== currentUserEmail
      );
      console.log(`   Profiles with same temple: ${sameTemple.length}`);
      
      if (sameTemple.length > 0) {
        console.log(`   Their divisions:`);
        sameTemple.slice(0, 5).forEach(u => {
          console.log(`     - ${u.email}: Division "${u.yourDivision || '(none)'}"`);
        });
      }
      
      console.log(`\n   Current user division: "${currentUser.yourDivision || '(none)'}"`);
      
      // Check if relaxing temple filter helps
      const withoutTempleFilter = allDetails.filter(item => {
        if (item.email === currentUserEmail) return false;
        const isCurrentMale = maleGenders.includes(currentUser.gender);
        const isItemFemale = femaleGenders.includes(item.gender);
        return isCurrentMale ? isItemFemale : !isItemFemale;
      });
      
      console.log(`\n   Without temple filter: ${withoutTempleFilter.length} profiles`);
      console.log(`   → Temple filter is removing ${withoutTempleFilter.length - baseFilteredData.length} profiles\n`);
    } else {
      console.log("✅ SUCCESS: Profiles should be visible!");
      console.log(`\nSample profiles (first 3):`);
      baseFilteredData.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name} (${p.email})`);
        console.log(`     Temple: ${p.yourTemple}, Division: ${p.yourDivision || '(none)'}`);
      });
    }
    
    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAuthenticatedData();
