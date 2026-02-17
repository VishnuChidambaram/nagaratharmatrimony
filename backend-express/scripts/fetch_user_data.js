
import db from '../models/index.js';

async function fetchUsers() {
  try {
    const users = await db.UserDetail.findAll({ limit: 5 });
    console.log("First 5 users:");
    users.forEach(u => console.log(u.email));

    if (users.length > 0) {
      const user = users[0];
      console.log("\nDetails for", user.email);
      console.log(JSON.stringify(user.toJSON(), null, 2));
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    await db.sequelize.close(); // Close connection
  }
}

fetchUsers();
