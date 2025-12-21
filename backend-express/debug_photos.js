import db from './models/index.js';

async function debugPhotos() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');
    
    const users = await db.UserDetail.findAll({
      attributes: ['user_id', 'email', 'photo'],
      order: [['created_at', 'DESC']]
    });
    
    console.log('User Photo Data:');
    users.forEach(user => {
      console.log(`User ${user.user_id} (${user.email}):`, user.photo);
      console.log(`Type: ${typeof user.photo}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.sequelize.close();
  }
}

debugPhotos();
