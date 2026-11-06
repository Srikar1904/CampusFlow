const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// =====================================
// GET MY NOTIFICATIONS
// =====================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.id,
      recipientRole: req.user.role
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.id,
      recipientRole: req.user.role,
      isRead: false
    });

    res.status(200).json({
      notifications,
      unreadCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =====================================
// MARK ONE NOTIFICATION AS READ
// =====================================

router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: req.user.id,
        recipientRole: req.user.role
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =====================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================

router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipientId: req.user.id,
        recipientRole: req.user.role,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.status(200).json({
      message: "All notifications marked as read"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =====================================
// DELETE ONE NOTIFICATION
// =====================================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user.id,
      recipientRole: req.user.role
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;