import db from '../models/index.js';
import { PoruthamCalculator } from '../utils/astrologyUtils.js';

// Mocking some dependencies or using real ones if possible
// We will test the calculateMatchScore logic by extracting it or simulating it

async function testMatchLogic() {
    console.log('--- Testing Match Logic ---\n');

    try {
        await db.sequelize.authenticate();
        const users = await db.UserDetail.findAll({ limit: 10 });
        
        if (users.length < 2) {
            console.log('Not enough users to test.');
            return;
        }

        const male = users.find(u => u.gender === 'Male' || u.gender === 'ஆண்');
        const female = users.find(u => u.gender === 'Female' || u.gender === 'பெண்');

        if (!male || !female) {
            console.log('No male or female found for testing.');
            return;
        }

        console.log(`Testing with Male: ${male.email} and Female: ${female.email}`);

        // We can't easily import calculateMatchScore as it's not exported from matchRoutes.js
        // We will simulate a call to the endpoint or duplicate logic for unit test
        // Better: Let's create a temporary route or a separate utility for matching logic if we were to refactor
        
        // For now, let's verify if the results from the API change
        // We'll use the existing backend server if it's running
        
        console.log('\nVerification Strategy: Log in as different users and check /api/matches/suggested');
        console.log('Since I cannot "login" in a script easily without a session, I will check the data consistency directly.');

        // Verify marital status compatibility
        const isCompatible = (u1, u2) => {
            const maritalStatus = (u1.maritalStatus || "").toLowerCase();
            const targetMaritalStatus = (u2.maritalStatus || "").toLowerCase();
            const unmarriedTerms = ["unmarried", "திருமணமாகாதவர்"];
            const isU1Unmarried = unmarriedTerms.includes(maritalStatus);
            const isU2Unmarried = unmarriedTerms.includes(targetMaritalStatus);
            return isU1Unmarried === isU2Unmarried;
        };

        console.log(`\nMarital Status Check:`);
        console.log(`User 1 (${male.maritalStatus}) & User 2 (${female.maritalStatus}): ${isCompatible(male, female) ? 'COMPATIBLE' : 'NOT COMPATIBLE'}`);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testMatchLogic();
