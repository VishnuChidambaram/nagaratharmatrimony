
import db from "../models/index.js";

async function testFetch() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected.");

    const users = await db.UserDetail.findAll({
      limit: 5,
      attributes: { exclude: ['photoPassword'] }
    });
    console.log(`Successfully fetched ${users.length} users.`);
    if (users.length > 0) {
        console.log("First user:", users[0].toJSON());
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    await db.sequelize.close();
  }
}

testFetch();
