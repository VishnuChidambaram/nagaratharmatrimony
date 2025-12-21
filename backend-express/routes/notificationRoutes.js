import express from "express";
import db from "../models/index.js";

const router = express.Router();

// GET /api/notifications/:email - Get user notifications
router.get("/api/notifications/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const notifications = await db.Notification.findAll({
      where: {
        user_email: email,
        is_read: false,
      },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      notifications: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await db.Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.update({ is_read: true });

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE /api/notifications/:id - Delete notification (optional)
router.delete("/api/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db.Notification.destroy({
      where: { notification_id: id },
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
