
import db from "../models/index.js";
import http from "http";

async function reproduce() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected.");

    const user = await db.UserDetail.findOne();
    if (!user) { console.log("No user"); return; }

    if (!user.sessionId) {
        user.sessionId = "test-session-" + Date.now();
        await user.save();
    }

    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/all-details',
      method: 'GET',
      headers: {
        'x-user-email': user.email,
        'x-session-id': user.sessionId,
        'Content-Type': 'application/json'
      }
    };

    console.log(`Requesting ${options.path}...`);
    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('BODY:', data.substring(0, 500));
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    req.end();

  } catch (error) {
    console.error("Script error:", error);
  } finally {
    // await db.sequelize.close(); // Keep open for a bit? No, close it.
    // Actually, http request is async. We need to wait.
    // For this simple script, we just let it run. db close might hang if we don't wait?
    // UserDetail.findOne is awaited.
    await db.sequelize.close();
  }
}

reproduce();
