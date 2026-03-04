import { PoruthamCalculator } from '../utils/astrologyUtils.js';

const testCases = [
    {
        name: "Hyphenated Tamil-English",
        bride: { star: 'அஸ்வினி-Ashwini', rasi: 'மேஷம்-Mesham' },
        groom: { star: 'பரணி-Bharani', rasi: 'மேஷம்-Mesham' }
    },
    {
        name: "Mixed Casing",
        bride: { star: 'ashwini', rasi: 'mesham' },
        groom: { star: 'BHARANI', rasi: 'MESHAM' }
    },
    {
        name: "Spaces and Hyphen",
        bride: { star: '  மகம் - Magam  ', rasi: '  சிம்மம் - Simmam  ' },
        groom: { star: 'Pooram', rasi: 'Simmam' }
    },
    {
        name: "Plain English",
        bride: { star: 'Ashwini', rasi: 'Mesham' },
        groom: { star: 'Bharani', rasi: 'Mesham' }
    }
];

testCases.forEach(tc => {
    console.log(`\nTesting: ${tc.name}`);
    const calc = new PoruthamCalculator(tc.bride, tc.groom);
    console.log(`Bride: ${calc.brideStar} (${calc.brideRasi})`);
    console.log(`Groom: ${calc.groomStar} (${calc.groomRasi})`);
    
    const summary = calc.getSummary();
    const hasUnknown = Object.values(summary.results).includes('Unknown');
    
    if (hasUnknown) {
        console.error('FAILED: Contains Unknown results');
        console.log(summary.results);
    } else {
        console.log('PASSED: All poruthams calculated');
        console.log(`Score: ${summary.score}/${summary.total} - ${summary.verdict}`);
    }
});
