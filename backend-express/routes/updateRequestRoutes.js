import express from "express";
import db from "../models/index.js";

const router = express.Router();

// POST /api/update-requests - Create new update request
router.post("/api/update-requests", async (req, res) => {
  try {
    const { user_email, new_data } = req.body;

    if (!user_email || !new_data) {
      return res.status(400).json({
        success: false,
        message: "User email and new data are required",
      });
    }

    // Fetch current user data as original_data
    const currentUser = await db.UserDetail.findOne({
      where: { email: user_email },
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert to plain object to get original data
    const original_data = currentUser.toJSON();

    // Create update request
    const updateRequest = await db.UpdateRequest.create({
      user_id: currentUser.user_id,
      user_email: user_email,
      original_data: original_data,
      new_data: new_data,
      status: "pending",
    });

    res.json({
      success: true,
      message: "Update request submitted successfully. Waiting for admin approval.",
      data: updateRequest,
    });
  } catch (error) {
    console.error("Create update request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/update-requests - Get all pending requests (Admin only)
router.get("/api/update-requests", async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { status } : { status: "pending" };

    const requests = await db.UpdateRequest.findAll({
      where: whereClause,
      attributes: ['request_id', 'user_id', 'user_email', 'status', 'created_at', 'reviewed_at', 'reviewed_by', 'new_data'],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    console.error("Fetch update requests error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/update-requests/user/:email - Check if user has pending update request
router.get("/api/update-requests/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const pendingRequest = await db.UpdateRequest.findOne({
      where: {
        user_email: email,
        status: "pending",
      },
    });

    res.json({
      success: true,
      hasPending: pendingRequest !== null,
      request: pendingRequest,
    });
  } catch (error) {
    console.error("Check pending request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/update-requests/:id - Get single request details
router.get("/api/update-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const request = await db.UpdateRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Fetch single update request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PUT /api/update-requests/:id/approve - Approve request
router.put("/api/update-requests/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const request = await db.UpdateRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed",
      });
    }

    // Update user data with new_data
    const user = await db.UserDetail.findOne({
      where: { email: request.user_email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user with new data
    await user.update(request.new_data);

    // Update request status
    await request.update({
      status: "approved",
      reviewed_at: new Date(),
      reviewed_by: req.body.admin_id || null,
    });

    // Create notification for user
    await db.Notification.create({
      user_email: request.user_email,
      message: "Your profile update request has been approved! Your details have been updated successfully.",
      type: "success",
      is_read: false,
    });

    res.json({
      success: true,
      message: "Request approved and user data updated",
      data: request,
    });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PUT /api/update-requests/:id/reject - Reject request
router.put("/api/update-requests/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await db.UpdateRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed",
      });
    }

    // Update request status
    await request.update({
      status: "rejected",
      reviewed_at: new Date(),
      reviewed_by: req.body.admin_id || null,
    });

    // Create notification for user
    const message = reason
      ? `Your profile update request has been rejected. Reason: ${reason}`
      : "Your profile update request has been rejected. Please contact admin for more information.";

    await db.Notification.create({
      user_email: request.user_email,
      message: message,
      type: "error",
      is_read: false,
    });

    res.json({
      success: true,
      message: "Request rejected",
      data: request,
    });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE /api/update-requests/:id - Cancel pending request
router.delete("/api/update-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const request = await db.UpdateRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }

    // Delete the request
    await request.destroy();

    res.json({
      success: true,
      message: "Update request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
