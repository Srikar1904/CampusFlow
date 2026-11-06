
const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");
const Faculty = require("../models/Faculty");
const authMiddleware = require("../middleware/authMiddleware");
const { notifyAdmins } = require("../utils/notificationService");
const router = express.Router();

// View approved events (for students)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({
      status: "approved",
    }).sort({ date: 1 });

    res.status(200).json({
      message: "Approved events fetched successfully",
      events,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});
// CREATE EVENT - STUDENT AND FACULTY
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, date, time, venue } = req.body;

    // Check user role
    if (!["student", "faculty"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only students and faculty can create events"
      });
    }

    // Validate required fields
    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({
        message: "Please provide all event details"
      });
    }

    // Check organizer account
    let organizer;

    if (req.user.role === "student") {
      organizer = await User.findById(req.user.id);
    } else {
      organizer = await Faculty.findById(req.user.id);
    }

    if (!organizer) {
      return res.status(404).json({
        message: "Organizer account not found"
      });
    }

    if (organizer.isFrozen) {
      return res.status(403).json({
        message: "Your account is frozen. You cannot create events."
      });
    }

    // Validate event date
    const eventDate = new Date(date);

    if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return res.status(400).json({
        message: "Please select a valid future event date"
      });
    }

    // Create event
    const event = await Event.create({
      title: title.trim(),
      description,
      date: eventDate,
      time,
      venue: venue.trim(),
      createdBy: organizer._id,
      organizerRole: req.user.role,
      status: "pending"
    });
    await notifyAdmins({
  title: "New Event Submitted",
  message: `${organizer.name} submitted "${event.title}" for approval.`,
  type: "event",
  relatedId: event._id
});

    res.status(201).json({
      message: "Event submitted successfully. Waiting for admin approval.",
      event
    });

  } catch (error) {
    console.error("Create Event Error:", error);

    res.status(500).json({
      message: "Failed to create event",
      error: error.message
    });
  }
});
// =====================================
// GET MY EVENTS
// =====================================

router.get("/my-events", authMiddleware, async (req, res) => {
  try {
    if (!["student", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const events = await Event.find({
      createdBy: req.user.id,
      organizerRole: req.user.role
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "My events fetched successfully",
      events
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =====================================
// UPDATE MY PENDING EVENT
// =====================================

router.put("/my-events/:id", authMiddleware, async (req, res) => {
  try {
    if (!["student", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, date, time, venue } = req.body;

    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({
        message: "Please provide all event details"
      });
    }

    const eventDate = new Date(date);

    if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      return res.status(400).json({
        message: "Please select a valid future date"
      });
    }

    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id,
        organizerRole: req.user.role,
        status: "pending"
      },
      {
        $set: {
          title: title.trim(),
          description,
          date: eventDate,
          time,
          venue: venue.trim()
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found or cannot be edited"
      });
    }

    res.status(200).json({
      message: "Event updated successfully",
      event
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =====================================
// DELETE MY PENDING EVENT
// =====================================

router.delete("/my-events/:id", authMiddleware, async (req, res) => {
  try {
    if (!["student", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
      organizerRole: req.user.role
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    if (event.status !== "pending") {
      return res.status(400).json({
        message: "Only pending events can be deleted"
      });
    }

    await Event.deleteOne({ _id: event._id });

    res.status(200).json({
      message: "Event deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
