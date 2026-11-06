
const express = require("express");
const router = express.Router();

const OD = require("../models/OD");
const Event = require("../models/Event");
const User = require("../models/User");
const Faculty = require("../models/Faculty");
const Approval = require("../models/Approval");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================
// STUDENT: APPLY FOR OD
// ======================================

router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const { eventId, reason, date } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can apply for OD"
      });
    }

    if (!eventId || !reason || !date) {
      return res.status(400).json({
        message: "Please provide event, reason and date"
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    const od = await OD.create({
      studentId: req.user.id,
      eventId,
      reason,
      date,
      status: "pending"
    });

    res.status(201).json({
      message: "OD application submitted successfully",
      od
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to submit OD application",
      error: error.message
    });
  }
});


// ======================================
// STUDENT: VIEW MY OD APPLICATIONS
// ======================================

router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view OD applications"
      });
    }

    const applications = await OD.find({
      studentId: req.user.id
    })
      .populate("eventId", "title date time venue")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "OD applications fetched successfully",
      applications
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch OD applications",
      error: error.message
    });
  }
});


// ======================================
// STUDENT: VIEW MY APPROVAL RECORDS
// ======================================

router.get("/my-approvals", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can view approvals"
      });
    }

    const applications = await OD.find({
      studentId: req.user.id
    }).select("_id");

    const odIds = applications.map(item => item._id);

    const approvals = await Approval.find({
      odId: { $in: odIds }
    })
      .populate({
        path: "odId",
        populate: {
          path: "eventId",
          select: "title date time venue"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Approval records fetched successfully",
      approvals
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch approval records",
      error: error.message
    });
  }
});


// ======================================
// FACULTY: VIEW DEPARTMENT OD REQUESTS
// ======================================

router.get("/faculty/requests", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({
        message: "Only faculty can view these requests"
      });
    }

    const faculty = await Faculty.findById(req.user.id);

    if (!faculty || faculty.isFrozen) {
      return res.status(403).json({
        message: "Faculty account not found or disabled"
      });
    }

    // Find students belonging to faculty department
    const students = await User.find({
      department: faculty.department
    }).select("_id");

    const studentIds = students.map(student => student._id);

    // Fetch department OD applications
    const applications = await OD.find({
      studentId: { $in: studentIds }
    })
      .populate(
        "studentId",
        "name email registrationNumber department year section phone"
      )
      .populate(
        "eventId",
        "title description date time venue"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Faculty OD requests fetched successfully",
      total: applications.length,
      applications
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch faculty OD requests",
      error: error.message
    });
  }
});


// ======================================
// FACULTY: APPROVE OR REJECT OD
// ======================================

router.patch(
  "/faculty/:odId/decision",
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "faculty") {
        return res.status(403).json({
          message: "Only faculty can approve OD requests"
        });
      }

      const { status, remarks } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({
          message: "Status must be approved or rejected"
        });
      }

      const faculty = await Faculty.findById(req.user.id);

      if (!faculty || faculty.isFrozen) {
        return res.status(403).json({
          message: "Faculty account not found or disabled"
        });
      }

      const od = await OD.findById(req.params.odId)
        .populate("studentId", "department name");

      if (!od) {
        return res.status(404).json({
          message: "OD application not found"
        });
      }

      // Faculty can only decide requests from their department
      if (od.studentId.department !== faculty.department) {
        return res.status(403).json({
          message: "You cannot process another department's OD request"
        });
      }

      if (od.status !== "pending") {
        return res.status(400).json({
          message: "This OD application has already been processed"
        });
      }

      // Update OD status
      od.status = status;
      await od.save();

      // Create approval history record
      const approval = await Approval.create({
        odId: od._id,
        approverId: faculty._id,
        approverRole: "faculty",
        status,
        remarks: remarks || "",
        approvedAt: new Date()
      });

      res.status(200).json({
        message: `OD application ${status} successfully`,
        od,
        approval
      });

    } catch (error) {
      res.status(500).json({
        message: "Failed to process OD application",
        error: error.message
      });
    }
  }
);
// ======================================
// FACULTY: DASHBOARD STATISTICS
// ======================================

router.get("/faculty/dashboard-stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({
        message: "Only faculty can access dashboard statistics"
      });
    }

    const faculty = await Faculty.findById(req.user.id);

    if (!faculty || faculty.isFrozen) {
      return res.status(403).json({
        message: "Faculty account not found or disabled"
      });
    }

    // Find students from faculty department
    const students = await User.find({
      department: faculty.department
    }).select("_id");

    const studentIds = students.map(student => student._id);

    // Count OD applications
    const total = await OD.countDocuments({
      studentId: { $in: studentIds }
    });

    const pending = await OD.countDocuments({
      studentId: { $in: studentIds },
      status: "pending"
    });

    const approved = await OD.countDocuments({
      studentId: { $in: studentIds },
      status: "approved"
    });

    const rejected = await OD.countDocuments({
      studentId: { $in: studentIds },
      status: "rejected"
    });

    // Recent applications
    const recentApplications = await OD.find({
      studentId: { $in: studentIds }
    })
      .populate("studentId", "name registrationNumber")
      .populate("eventId", "title date")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Faculty dashboard statistics fetched successfully",

      department: faculty.department,

      statistics: {
        total,
        pending,
        approved,
        rejected
      },

      recentApplications
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
});
module.exports = router;
