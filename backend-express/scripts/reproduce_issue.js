
import db from "../models/index.js";

async function reproduce() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected.");

    // Find a non-admin user
    const user = await db.UserDetail.findOne({
      where: {
         // Assuming we can find one. 
         // If no user exists, we can't test. 
         // We'll just take the first one found.
      }
    });

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
        console.log("Response JSON:", JSON.stringify(json, null, 2).substring(0, 1000) + "...");
    } catch (e) {
        console.log("Response Text:", text);
    }

  } catch (error) {
    console.error("Script error:", error);
  } finally {
    await db.sequelize.close();
  }
}

reproduce();
