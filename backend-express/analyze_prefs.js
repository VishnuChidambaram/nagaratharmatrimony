import db from './models/index.js';

async function analyze() {
    try {
        await db.sequelize.authenticate();
        const users = await db.UserDetail.findAll();
        
        console.log('Total users:', users.length);
        
        const genders = users.reduce((acc, u) => {
            acc[u.gender] = (acc[u.gender] || 0) + 1;
            return acc;
        }, {});
        console.log('Genders:', genders);
        
        const prefFields = [
            'educationQualification1',
            'occupationBusiness1',
            'complexion1',
            'workingPlace1',
            'willingnessToWork1',
            'fromAge',
            'toAge',
            'fromHeight',
            'toHeight'
        ];
        
        console.log('\nPreference Field Stats (How many users have filled these):');
        for (const field of prefFields) {
            const filled = users.filter(u => u[field] !== null && u[field] !== '').length;
            console.log(`${field}: ${filled} / ${users.length} (${((filled/users.length)*100).toFixed(1)}%)`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

analyze();
