import db from "./models/index.js";

const sync = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Authenticated");
    await db.AdminLogin.sync(); 
    console.log("AdminLogin Synced");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
sync();
