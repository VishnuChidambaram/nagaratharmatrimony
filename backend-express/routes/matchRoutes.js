import express from "express";
import db from "../models/index.js";
import { Op } from "sequelize";
import logger from "../utils/logger.js";

const router = express.Router();

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

    // 2. Heritage Hard Filters (Absolute Community Rules)
    if (currentUser.yourTemple && targetUser.yourTemple && currentUser.yourTemple === targetUser.yourTemple) {
        // If same temple, MUST have different divisions
        if (!currentUser.yourDivision || !targetUser.yourDivision) {
            return 0; // Rule: Same Temple + Missing Division = NOT ALLOWED
        }
        if (currentUser.yourDivision === targetUser.yourDivision) {
            return 0; // Rule: Same Temple + Same Division = NOT ALLOWED
        }
        // If same temple but different divisions, it's allowed (continues below)
    }

    // 3. Age Match (Weight: 20)
    if (currentUser.fromAge && currentUser.toAge && targetUser.dateOfBirth) {
        try {
            const dob = new Date(targetUser.dateOfBirth);
            if (!isNaN(dob.getTime())) {
                const targetAge = new Date().getFullYear() - dob.getFullYear();
                if (targetAge >= currentUser.fromAge && targetAge <= currentUser.toAge) {
                    score += 20;
                } else if (Math.abs(targetAge - currentUser.fromAge) <= 2 || Math.abs(targetAge - currentUser.toAge) <= 2) {
                    score += 10; // Close match
                }
            }
        } catch (e) {
            logger.error(`Age calculation error for user ${targetUser.email}: ${e.message}`);
        }
    }

    // 3. Education Match (Weight: 15)
    if (currentUser.educationQualification1 && targetUser.educationQualification) {
        const pref = currentUser.educationQualification1.toLowerCase();
        const target = targetUser.educationQualification.toLowerCase();
        if (pref === target) {
            score += 15;
        } else if (target.includes(pref) || pref.includes(target)) {
            score += 8; // Partial match
        }
    }

    // 4. Height Match (Weight: 15)
    if (currentUser.fromHeight && currentUser.toHeight && targetUser.height) {
        if (targetUser.height >= currentUser.fromHeight && targetUser.height <= currentUser.toHeight) {
            score += 15;
        }
    }

    // 5. Occupation Match (Weight: 10)
    if (currentUser.occupationBusiness1 && (targetUser.occupationBusiness || targetUser.otherOccupation)) {
        const pref = currentUser.occupationBusiness1.toLowerCase();
        const occ = (targetUser.occupationBusiness || "").toLowerCase();
        const otherOcc = (targetUser.otherOccupation || "").toLowerCase();
        if (occ.includes(pref) || otherOcc.includes(pref) || pref.includes(occ)) {
            score += 10;
        }
    }

    // 6. Complexion Match (Weight: 10)
    if (currentUser.complexion1 && targetUser.complexion) {
        if (currentUser.complexion1 === targetUser.complexion) {
            score += 10;
        }
    }

    // 7. Location Match (Weight: 10)
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

    // 8. Willingness to Work (Weight: 10)
    // If preference is 'Yes', and target has an occupation or works, give points
    if (currentUser.willingnessToWork1 === "Yes" || currentUser.willingnessToWork1 === "ஆம்") {
        if (targetUser.occupationBusiness || targetUser.workDetails || targetUser.workingPlace) {
            score += 10;
        }
    } else if (currentUser.willingnessToWork1 === "No" || currentUser.willingnessToWork1 === "இல்லை") {
        if (!targetUser.occupationBusiness && !targetUser.workingPlace) {
            score += 10;
        }
    } else {
        score += 10; // 'Any' or not specified
    }

    // 9. Temple Match (Weight: 5 Bonus)
    if (currentUser.yourTemple && targetUser.yourTemple && currentUser.yourTemple === targetUser.yourTemple) {
        score += 5;
    }

    // 10. Division Match (Weight: 5 Bonus)
    if (currentUser.yourDivision && targetUser.yourDivision && currentUser.yourDivision === targetUser.yourDivision) {
        score += 5;
    }

    return Math.min(score, 100);
}

// GET /api/matches/suggested - Get suggested matches for logged-in user
router.get("/api/matches/suggested", async (req, res) => {
    try {
        const userEmail = req.cookies.userEmail || req.headers['x-user-email'];
        
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
            const score = calculateMatchScore(currentUser, user);
            return {
                ...user.toJSON(),
                matchScore: score
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
