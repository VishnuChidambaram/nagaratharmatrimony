import db from './models/index.js';

async function audit() {
    try {
        await db.sequelize.authenticate();
        const users = await db.UserDetail.findAll();
        users.forEach(u => {
            console.log(`User: ${u.email}`);
            console.log(`  Gender: ${u.gender}`);
            console.log(`  Star: "${u.birthStar}"`);
            console.log(`  Rasi: "${u.zodiacSign}"`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
