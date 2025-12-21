import db from "./models/index.js";
import { Op } from "sequelize";

async function checkPhotoData() {
  try {
    // Get a user with photos
    const users = await db.UserDetail.findAll({
      limit: 5,
      attributes: ['email', 'name', 'photo']
    });

    console.log('\n=== Photo Data Check ===\n');
    
    if (users.length === 0) {
      console.log('No users with photos found.');
      return;
    }

    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Photo field type: ${typeof user.photo}`);
      console.log(`Photo field value: ${user.photo}`);
      
      // Try to parse if it's a JSON string
      if (typeof user.photo === 'string') {
        try {
          const parsed = JSON.parse(user.photo);
          console.log(`Parsed as JSON:`, parsed);
          console.log(`Is array: ${Array.isArray(parsed)}`);
          if (Array.isArray(parsed)) {
            console.log(`Number of photos: ${parsed.length}`);
          }
        } catch (e) {
          console.log('Not valid JSON - might be a single path string');
        }
      }
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPhotoData();
