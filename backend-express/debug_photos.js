
import db from "./models/index.js";

async function checkPhotos() {
  try {
    await db.sequelize.authenticate();
    const users = await db.UserDetail.findAll({
      where: {
        user_id: [1, 2]
      }
    });

    console.log("--- User 1 & 2 Data Debug ---");
    users.forEach(u => {
      console.log(`ID: ${u.user_id} | Name: ${u.name}`);
      console.log(`Email: ${u.email}`);
      console.log(`Photo: ${u.photo}`);
      console.log(`PhotoPassword: ${u.photoPassword}`);
      console.log('-------------------------');
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.sequelize.close();
  }
}

checkPhotos();
