import db from './models/index.js';

async function testQuery() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected');
    
    const users = await db.UserDetail.findAll({
      order: [['created_at', 'DESC']]
    });
    
    console.log('Found users:', users.length);
    console.log('Users:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.sequelize.close();
  }
}

testQuery();
