import express from "express";
import db from "../models/index.js";


const router = express.Router();

// Middleware to ensure user is authenticated (using sessionAuthMiddleware from server.js logic)
// For now, I'll rely on the req.user populated by the sessionAuthMiddleware in server.js

// GET /api/shortlist - Get all shortlisted profiles for the logged-in user
router.get("/api/shortlist", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userEmail = req.user.email;

    const shortlists = await db.Shortlist.findAll({
      where: { user_email: userEmail },
      attributes: ['shortlisted_user_id']
    });

    const shortlistedIds = shortlists.map(s => s.shortlisted_user_id);
    
    // Fetch full details of shortlisted users
    const users = await db.UserDetail.findAll({
      where: {
        user_id: shortlistedIds,
        is_deleted: false
      }
    });

    const results = users.map(u => u.toJSON());

    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Fetch shortlist error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/shortlist/toggle - Add or remove profile from shortlist
router.post("/api/shortlist/toggle", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userEmail = req.user.email;
    const { shortlisted_user_id } = req.body;

    if (!shortlisted_user_id) {
      return res.status(400).json({ success: false, message: "Shortlisted user ID is required" });
    }

    const existing = await db.Shortlist.findOne({
      where: {
        user_email: userEmail,
        shortlisted_user_id: shortlisted_user_id
      }
    });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, message: "Removed from shortlist", action: "removed" });
    } else {
      await db.Shortlist.create({
        user_email: userEmail,
        shortlisted_user_id: shortlisted_user_id
      });
      return res.json({ success: true, message: "Added to shortlist", action: "added" });
    }
  } catch (error) {
    console.error("Toggle shortlist error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/shortlist/ids - Get only IDs of shortlisted users (for dashboard status)
router.get("/api/shortlist/ids", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const userEmail = req.user.email;

    const shortlists = await db.Shortlist.findAll({
      where: { user_email: userEmail },
      attributes: ['shortlisted_user_id']
    });

    const shortlistedIds = shortlists.map(s => s.shortlisted_user_id);
    res.json({ success: true, ids: shortlistedIds });
  } catch (error) {
    console.error("Fetch shortlist IDs error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
