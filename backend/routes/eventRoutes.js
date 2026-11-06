const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// View all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    res.status(200).json({
      message: "Events fetched successfully",
      events,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});

module.exports = router;