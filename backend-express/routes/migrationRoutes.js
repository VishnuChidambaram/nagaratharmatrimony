import express from "express";
import db from "../models/index.js";

const router = express.Router();

// TEMPORARY MIGRATION ENDPOINT - DELETE AFTER USE
router.post("/api/migrate-admin-session", async (req, res) => {
  const { secret } = req.body;
  
  // Simple security check
  if (secret !== "MATRIMONY_SECRET_2025") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    console.log("Starting admin_login migration...");
    
    // Check if column exists
    const [results] = await db.sequelize.query(
      "SHOW COLUMNS FROM `admin_login` LIKE 'sessionId';"
    );

    if (results.length === 0) {
      console.log("Adding sessionId column to admin_login...");
      await db.sequelize.query(
        "ALTER TABLE `admin_login` ADD COLUMN `sessionId` VARCHAR(255) NULL;"
      );
      console.log("Column added to admin_login successfully.");
      
      return res.json({
        success: true,
        message: "Migration completed: sessionId column added to admin_login"
      });
    } else {
      console.log("Column 'sessionId' already exists in admin_login.");
      return res.json({
        success: true,
        message: "Migration skipped: sessionId column already exists"
      });
    }
  } catch (error) {
    console.error("Migration failed:", error);
    return res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error.message
    });
  }
});

export default router;
