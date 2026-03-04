import { PoruthamCalculator, NAKSHATRAS, RASIS } from '../utils/astrologyUtils.js';

const testCases = [
    {
        name: "Reverse Hyphenation",
        bride: { star: 'Ashwini-அஸ்வினி', rasi: 'Mesham-மேஷம்' },
        groom: { star: 'Bharani-பரணி', rasi: 'Mesham-மேஷம்' }
    },
    {
        name: "En-Dash and Spaces",
        bride: { star: 'Ashwini – அஸ்வினி', rasi: 'Mesham – மேஷம்' },
        groom: { star: 'Bharani', rasi: 'Mesham' }
    },
    {
        name: "Invisible Characters",
        bride: { star: 'Ashwini\u200B', rasi: 'Mesham\uFEFF' },
        groom: { star: 'Bharani', rasi: 'Mesham' }
    },
    {
        name: "Only Tamil (Should still fail but match allowed English if possible)",
        // Note: Unless we have a Tamil map, this will still fail but let's see if it doesn't crash
        bride: { star: 'அஸ்வினி', rasi: 'மேஷம்' },
        groom: { star: 'Bharani', rasi: 'Mesham' }
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
        console.log(`Warning: Contains Unknown results (Expected if only Tamil is used)`);
    } else {
        console.log('PASSED: All poruthams calculated');
    }
});
