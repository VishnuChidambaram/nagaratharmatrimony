import db from "./models/index.js";

const syncDB = async () => {
  try {
    console.log("Authenticating...");
    await db.sequelize.authenticate();
    console.log("Connected to DB.");
    
    console.log("Syncing database with alter: true...");
    await db.sequelize.sync({ alter: true });
    console.log("Sync completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
};

syncDB();
