import db from "./models/index.js";

const addColumn = async () => {
  try {
    console.log("Authenticating...");
    await db.sequelize.authenticate();
    console.log("Connected to DB.");

    // Check if column exists first
    const [results] = await db.sequelize.query(
      "SHOW COLUMNS FROM `userdetails` LIKE 'sessionId';"
    );

    if (results.length === 0) {
      console.log("Adding sessionId column...");
      await db.sequelize.query(
        "ALTER TABLE `userdetails` ADD COLUMN `sessionId` VARCHAR(255) NULL;"
      );
      console.log("Column added successfully.");
    } else {
      console.log("Column 'sessionId' already exists.");
    }
    
    // Also check AdminLogin just in case
    const [adminResults] = await db.sequelize.query(
      "SHOW COLUMNS FROM `admin_login` LIKE 'sessionId';"
    );
     if (adminResults.length === 0) {
      console.log("Adding sessionId column to admin_login...");
      await db.sequelize.query(
        "ALTER TABLE `admin_login` ADD COLUMN `sessionId` VARCHAR(255) NULL;"
      );
      console.log("Column added to admin_login successfully.");
    } else {
      console.log("Column 'sessionId' already exists in admin_login.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

addColumn();
