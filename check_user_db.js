import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "backend-express/.env") });

import db from "./backend-express/models/index.js";

async function checkUser() {
  try {
    const email = "vishnuhero2001@gmail.com";
    const user = await db.UserDetail.findOne({ where: { email } });
    if (user) {
      console.log(`FOUND user ${email}:`, JSON.stringify(user.toJSON(), null, 2).substring(0, 500));
    } else {
      console.log(`NOT FOUND user ${email}`);
      const all = await db.UserDetail.findAll({ limit: 5 });
      console.log("Existing users in DB:", all.map(u => u.email));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.sequelize.close();
  }
}

checkUser();
