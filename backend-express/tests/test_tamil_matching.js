import { PoruthamCalculator } from '../utils/astrologyUtils.js';

const testCases = [
    {
        name: "Only Tamil (Should now SUCCEED)",
        bride: { star: 'அஸ்வினி', rasi: 'மேஷம்' },
        groom: { star: 'பரணி', rasi: 'மேஷம்' }
    },
    {
        name: "Combined with different Tamil spelling (Pooradam)",
        bride: { star: 'புறாடம்', rasi: 'தனுசு' },
        groom: { star: 'Moolam', rasi: 'Dhanusu' }
    },
    {
        name: "Combined with traditional Tamil spelling (Pooradam)",
        bride: { star: 'பூராடம்', rasi: 'தனுசு' },
        groom: { star: 'Moolam', rasi: 'Dhanusu' }
    }
];

testCases.forEach(tc => {
    console.log(`\nTesting: ${tc.name}`);
    const calc = new PoruthamCalculator(tc.bride, tc.groom);
    console.log(`Bride: ${calc.brideStar} (Idx: ${calc.brideStarIdx})`);
    console.log(`Groom: ${calc.groomStar} (Idx: ${calc.groomStarIdx})`);
    
    const summary = calc.getSummary();
    const hasUnknown = Object.values(summary.results).includes('Unknown');
    
    if (hasUnknown) {
        console.error('FAILED: Contains Unknown results');
        console.log(summary.results);
    } else {
        console.log('PASSED: All poruthams calculated');
    }
});
