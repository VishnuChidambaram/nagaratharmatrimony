
import 'dotenv/config';
import db from "./models/index.js";
import { cloudinary } from "./config/cloudinaryConfig.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migratePhotosToCloudinary() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected.");

    const imagesToUpload = [
      path.join(__dirname, "uploads", "scenery_1.jpg"),
      path.join(__dirname, "uploads", "scenery_2.jpg")
    ];

    const cloudinaryUrls = [];

    console.log("Uploading images to Cloudinary...");
    for (const imagePath of imagesToUpload) {
      const result = await cloudinary.uploader.upload(imagePath, {
        folder: "nagaratharmatrimony_uploads"
      });
      console.log(`Uploaded: ${imagePath} -> ${result.secure_url}`);
      cloudinaryUrls.push(result.secure_url);
    }

    const photoJson = JSON.stringify(cloudinaryUrls);
    
    console.log(`Updating database for user IDs 1-8...`);
    const [affectedCount] = await db.UserDetail.update(
      { photo: photoJson },
      {
        where: {
          user_id: [1, 2, 3, 4, 5, 6, 7, 8]
        }
      }
    );

    console.log(`Successfully updated ${affectedCount} users with Cloudinary URLs.`);

    // Log the updated values for 1 and 2 to verify
    const users = await db.UserDetail.findAll({
      where: {
        user_id: [1, 2]
      }
    });

    console.log("\n--- Verification for User 1 & 2 ---");
    users.forEach(u => {
      console.log(`ID: ${u.user_id} | Photo: ${u.photo}`);
    });

  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await db.sequelize.close();
  }
}

migratePhotosToCloudinary();
