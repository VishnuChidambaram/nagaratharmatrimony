import db from "../models/index.js";
import { Op } from "sequelize";

async function simulateFrontendLogic() {
  try {
    const currentUserEmail = "user1@example.com";
    
    // 1. Fetch Current User
    const currentUser = await db.UserDetail.findOne({ where: { email: currentUserEmail } });
    if (!currentUser) {
        console.log("Current User NOT FOUND");
        return;
    }
    console.log(`Current User: ${currentUser.email}, Gender: ${currentUser.gender}, Temple: ${currentUser.yourTemple}, Division: ${currentUser.yourDivision}`);

    // 2. Fetch All Data (Simulating /all-details API)
    
    const maleGenders = ["Male", "ஆண்"];
    const femaleGenders = ["Female", "பெண்"];
    let targetGenders = [];
    if (maleGenders.includes(currentUser.gender)) {
        targetGenders = femaleGenders;
    } else if (femaleGenders.includes(currentUser.gender)) {
        targetGenders = maleGenders;
    }
    
    console.log(`Target Genders: ${targetGenders}`);

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
    
    const data = await db.UserDetail.findAll({ where: whereClause });
    console.log(`API returned ${data.length} records.`);

    // 3. Simulate Frontend Filtering
    let passedCount = 0;
    let failedCount = 0;

    const baseFilteredData = data.filter((item) => {
        const isCurrentUser = currentUserEmail && item.email && item.email.toLowerCase() === currentUserEmail;
        
        if (isCurrentUser) {
          return false; 
        }
    
        // Gender Filter
        if (currentUser.gender) {
          const isCurrentMale = maleGenders.includes(currentUser.gender);
          const isItemMale = maleGenders.includes(item.gender);
          const isItemFemale = femaleGenders.includes(item.gender);
          
          if (isCurrentMale && !isItemFemale) {
             failedCount++;
             return false;
          }
          if (!isCurrentMale && !isItemMale) {
              failedCount++;
              return false;
          }
        }
    
        // Community Rule
        if (currentUser.yourTemple && item.yourTemple === currentUser.yourTemple) {
          if (
            !item.yourDivision ||
            !currentUser.yourDivision ||
            item.yourDivision === currentUser.yourDivision
          ) {
            // console.log(`Filtered out ${item.email} based on Community Rule (Same Temple: ${item.yourTemple})`);
            failedCount++;
            return false;
          }
        }
        passedCount++;
        return true;
      });

      console.log(`Frontend Result: ${passedCount} records visible.`);
      console.log(`Examples of visible users:`);
      baseFilteredData.slice(0, 3).forEach(u => console.log(`- ${u.email} (${u.gender})`));

  } catch (error) {
    console.error("Simulation error:", error);
  } finally {
      if (db.sequelize) {
        await db.sequelize.close();
      }
  }
}

simulateFrontendLogic();
