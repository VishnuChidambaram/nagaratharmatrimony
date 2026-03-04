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

    // 1. Gender Filter (Absolute) - Must be opposite gender
    const maleGenders = ["Male", "ஆண்"];
    const femaleGenders = ["Female", "பெண்"];
    const isCurrentMale = maleGenders.includes(currentUser.gender);
    const isTargetMale = maleGenders.includes(targetUser.gender);
    if (isCurrentMale === isTargetMale) return 0;

    // 2. Marital Status Compatibility (Absolute)
    // Rule: Unmarried matches with Unmarried. Widow/Widower/Divorced matches with Widow/Widower/Divorced.
    const maritalStatus = (currentUser.maritalStatus || "").toLowerCase();
    const targetMaritalStatus = (targetUser.maritalStatus || "").toLowerCase();
    
    const unmarriedTerms = ["unmarried", "திருமணமாகாதவர்"];
    const remarriageTerms = ["widow", "divorced", "widower", "விதவை", "விவாகரத்து", "கைம்பெண்"];
    
    const isCurrentUnmarried = unmarriedTerms.includes(maritalStatus);
    const isTargetUnmarried = unmarriedTerms.includes(targetMaritalStatus);
    
    // If one is unmarried and the other is not, it's generally not a match unless explicitly allowed (for now we filter)
    if (isCurrentUnmarried !== isTargetUnmarried) return 0;

    // 3. Heritage Hard Filters (Absolute Community Rules)
    if (currentUser.yourTemple && targetUser.yourTemple && currentUser.yourTemple === targetUser.yourTemple) {
        // If same temple, MUST have different divisions
        if (!currentUser.yourDivision || !targetUser.yourDivision) {
            return 0; // Rule: Same Temple + Missing Division = NOT ALLOWED
        }
        if (currentUser.yourDivision === targetUser.yourDivision) {
            return 0; // Rule: Same Temple + Same Division = NOT ALLOWED
        }
    }

    // 4. Age Match (Weight: 20)
    let fromAge = currentUser.fromAge;
    let toAge = currentUser.toAge;
    
    // Fallback age preference if not set
    if (!fromAge || !toAge) {
        if (targetUser.dateOfBirth) {
            const dob = new Date(currentUser.dateOfBirth);
            const currentAge = new Date().getFullYear() - dob.getFullYear();
            if (isCurrentMale) {
                fromAge = Math.max(22, currentAge - 5);
                toAge = currentAge + 2;
            } else {
                fromAge = currentAge - 2;
                toAge = currentAge + 5;
            }
        }
    }

    if (fromAge && toAge && targetUser.dateOfBirth) {
        try {
            const dob = new Date(targetUser.dateOfBirth);
            if (!isNaN(dob.getTime())) {
                const targetAge = new Date().getFullYear() - dob.getFullYear();
                if (targetAge >= fromAge && targetAge <= toAge) {
                    score += 20;
                } else if (Math.abs(targetAge - fromAge) <= 2 || Math.abs(targetAge - toAge) <= 2) {
                    score += 10; // Close match
                }
            }
        } catch (e) {
            logger.error(`Age calculation error for user ${targetUser.email}: ${e.message}`);
        }
    }

    // 5. Education Match (Weight: 15)
    if (currentUser.educationQualification1 && targetUser.educationQualification) {
        const pref = currentUser.educationQualification1.toLowerCase();
        const target = targetUser.educationQualification.toLowerCase();
        if (pref === target) {
            score += 15;
        } else if (target.includes(pref) || pref.includes(target)) {
            score += 8; // Partial match
        }
    }

    // 6. Height Match (Weight: 10)
    let fromHeight = parseFloat(currentUser.fromHeight);
    let toHeight = parseFloat(currentUser.toHeight);
    let targetHeight = parseFloat(targetUser.height);

    // Fallback height if missing
    if (isNaN(fromHeight) || isNaN(toHeight)) {
        const currentH = parseFloat(currentUser.height);
        if (!isNaN(currentH)) {
            if (isCurrentMale) {
                fromHeight = currentH - 20;
                toHeight = currentH;
            } else {
                fromHeight = currentH;
                toHeight = currentH + 20;
            }
        }
    }

    if (!isNaN(fromHeight) && !isNaN(toHeight) && !isNaN(targetHeight)) {
        if (targetHeight >= fromHeight && targetHeight <= toHeight) {
            score += 10;
        }
    }

    // 7. Occupation Match (Weight: 10)
    if (currentUser.occupationBusiness1 && (targetUser.occupationBusiness || targetUser.otherOccupation)) {
        const pref = currentUser.occupationBusiness1.toLowerCase();
        const occ = (targetUser.occupationBusiness || "").toLowerCase();
        const otherOcc = (targetUser.otherOccupation || "").toLowerCase();
        if (occ.includes(pref) || otherOcc.includes(pref) || pref.includes(occ)) {
            score += 10;
        }
    }

    // 8. Complexion Match (Weight: 5)
    if (currentUser.complexion1 && targetUser.complexion) {
        if (currentUser.complexion1 === targetUser.complexion) {
            score += 5;
        }
    }

    // 9. Location Match (Weight: 10)
    if (currentUser.workingPlace1) {
        const pref = currentUser.workingPlace1.toLowerCase();
        const city = (targetUser.city || "").toLowerCase();
        const state = (targetUser.state || "").toLowerCase();
        const district = (targetUser.district || "").toLowerCase();
        const native = (targetUser.nativePlace || "").toLowerCase();
        const work = (targetUser.workingPlace || "").toLowerCase();

        if (city.includes(pref) || district.includes(pref) || work.includes(pref) || native.includes(pref) || state.includes(pref)) {
            score += 10;
        }
    }

    // 10. Willingness to Work (Weight: 5)
    if (currentUser.willingnessToWork1 === "Yes" || currentUser.willingnessToWork1 === "ஆம்") {
        if (targetUser.occupationBusiness || targetUser.workDetails || targetUser.workingPlace) {
            score += 5;
        }
    } else if (currentUser.willingnessToWork1 === "No" || currentUser.willingnessToWork1 === "இல்லை") {
        if (!targetUser.occupationBusiness && !targetUser.workingPlace) {
            score += 5;
        }
    } else {
        score += 5; // 'Any' or not specified
    }

    // 11. Temple/Division Match (Weight: 5 Bonus)
    if (currentUser.yourTemple && targetUser.yourTemple && currentUser.yourTemple === targetUser.yourTemple) {
        score += 2;
    }
    if (currentUser.yourDivision && targetUser.yourDivision && currentUser.yourDivision === targetUser.yourDivision) {
        score += 3;
    }

    return Math.min(score, 100);
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
            const finalScore = calculateMatchScore(currentUser, user); // Base score from preferences (0-100)
            
            // Add a deterministic but unique jitter for variety (0.0 to 1.5 points)
            // This ensures that even if stars and preferences are identical, the scores differ slightly
            const jitterSeed = (currentUser.user_id || 0) + (user.user_id || 0);
            const jitter = (jitterSeed % 15) / 10; 
            const finalScoreWithJitter = finalScore + jitter;

            const roundedScore = Math.min(Math.round(finalScoreWithJitter), 100);
            
            return {
                ...user.toJSON(),
                matchScore: roundedScore
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
