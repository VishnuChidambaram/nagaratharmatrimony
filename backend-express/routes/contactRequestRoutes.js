import express from "express";
import db from "../models/index.js";
import logger from "../utils/logger.js";


const router = express.Router();

// POST /api/contact-requests/send - Send a contact request to a profile
router.post("/api/contact-requests/send", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const requesterEmail = req.user.email;
    const { target_user_id } = req.body;

    if (!target_user_id) {
      return res.status(400).json({ success: false, message: "target_user_id is required" });
    }

    // Prevent self-request
    const currentUser = await db.UserDetail.findOne({ where: { email: requesterEmail } });
    if (currentUser && currentUser.user_id === parseInt(target_user_id)) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
    }

    // Check if target user exists
    const targetUser = await db.UserDetail.findOne({
      where: { user_id: target_user_id, is_deleted: false },
    });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    // Check if request already exists
    const existing = await db.ContactRequest.findOne({
      where: { requester_email: requesterEmail, target_user_id },
    });

    if (existing) {
      return res.json({
        success: false,
        message: `Request already ${existing.status}`,
        status: existing.status,
      });
    }

    const request = await db.ContactRequest.create({
      requester_email: requesterEmail,
      target_user_id,
      status: "pending",
    });

    res.json({ success: true, message: "Contact request sent", request });
  } catch (error) {
    logger.error("Send contact request error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/contact-requests/received - Pending requests received by current user
router.get("/api/contact-requests/received", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const currentUser = await db.UserDetail.findOne({
      where: { email: req.user.email, is_deleted: false },
    });
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const requests = await db.ContactRequest.findAll({
      where: { target_user_id: currentUser.user_id, status: "pending" },
      order: [["created_at", "DESC"]],
    });





    // Enrich with requester details
    const requesterEmails = requests.map((r) => r.requester_email);
    const requesterDetails = await db.UserDetail.findAll({
      where: { email: requesterEmails, is_deleted: false },
      attributes: ["user_id", "name", "email", "photo", "yourTemple", "yourDivision", "gender", "educationQualification", "workDetails", "photoPassword"],
    });

    const detailsMap = {};
    requesterDetails.forEach((u) => {
      const userData = u.toJSON();
      userData.hasPhotoPassword = !!userData.photoPassword;
      delete userData.photoPassword;
      detailsMap[u.email] = userData;
    });


    const enriched = requests.map((r) => ({
      id: r.id,
      status: r.status,
      created_at: r.created_at,
      requester: detailsMap[r.requester_email] || { email: r.requester_email },
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    logger.error("Fetch received requests error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/contact-requests/sent - Requests sent by current user
router.get("/api/contact-requests/sent", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const requests = await db.ContactRequest.findAll({
      where: { requester_email: req.user.email },
      order: [["created_at", "DESC"]],
    });

    // Enrich with target user details
    const targetIds = requests.map((r) => r.target_user_id);
    const targetDetails = await db.UserDetail.findAll({
      where: { user_id: targetIds, is_deleted: false },
      attributes: ["user_id", "name", "email", "photo", "yourTemple", "yourDivision", "gender", "educationQualification", "workDetails", "photoPassword"],
    });

    const detailsMap = {};
    targetDetails.forEach((u) => {
      const userData = u.toJSON();
      userData.hasPhotoPassword = !!userData.photoPassword;
      delete userData.photoPassword;
      detailsMap[u.user_id] = userData;
    });


    const enriched = requests.map((r) => ({
      id: r.id,
      status: r.status,
      created_at: r.created_at,
      target: detailsMap[r.target_user_id] || { user_id: r.target_user_id },
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    logger.error("Fetch sent requests error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/contact-requests/:id/approve - Approve a received request
router.put("/api/contact-requests/:id/approve", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { id } = req.params;
    const currentUser = await db.UserDetail.findOne({
      where: { email: req.user.email, is_deleted: false },
    });

    const request = await db.ContactRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Only the target of the request can approve
    if (!currentUser || request.target_user_id !== currentUser.user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await request.update({ status: "approved" });

    // Optionally create a notification for the requester
    try {
      await db.Notification.create({
        user_email: request.requester_email,
        message: `${currentUser.name} has approved your contact request.`,
        type: "success",
      });
    } catch (_) {}

    res.json({ success: true, message: "Request approved" });
  } catch (error) {
    logger.error("Approve request error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/contact-requests/:id/reject - Reject a received request
router.put("/api/contact-requests/:id/reject", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { id } = req.params;
    const currentUser = await db.UserDetail.findOne({
      where: { email: req.user.email, is_deleted: false },
    });

    const request = await db.ContactRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (!currentUser || request.target_user_id !== currentUser.user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await request.update({ status: "rejected" });
    res.json({ success: true, message: "Request rejected" });
  } catch (error) {
    logger.error("Reject request error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/contact-requests/approved - Contacts approved by current user (people I approved)
router.get("/api/contact-requests/approved", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const currentUser = await db.UserDetail.findOne({
      where: { email: req.user.email, is_deleted: false },
    });
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const requests = await db.ContactRequest.findAll({
      where: { target_user_id: currentUser.user_id, status: "approved" },
      order: [["updated_at", "DESC"]],
    });

    const requesterEmails = requests.map((r) => r.requester_email);
    const users = await db.UserDetail.findAll({
      where: { email: requesterEmails, is_deleted: false },
    });

    const usersMap = {};
    users.forEach((u) => {
      const userData = u.toJSON();
      userData.hasPhotoPassword = !!userData.photoPassword;
      delete userData.photoPassword;
      usersMap[u.email] = userData;
    });


    const enriched = requests.map((r) => ({
      id: r.id,
      approved_at: r.updated_at,
      user: usersMap[r.requester_email] || { email: r.requester_email },
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    logger.error("Fetch approved contacts error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/contact-requests/approved-by-others - Contacts who approved my request (I can see their details)
router.get("/api/contact-requests/approved-by-others", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const requests = await db.ContactRequest.findAll({
      where: { requester_email: req.user.email, status: "approved" },
      order: [["updated_at", "DESC"]],
    });

    const targetIds = requests.map((r) => r.target_user_id);
    const users = await db.UserDetail.findAll({
      where: { user_id: targetIds, is_deleted: false },
    });

    const usersMap = {};
    users.forEach((u) => {
      const userData = u.toJSON();
      userData.hasPhotoPassword = !!userData.photoPassword;
      delete userData.photoPassword;
      usersMap[u.user_id] = userData;
    });


    const enriched = requests.map((r) => ({
      id: r.id,
      approved_at: r.updated_at,
      user: usersMap[r.target_user_id] || { user_id: r.target_user_id },
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    logger.error("Fetch approved-by-others error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/contact-requests/status/:targetUserId - Check request status for a specific user
router.get("/api/contact-requests/status/:targetUserId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { targetUserId } = req.params;
    const request = await db.ContactRequest.findOne({
      where: { requester_email: req.user.email, target_user_id: targetUserId },
    });

    res.json({
      success: true,
      status: request ? request.status : null,
      requestId: request ? request.id : null,
    });
  } catch (error) {
    logger.error("Check request status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
