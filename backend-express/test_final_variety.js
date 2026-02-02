import db from './models/index.js';
import { PoruthamCalculator } from './utils/astrologyUtils.js';

// Mocked version of the route logic
function calculateMatchScore(currentUser, targetUser) {
    let score = 0;
    const maleGenders = ["Male", "ஆண்"];
    const isCurrentMale = maleGenders.includes(currentUser.gender);
    const isTargetMale = maleGenders.includes(targetUser.gender);
    if (isCurrentMale === isTargetMale) return 0;

    // Simulate some scoring logic to see variety
    if (targetUser.educationQualification === currentUser.educationQualification1) score += 15;
    
    // Fallback age
    let currentAge = 25;
    let fromAge = currentUser.fromAge || (isCurrentMale ? 22 : 23);
    let toAge = currentUser.toAge || (isCurrentMale ? 27 : 30);
    // ... Simplified ...
    score += 20; 

    return Math.min(score, 100);
}

async function testFinalVariety() {
    try {
        await db.sequelize.authenticate();
        const users = await db.UserDetail.findAll();
        const currentUser = users.find(u => u.email === 'rama@gmail.com');
        
        if (!currentUser) {
            console.log("currentUser rama@gmail.com not found.");
            process.exit(1);
        }

        const matches = users.filter(u => u.gender !== currentUser.gender);
        console.log(`Matching ${matches.length} profiles for ${currentUser.email}`);

        const results = matches.map(user => {
            let prefScore = calculateMatchScore(currentUser, user);
            
            let poruthamPoints = 0;
            if (currentUser.birthStar && currentUser.zodiacSign && user.birthStar && user.zodiacSign) {
                const bride = currentUser.gender === "Female" ? currentUser : user;
                const groom = currentUser.gender === "Male" ? currentUser : user;
                const calc = new PoruthamCalculator(
                    { star: bride.birthStar, rasi: bride.zodiacSign, amsamMoon: bride.amsam_chandiran },
                    { star: groom.birthStar, rasi: groom.zodiacSign, amsamMoon: groom.amsam_chandiran }
                );
                const summary = calc.getSummary();
                poruthamPoints = (summary.score / summary.total) * 20;
            }

            let finalScore = (prefScore * 0.8) + poruthamPoints;
            const jitterSeed = (currentUser.user_id || 0) + (user.user_id || 0);
            const jitter = (jitterSeed % 15) / 10; 
            finalScore += jitter;

            return { email: user.email, score: Math.round(finalScore) };
        });

        const scoreCounts = results.reduce((acc, r) => {
            acc[r.score] = (acc[r.score] || 0) + 1;
            return acc;
        }, {});

        console.log('Final Score Distribution:', scoreCounts);
        console.log('\nTop 10 matches:');
        results.sort((a,b) => b.score - a.score).slice(0, 10).forEach(r => console.log(`${r.email}: ${r.score}%`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testFinalVariety();
