import db from './models/index.js';
import { PoruthamCalculator } from './utils/astrologyUtils.js';

async function testVariety() {
    try {
        await db.sequelize.authenticate();
        const users = await db.UserDetail.findAll();
        console.log(`Analyzing ${users.length} users...`);
        
        const males = users.filter(u => u.gender === 'Male' || u.gender === 'ஆண்');
        const females = users.filter(u => u.gender === 'Female' || u.gender === 'பெண்');
        
        console.log(`Found ${males.length} males and ${females.length} females.`);
        
        if (males.length === 0 || females.length === 0) {
            console.log("Not enough data to test variety.");
            return;
        }

        const sampleScores = [];
        
        // Pick one male and calculate scores with all females
        const testMale = males[0];
        console.log(`\nTesting Male: ${testMale.email} (${testMale.birthStar}, ${testMale.zodiacSign})`);
        
        for (const female of females) {
            if (testMale.birthStar && testMale.zodiacSign && female.birthStar && female.zodiacSign) {
                const calc = new PoruthamCalculator(
                    { star: female.birthStar, rasi: female.zodiacSign, amsamMoon: female.amsam_chandiran },
                    { star: testMale.birthStar, rasi: testMale.zodiacSign, amsamMoon: testMale.amsam_chandiran }
                );
                const summary = calc.getSummary();
                sampleScores.push({ email: female.email, score: summary.score, verdict: summary.verdict });
            }
        }
        
        console.log(`Calculated ${sampleScores.length} scores for the test male.`);
        const scoreCounts = sampleScores.reduce((acc, s) => {
            acc[s.score] = (acc[s.score] || 0) + 1;
            return acc;
        }, {});
        
        console.log('Score distribution:', scoreCounts);
        
        if (sampleScores.length > 0) {
            console.log('\nFirst 10 matches:');
            sampleScores.slice(0, 10).forEach(s => console.log(`${s.email}: ${s.score} (${s.verdict})`));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testVariety();
