import db from './models/index.js';

async function migratePhotoField() {
  console.log('Starting photo field migration...');
  
  try {
    // Fetch all users with non-null photo field
    const users = await db.UserDetail.findAll({
      where: {
        photo: {
          [db.sequelize.Sequelize.Op.ne]: null,
        },
      },
    });

    console.log(`Found ${users.length} users with existing photos`);

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      const currentPhoto = user.photo;
      
      // Check if already in JSON array format
      if (currentPhoto.startsWith('[')) {
        console.log(`User ${user.user_id}: Already in JSON array format, skipping`);
        skipped++;
        continue;
      }

      // Convert single path to JSON array
      const photoArray = JSON.stringify([currentPhoto]);
      
      await db.UserDetail.update(
        { photo: photoArray },
        { where: { user_id: user.user_id } }
      );

      console.log(`User ${user.user_id}: Migrated from "${currentPhoto}" to ${photoArray}`);
      migrated++;
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Migrated: ${migrated} users`);
    console.log(`Skipped: ${skipped} users`);
    console.log('=========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migratePhotoField();
