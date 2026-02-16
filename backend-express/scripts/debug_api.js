import db from "../models/index.js";

async function debugAllDetails() {
  try {
    const currentUserEmail = "user1@example.com";
    console.log(`Searching for current user: ${currentUserEmail}`);
    
    // Check if db and models are correctly loaded
    if (!db || !db.UserDetail) {
      console.error("Database or UserDetail model not loaded correctly");
      return;
    }

    const currentUser = await db.UserDetail.findOne({ where: { email: currentUserEmail } });
    
    if (!currentUser) {
      console.log("Current user not found in database.");
      // List a few users to see what's there
      const someUsers = await db.UserDetail.findAll({ limit: 5 });
      console.log("Existing users in DB:", someUsers.map(u => u.email));
      return;
    }

    console.log(`Current user found: ${currentUser.email}, Gender: ${currentUser.gender}`);

    const maleGenders = ["Male", "ஆண்"];
    const femaleGenders = ["Female", "பெண்"];
    
    let targetGenders = [];
    if (maleGenders.includes(currentUser.gender)) {
      targetGenders = femaleGenders;
    } else if (femaleGenders.includes(currentUser.gender)) {
      targetGenders = maleGenders;
    }

    console.log(`Target genders for ${currentUser.gender}:`, targetGenders);

    let whereClause = { is_deleted: false };
    if (targetGenders.length > 0) {
      whereClause = {
        [db.Sequelize ? db.Sequelize.Op.and : 'and']: [
          { is_deleted: false },
          {
            [db.Sequelize ? db.Sequelize.Op.or : 'or']: [
              { gender: targetGenders },
              { email: currentUserEmail }
            ]
          }
        ]
      };
    }

    console.log("Where Clause:", JSON.stringify(whereClause, null, 2));

    const allDetails = await db.UserDetail.findAll({
      where: whereClause
    });

    console.log(`Found ${allDetails.length} users for ${currentUserEmail}`);
    if (allDetails.length > 0) {
      console.log("Sample result (first 1):", allDetails[0].email);
    }

  } catch (error) {
    console.error("CRITICAL DEBUG ERROR:", error);
  } finally {
    if (db && db.sequelize) {
      await db.sequelize.close();
    }
  }
}

debugAllDetails();
