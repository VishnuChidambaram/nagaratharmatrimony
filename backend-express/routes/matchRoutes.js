import express from "express";
import db from "../models/index.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";


const router = express.Router();

/**
 * Calculate match score between two users
 */
/**
 * Calculate match score between two users
 */
function calculateMatchScore(currentUser, targetUser) {
    let score = 0;
    const breakdown = {};

    // 1. Gender Filter (Absolute) - Must be opposite gender
    const maleGenders = ["Male", "ஆண்"];
    const femaleGenders = ["Female", "பெண்"];
    const isCurrentMale = maleGenders.includes(currentUser.gender);
    const isTargetMale = maleGenders.includes(targetUser.gender);
    if (isCurrentMale === isTargetMale) return { totalScore: 0, breakdown: { gender: 0 } };

    // 2. Marital Status Compatibility (Absolute)
    const maritalStatus = (currentUser.maritalStatus || "").toLowerCase();
    const targetMaritalStatus = (targetUser.maritalStatus || "").toLowerCase();
    
    const unmarriedTerms = ["unmarried", "திருமணமாகாதவர்"];
    
    const isCurrentUnmarried = unmarriedTerms.includes(maritalStatus);
    const isTargetUnmarried = unmarriedTerms.includes(targetMaritalStatus);
    
    if (isCurrentUnmarried !== isTargetUnmarried) return { totalScore: 0, breakdown: { gender: 0 } };

    // 3. Heritage Hard Filters (Absolute Community Rules)
    if (currentUser.yourTemple && targetUser.yourTemple && currentUser.yourTemple === targetUser.yourTemple) {
        if (!currentUser.yourDivision || !targetUser.yourDivision || currentUser.yourDivision === targetUser.yourDivision) {
            return { totalScore: 0, breakdown: { heritage: 0 } };
        }
    }

    // Base Compatibility for passing hard filters
    score = 20;
    breakdown["Base Match"] = 20;

    // 4. Age Match (Weight: 20)
    let fromAge = currentUser.fromAge;
    let toAge = currentUser.toAge;
    
    if (!fromAge || !toAge) {
        const currentAge = currentUser.dateOfBirth ? new Date().getFullYear() - new Date(currentUser.dateOfBirth).getFullYear() : 30;
        if (isCurrentMale) {
            fromAge = Math.max(22, currentAge - 5);
            toAge = currentAge + 2;
        } else {
            fromAge = currentAge - 2;
            toAge = currentAge + 5;
        }
    }

    if (fromAge && toAge && targetUser.dateOfBirth) {
        try {
            const dob = new Date(targetUser.dateOfBirth);
            if (!isNaN(dob.getTime())) {
                const targetAge = new Date().getFullYear() - dob.getFullYear();
                if (targetAge >= fromAge && targetAge <= toAge) {
                    score += 20;
                    breakdown["Age Match"] = 20;
                } else if (Math.abs(targetAge - fromAge) <= 2 || Math.abs(targetAge - toAge) <= 2) {
                    score += 10;
                    breakdown["Age Match"] = 10;
                } else {
                    breakdown["Age Match"] = 0;
                }
            }
        } catch (e) {
            logger.error(`Age calculation error: ${e.message}`);
        }
    }

    // 5. Education Match (Weight: 15)
    if (currentUser.educationQualification1 && targetUser.educationQualification) {
        const pref = currentUser.educationQualification1.toLowerCase();
        const target = targetUser.educationQualification.toLowerCase();
        if (pref === target) {
            score += 15;
            breakdown["Education"] = 15;
        } else if (target.includes(pref) || pref.includes(target)) {
            score += 8;
            breakdown["Education"] = 8;
        } else {
            breakdown["Education"] = 0;
        }
    }

    // 6. Height Match (Weight: 10)
    let fromHeight = parseFloat(currentUser.fromHeight);
    let toHeight = parseFloat(currentUser.toHeight);
    let targetHeight = parseFloat(targetUser.height);

    if (isNaN(fromHeight) || isNaN(toHeight)) {
        const currentH = parseFloat(currentUser.height);
        if (!isNaN(currentH)) {
            if (isCurrentMale) { fromHeight = currentH - 20; toHeight = currentH; }
            else { fromHeight = currentH; toHeight = currentH + 20; }
        }
    }

    if (!isNaN(fromHeight) && !isNaN(toHeight) && !isNaN(targetHeight)) {
        if (targetHeight >= fromHeight && targetHeight <= toHeight) {
            score += 10;
            breakdown["Height Match"] = 10;
        } else {
            breakdown["Height Match"] = 0;
        }
    }

    // 7. Occupation Match (Weight: 10)
    if (currentUser.occupationBusiness1 && (targetUser.occupationBusiness || targetUser.otherOccupation)) {
        const pref = currentUser.occupationBusiness1.toLowerCase();
        const occ = (targetUser.occupationBusiness || "").toLowerCase();
        const otherOcc = (targetUser.otherOccupation || "").toLowerCase();
        if (occ.includes(pref) || otherOcc.includes(pref) || pref.includes(occ)) {
            score += 10;
            breakdown["Occupation"] = 10;
        } else {
            breakdown["Occupation"] = 0;
        }
    }

    // 8. Complexion Match (Weight: 5)
    if (currentUser.complexion1 && targetUser.complexion) {
        if (currentUser.complexion1 === targetUser.complexion) {
            score += 5;
            breakdown["Complexion"] = 5;
        } else {
            breakdown["Complexion"] = 0;
        }
    }

    // 9. Location Match (Weight: 10)
    if (currentUser.workingPlace1) {
        const pref = currentUser.workingPlace1.toLowerCase();
        const fields = [targetUser.city, targetUser.state, targetUser.district, targetUser.nativePlace, targetUser.workingPlace];
        if (fields.some(f => (f || "").toLowerCase().includes(pref))) {
            score += 10;
            breakdown["Location"] = 10;
        } else {
            breakdown["Location"] = 0;
        }
    }

    // 10. Willingness to Work (Weight: 5)
    if (currentUser.willingnessToWork1 === "Yes" || currentUser.willingnessToWork1 === "ஆம்") {
        if (targetUser.occupationBusiness || targetUser.workDetails || targetUser.workingPlace) {
            score += 5;
            breakdown["Willingness to Work"] = 5;
        } else {
            breakdown["Willingness to Work"] = 0;
        }
    } else if (currentUser.willingnessToWork1 === "No" || currentUser.willingnessToWork1 === "இல்லை") {
        if (!targetUser.occupationBusiness && !targetUser.workingPlace) {
            score += 5;
            breakdown["Willingness to Work"] = 5;
        } else {
            breakdown["Willingness to Work"] = 0;
        }
    } else {
        score += 5;
        breakdown["Willingness to Work"] = 5;
    }

    // 11. Temple/Division Match (Weight: 5 Bonus)
    let heritageBonus = 0;
    if (currentUser.yourTemple && targetUser.yourTemple && currentUser.yourTemple === targetUser.yourTemple) {
        heritageBonus += 2;
    }
    if (currentUser.yourDivision && targetUser.yourDivision && currentUser.yourDivision === targetUser.yourDivision) {
        heritageBonus += 3;
    }
    score += heritageBonus;
    breakdown["Heritage"] = heritageBonus;

    return { totalScore: Math.min(score, 100), breakdown };
}

// GET /api/matches/suggested - Get suggested matches for logged-in user
router.get("/api/matches/suggested", async (req, res) => {
    try {
        const userEmail = req.user?.email;
        
        if (!userEmail) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const currentUser = await db.UserDetail.findOne({ where: { email: userEmail } });
        if (!currentUser) {
            logger.warn(`[Matches] User not found: ${userEmail}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        logger.info(`[Matches] Finding matches for ${userEmail}. Gender: ${currentUser.gender}`);
        
        // Determine opposite gender values
        let oppositeGenders = [];
        const maleGenders = ["Male", "ஆண்"];
        const femaleGenders = ["Female", "பெண்"];

        if (maleGenders.includes(currentUser.gender)) {
            oppositeGenders = femaleGenders;
        } else if (femaleGenders.includes(currentUser.gender)) {
            oppositeGenders = maleGenders;
        } else {
            oppositeGenders = ["Male", "Female", "ஆண்", "பெண்"].filter(g => g !== currentUser.gender);
        }

        logger.info(`[Matches] Searching for genders: ${oppositeGenders.join(", ")}`);

        // Fetch all non-deleted users of opposite gender
        const potentialMatches = await db.UserDetail.findAll({
            where: {
                gender: { [Op.in]: oppositeGenders },
                is_deleted: false,
                email: { [Op.ne]: userEmail }
            }
        });

        logger.info(`[Matches] Found ${potentialMatches.length} potential opposite-gender profiles.`);

        const scoredMatches = potentialMatches.map(user => {
            const { totalScore: finalScore, breakdown } = calculateMatchScore(currentUser, user); 
            
            // Add jitter directly to breakdown to keep things consistent
            const jitterSeed = (currentUser.user_id || 0) + (user.user_id || 0);
            const jitter = (jitterSeed % 15) / 10; // 0.0 to 1.4
            
            // Keep one decimal place for precision as requested
            const preciseScore = Math.min(parseFloat((finalScore + jitter).toFixed(1)), 100);
            
            // Add the jitter/rounding difference as "Bonus Points" so the sum matches preciseScore
            const sumOfBreakdown = Object.values(breakdown).reduce((a, b) => a + b, 0);
            const bonus = parseFloat((preciseScore - sumOfBreakdown).toFixed(1));
            if (bonus > 0) {
                breakdown["Bonus Points"] = bonus;
            }
            
            return {
                ...user.toJSON(),
                matchScore: preciseScore,
                matchBreakdown: breakdown
            };
        }).sort((a, b) => b.matchScore - a.matchScore);

        logger.info(`[Matches] Returning ${scoredMatches.length} scored matches.`);

        res.json({
            success: true,
            data: scoredMatches.slice(0, 20)
        });
    } catch (error) {
        logger.error(`Suggested matches error: ${error.message}`);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;
