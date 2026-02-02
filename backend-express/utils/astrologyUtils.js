/**
 * Traditional Tamil Porutham (10 Points) Matching Logic
 * 
 * Standardized for the Nagarathar Matrimony App naming conventions.
 */

// Normalized Nakshatras matching the registration dropdown (English part)
export const NAKSHATRAS = [
    "Ashwini", "Bharani", "Karthigai", "Rohini", "Mirugaseerisham", 
    "Thiruvathirai", "Punarpoosam", "Poosam", "Ayilyam", "Magam", 
    "Pooram", "Uthiram", "Hastham", "Chithirai", "Swathi", 
    "Visakam", "Anusham", "Kettai", "Moolam", "Pooradam", 
    "Uthiradam", "Thiruvonam", "Avittam", "Sadhayam", 
    "Poorattathi", "Uthirattathi", "Revathi"
];

// Normalized Rasis matching the registration dropdown (English part)
export const RASIS = [
    "Mesham", "Rishabam", "Mithunam", "Kadagam", "Simmam", 
    "Kanni", "Thulam", "Viruchigam", "Dhanusu", "Magaram", 
    "Kumbam", "Meenam"
];

// Planetary Lords for Rasyadhipathi
const RASI_LORDS = {
    "Mesham": "Mars", "Rishabam": "Venus", "Mithunam": "Mercury", "Kadagam": "Moon",
    "Simmam": "Sun", "Kanni": "Mercury", "Thulam": "Venus", "Viruchigam": "Mars",
    "Dhanusu": "Jupiter", "Magaram": "Saturn", "Kumbam": "Saturn", "Meenam": "Jupiter"
};

const PLANET_FRIENDSHIP = {
    "Sun": ["Moon", "Mars", "Jupiter"],
    "Moon": ["Sun", "Mercury"],
    "Mars": ["Sun", "Moon", "Jupiter"],
    "Mercury": ["Sun", "Venus"],
    "Jupiter": ["Sun", "Moon", "Mars"],
    "Venus": ["Mercury", "Saturn"],
    "Saturn": ["Mercury", "Venus"]
};

// Vasya Grouping
const VASYA_MAP = {
    "Mesham": ["Simmam", "Viruchigam"],
    "Rishabam": ["Kadagam", "Thulam"],
    "Mithunam": ["Kanni"],
    "Kadagam": ["Viruchigam", "Dhanusu"],
    "Simmam": ["Magaram"],
    "Kanni": ["Rishabam", "Meenam"],
    "Thulam": ["Magaram"],
    "Viruchigam": ["Kadagam"],
    "Dhanusu": ["Meenam"],
    "Magaram": ["Kumbam", "Mesham"],
    "Kumbam": ["Meenam"],
    "Meenam": ["Magaram"]
};

// Vedha Pairs (Mutual Incompatibility)
const VEDHA_PAIRS = [
    ["Ashwini", "Kettai"], ["Bharani", "Anusham"], ["Karthigai", "Visakam"],
    ["Rohini", "Swathi"], ["Thiruvathirai", "Thiruvonam"], ["Punarpoosam", "Uthiradam"],
    ["Poosam", "Pooradam"], ["Ayilyam", "Moolam"], ["Magam", "Revathi"],
    ["Pooram", "Uthirattathi"], ["Uthiram", "Poorattathi"],
    ["Hastham", "Sadhayam"]
];

// Gana grouping
const GANAS = {
    DEVA: ["Ashwini", "Mirugaseerisham", "Punarpoosam", "Poosam", "Hastham", "Swathi", "Anusham", "Thiruvonam", "Revathi"],
    MANUSHYA: ["Bharani", "Rohini", "Thiruvathirai", "Pooram", "Uthiram", "Pooradam", "Uthiradam", "Poorattathi", "Uthirattathi"],
    RAKSHASA: ["Karthigai", "Ayilyam", "Magam", "Chithirai", "Visakam", "Kettai", "Moolam", "Avittam", "Sadhayam"]
};

// Yoni grouping (Animal)
const YONIS = {
    "Ashwini": "Horse(M)", "Bharani": "Elephant(M)", "Karthigai": "Goat(F)", "Rohini": "Serpent(M)",
    "Mirugaseerisham": "Serpent(F)", "Thiruvathirai": "Dog(M)", "Punarpoosam": "Cat(F)", "Poosam": "Goat(M)",
    "Ayilyam": "Cat(M)", "Magam": "Rat(M)", "Pooram": "Rat(F)", "Uthiram": "Cow(M)",
    "Hastham": "Buffalo(F)", "Chithirai": "Tiger(M)", "Swathi": "Buffalo(M)", "Visakam": "Tiger(F)",
    "Anusham": "Deer(F)", "Kettai": "Deer(M)", "Moolam": "Dog(F)", "Pooradam": "Monkey(M)",
    "Uthiradam": "Mongoose(M)", "Thiruvonam": "Monkey(F)", "Avittam": "Lion(F)", 
    "Sadhayam": "Horse(F)", "Poorattathi": "Lion(M)", "Uthirattathi": "Cow(F)", "Revathi": "Elephant(F)"
};

// Rajju grouping
const RAJJUS = {
    PADAM: ["Ashwini", "Ayilyam", "Magam", "Kettai", "Moolam", "Revathi"],
    KATI: ["Bharani", "Poosam", "Pooram", "Anusham", "Pooradam", "Uthirattathi"],
    NABHI: ["Karthigai", "Punarpoosam", "Uthiram", "Visakam", "Uthiradam", "Poorattathi"],
    KANDA: ["Rohini", "Thiruvathirai", "Hastham", "Swathi", "Thiruvonam", "Sadhayam"],
    SIRO: ["Mirugaseerisham", "Chithirai", "Avittam"]
};

/**
 * Main Porutham Calculator Class
 */
export class PoruthamCalculator {
    constructor(bride, groom) {
        // Normalization helper
        const normalize = (val) => {
            if (!val) return "";
            let v = val.includes("-") ? val.split("-")[1] : val;
            let result = v.trim();
            console.log(`[Trace] normalize(${val}) -> "${result}"`);
            return result;
        };

        this.brideStar = normalize(bride.star);
        this.groomStar = normalize(groom.star);
        this.brideRasi = normalize(bride.rasi);
        this.groomRasi = normalize(groom.rasi);

        this.brideStarIdx = NAKSHATRAS.indexOf(this.brideStar);
        this.groomStarIdx = NAKSHATRAS.indexOf(this.groomStar);
        this.brideRasiIdx = RASIS.indexOf(this.brideRasi);
        this.groomRasiIdx = RASIS.indexOf(this.groomRasi);
        
        this.brideAmsamMoon = bride.amsamMoon;
        this.groomAmsamMoon = groom.amsamMoon;
    }

    // 1. Dina Porutham
    calculateDina() {
        if (this.brideStarIdx === -1 || this.groomStarIdx === -1) return "Unknown";
        let count = ((this.groomStarIdx - this.brideStarIdx + 27) % 27) + 1;
        const favorable = [2, 4, 6, 8, 9, 11, 13, 15, 17, 18, 20, 22, 24, 26, 27];
        return favorable.includes(count) ? "Uthamam" : "Athamam";
    }

    // 2. Gana Porutham
    calculateGana() {
        if (this.brideStarIdx === -1 || this.groomStarIdx === -1) return "Unknown";
        const getGana = (star) => {
            if (GANAS.DEVA.includes(star)) return "DEVA";
            if (GANAS.MANUSHYA.includes(star)) return "MANUSHYA";
            if (GANAS.RAKSHASA.includes(star)) return "RAKSHASA";
            return null;
        };
        const brideGana = getGana(this.brideStar);
        const groomGana = getGana(this.groomStar);
        
        if (brideGana === groomGana) return "Uthamam";
        if (brideGana === "DEVA" && groomGana === "MANUSHYA") return "Madhyamam";
        if (brideGana === "MANUSHYA" && groomGana === "DEVA") return "Madhyamam";
        // Exception: If Rasi is same, Gana Dosham is cancelled
        if (this.brideRasiIdx !== -1 && this.brideRasi === this.groomRasi) return "Madhyamam";
        return "Athamam";
    }

    // 3. Mahendra Porutham
    calculateMahendra() {
        if (this.brideStarIdx === -1 || this.groomStarIdx === -1) return "Unknown";
        let count = ((this.groomStarIdx - this.brideStarIdx + 27) % 27) + 1;
        const favorable = [4, 7, 10, 13, 16, 19, 22, 25];
        return favorable.includes(count) ? "Uthamam" : "Athamam";
    }

    // 4. Stree Deergha
    calculateStreeDeergha() {
        if (this.brideStarIdx === -1 || this.groomStarIdx === -1) return "Unknown";
        let count = ((this.groomStarIdx - this.brideStarIdx + 27) % 27) + 1;
        if (count >= 13) return "Uthamam";
        if (count >= 7) return "Madhyamam";
        return "Athamam";
    }

    // 5. Yoni Porutham
    calculateYoni() {
        const brideYoni = YONIS[this.brideStar];
        const groomYoni = YONIS[this.groomStar];
        if (!brideYoni || !groomYoni) return "Unknown";
        
        const brideAnimal = brideYoni.split("(")[0];
        const groomAnimal = groomYoni.split("(")[0];
        
        if (brideAnimal === groomAnimal) return "Uthamam";
        
        const enemies = {
            "Horse": "Buffalo", "Elephant": "Lion", "Tiger": "Cow", "Serpent": "Mongoose",
            "Dog": "Deer", "Cat": "Rat", "Goat": "Monkey"
        };
        
        if (enemies[brideAnimal] === groomAnimal || enemies[groomAnimal] === brideAnimal) return "Athamam";
        return "Madhyamam";
    }

    // 6. Rasi Porutham
    calculateRasi() {
        if (this.brideRasiIdx === -1 || this.groomRasiIdx === -1) return "Unknown";
        let count = ((this.groomRasiIdx - this.brideRasiIdx + 12) % 12) + 1;
        if (count === 1 || count === 7 || count === 12) return "Uthamam";
        if (count === 6 || count === 8) return "Athamam"; // Sashtashtaga Dosham
        return "Madhyamam";
    }

    // 7. Rasyadhipathi Porutham
    calculateRasyadhipathi() {
        const brideLord = RASI_LORDS[this.brideRasi];
        const groomLord = RASI_LORDS[this.groomRasi];
        if (!brideLord || !groomLord) return "Unknown";
        if (brideLord === groomLord) return "Uthamam";
        
        const isFriend = (p1, p2) => (PLANET_FRIENDSHIP[p1] || []).includes(p2);
        if (isFriend(brideLord, groomLord) || isFriend(groomLord, brideLord)) return "Uthamam";
        return "Madhyamam";
    }

    // 8. Vasya Porutham
    calculateVasya() {
        if (this.brideRasiIdx === -1 || this.groomRasiIdx === -1) return "Unknown";
        const favored = VASYA_MAP[this.brideRasi] || [];
        return favored.includes(this.groomRasi) ? "Uthamam" : "Athamam";
    }

    // 9. Rajju Porutham (Critical)
    calculateRajju() {
        const getRajju = (star) => {
            for (const [key, value] of Object.entries(RAJJUS)) {
                if (value.includes(star)) return key;
            }
            return null;
        };
        const brideRajju = getRajju(this.brideStar);
        const groomRajju = getRajju(this.groomStar);
        
        if (!brideRajju || !groomRajju) return "Unknown";
        return (brideRajju === groomRajju) ? "Athamam" : "Uthamam";
    }

    // 10. Vedha Porutham
    calculateVedha() {
        if (this.brideStarIdx === -1 || this.groomStarIdx === -1) return "Unknown";
        for (const pair of VEDHA_PAIRS) {
            if ((pair[0] === this.brideStar && pair[1] === this.groomStar) ||
                (pair[1] === this.brideStar && pair[0] === this.groomStar)) {
                return "Athamam";
            }
        }
        return "Uthamam";
    }

    // Amsam Match (Bonus / Refinement)
    calculateAmsamMatch() {
        if (!this.brideAmsamMoon || !this.groomAmsamMoon) return "Unknown";
        let count = ((this.groomAmsamMoon - this.brideAmsamMoon + 12) % 12) + 1;
        if (count === 1 || count === 7 || count === 5 || count === 9) return "Uthamam";
        if (count === 6 || count === 8) return "Athamam";
        return "Madhyamam";
    }

    // Full 10 Porutham Summary
    getSummary() {
        const results = {
            Dina: this.calculateDina(),
            Gana: this.calculateGana(),
            Mahendra: this.calculateMahendra(),
            StreeDeergha: this.calculateStreeDeergha(),
            Yoni: this.calculateYoni(),
            Rasi: this.calculateRasi(),
            Rasyadhipathi: this.calculateRasyadhipathi(),
            Vasya: this.calculateVasya(),
            Rajju: this.calculateRajju(),
            Vedha: this.calculateVedha()
        };

        // Add Amsam as a supplementary check
        const amsam = this.calculateAmsamMatch();
        if (amsam !== "Unknown") {
            results.Amsam = amsam;
        }
        
        let score = 0;
        const keysToScore = Object.keys(results);
        keysToScore.forEach(v => {
            if (results[v] === "Uthamam") score += 1;
            else if (results[v] === "Madhyamam") score += 0.5;
        });
        
        const isRajjuBad = results.Rajju === "Athamam";
        const isVedhaBad = results.Vedha === "Athamam";
        
        let verdict = "Not Recommended";
        if (!isRajjuBad && !isVedhaBad && score >= 7) {
            verdict = "Uthamam (Excellent Match)";
        } else if (!isRajjuBad && !isVedhaBad && score >= 5) {
            verdict = "Recommended";
        } else if (!isRajjuBad && score >= 4) {
            verdict = "Average Match";
        } else if (isRajjuBad) {
            verdict = "Not Recommended (Rajju Dosham)";
        } else if (isVedhaBad) {
            verdict = "Not Recommended (Vedha Dosham)";
        }
        
        return {
            results,
            score,
            total: keysToScore.length,
            verdict
        };
    }
}
