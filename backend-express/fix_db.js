import sequelize from "./config/database.js";

async function fixDb() {
  try {
    console.log("Adding missing columns to userdetails table...");
    await sequelize.query("ALTER TABLE userdetails ADD COLUMN referralDetails1Email VARCHAR(255) AFTER referralDetails1Phone");
    await sequelize.query("ALTER TABLE userdetails ADD COLUMN referralDetails2Email VARCHAR(255) AFTER referralDetails2Phone");
    console.log("Columns added successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating table:", error);
    process.exit(1);
  }
}

fixDb();
