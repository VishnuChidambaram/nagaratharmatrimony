import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the backend-express directory
dotenv.config({ path: path.join(__dirname, "../.env") });

import db from "../models/index.js";

async function reproduce() {
  try {
    console.log("DB Config Check:", {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME,
        port: process.env.DB_PORT,
        passLength: process.env.DB_PASS ? process.env.DB_PASS.length : 0
    });

    await db.sequelize.authenticate();
    console.log("Database connected successfully.");

    // Find a non-admin user
    const user = await db.UserDetail.findOne();

    if (!user) {
      console.log("No users found in DB to test with.");
      return;
    }

    console.log(`Testing with user: ${user.email} (Gender: ${user.gender})`);

    // Ensure user has a session ID
    if (!user.sessionId) {
        console.log("User has no session ID, generating one...");
        user.sessionId = "test-session-" + Date.now();
        await user.save();
    }

    const headers = {
        'x-user-email': user.email,
        'x-session-id': user.sessionId,
        'Content-Type': 'application/json'
    };

    console.log("Sending request to http://127.0.0.1:5000/all-details...");
    const response = await fetch('http://127.0.0.1:5000/all-details', {
        method: 'GET',
        headers: headers
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    const text = await response.text();
    try {
        const json = JSON.parse(text);
        console.log("Response JSON (first 1000 chars):", JSON.stringify(json, null, 2).substring(0, 1000) + "...");
        if (json.success) {
            console.log("\n✅ SUCCESS: /all-details fetched successfully!");
        } else {
            console.log("\n❌ FAILED: API returned success: false", json.message);
        }
    } catch (e) {
        console.log("Response is not JSON. Response Text:", text);
    }

  } catch (error) {
    console.error("Script error:", error);
  } finally {
    await db.sequelize.close();
  }
}

reproduce();
