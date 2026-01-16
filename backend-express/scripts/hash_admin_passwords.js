import "dotenv/config";
import bcrypt from "bcrypt";
import db from "../models/index.js";
import logger from "../utils/logger.js";

async function hashAdminPasswords() {
  try {
    logger.info("Starting admin password migration...");
    
    // Connect and Sync (ensure models are loaded)
    await db.sequelize.authenticate();
    logger.info("Database connection established.");

    const admins = await db.AdminLogin.findAll();
    logger.info(`Found ${admins.length} admin accounts.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const admin of admins) {
      const password = admin.password;
      
      // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
      if (password && (password.startsWith('$2b$') || password.startsWith('$2a$') || password.startsWith('$2y$'))) {
        logger.info(`Admin ${admin.email} already has a hashed password. Skipping.`);
        skippedCount++;
        continue;
      }

      logger.info(`Hashing password for admin: ${admin.email}`);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await admin.update({ password: hashedPassword });
      updatedCount++;
    }

    logger.info("Admin password migration completed successfully.");
    logger.info(`Summary: Updated: ${updatedCount}, Skipped: ${skippedCount}`);
    
    process.exit(0);
  } catch (error) {
    logger.error(`Critical error during migration: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

hashAdminPasswords();
