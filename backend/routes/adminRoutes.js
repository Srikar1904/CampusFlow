const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const User = require("../models/User");
const Faculty = require("../models/Faculty");
const Event = require("../models/Event");
const Approval = require("../models/Approval");
const OD = require("../models/OD");
const { createNotification } = require("../utils/notificationService");
const mongoose = require("mongoose");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================
// ADMIN REGISTRATION
// ======================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, setupCode } = req.body;

    if (!name || !email || !password || !setupCode) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (setupCode !== process.env.ADMIN_SETUP_CODE) {
      return res.status(403).json({
        message: "Invalid admin setup code",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });

  } catch (error) {
    console.error("Admin registration error:", error);

    return res.status(500).json({
      message: "Admin registration failed",
    });
  }
});


// ======================================
// ADMIN LOGIN
// ======================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({
      email: email?.toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });

  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Admin login failed",
    });
  }
});


// ======================================
// ADMIN DASHBOARD STATISTICS
// ======================================

router.get("/dashboard-stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can access this dashboard",
      });
    }

    const totalStudents = await User.countDocuments();

    const totalFaculty = await Faculty.countDocuments();

    const totalEvents = await Event.countDocuments();

    const totalOD = await OD.countDocuments();

    const pendingOD = await OD.countDocuments({
      status: "pending",
    });

    const approvedOD = await OD.countDocuments({
      status: "approved",
    });

    const rejectedOD = await OD.countDocuments({
      status: "rejected",
    });

    const recentApplications = await OD.find()
      .populate(
        "studentId",
        "name email registrationNumber department"
      )
      .populate("eventId", "title date")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      message: "Admin dashboard statistics fetched successfully",

      statistics: {
        totalStudents,
        totalFaculty,
        totalEvents,
        totalOD,
        pendingOD,
        approvedOD,
        rejectedOD,
      },

      recentApplications,
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      message: "Failed to fetch admin dashboard statistics",
      error: error.message,
    });
  }
});


// ======================================
// ADMIN: GET ALL STUDENTS
// ======================================

router.get("/students", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can access student management",
      });
    }

    const { search, department } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        {
          registrationNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (department) {
      filter.department = {
        $regex: `^${department}$`,
        $options: "i",
      };
    }

    const students = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Students fetched successfully",
      totalStudents: students.length,
      students,
    });

  } catch (error) {
    console.error("Fetch students error:", error);

    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});


// ======================================
// ADMIN: VIEW SINGLE STUDENT DETAILS
// ======================================

router.get("/students/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can access student details",
      });
    }

    const student = await User.findById(req.params.id)
      .select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student details fetched successfully",
      student,
    });

  } catch (error) {
    console.error("Student details error:", error);

    res.status(500).json({
      message: "Failed to fetch student details",
    });
  }
});

// ======================================
// ADMIN: APPROVE / REJECT EVENT
// WITH ORGANIZER NOTIFICATION
// ======================================

router.patch("/events/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can manage events"
      });
    }

    const { status, adminRemarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid event ID"
      });
    }

    // Fetch event details
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    const previousStatus = event.status;

    // Update event without validating legacy fields
    const result = await Event.updateOne(
      { _id: req.params.id },
      {
        $set: {
          status,
          adminRemarks: adminRemarks || "",
          updatedAt: new Date()
        }
      },
      { timestamps: false }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    // Notify event creator only when status changes
    if (
      previousStatus !== status &&
      event.createdBy &&
      ["student", "faculty"].includes(event.organizerRole)
    ) {
      await createNotification({
        recipientId: event.createdBy,
        recipientRole: event.organizerRole,

        title: status === "approved"
          ? "Event Approved 🎉"
          : "Event Rejected",

        message: `Your event "${event.title}" has been ${status}. ${
          adminRemarks ? "Admin Remarks: " + adminRemarks : ""
        }`,

        type: "event",
        relatedId: event._id
      });
    }

    return res.status(200).json({
      message: `Event ${status} successfully`,
      eventId: req.params.id,
      status,
      adminRemarks: adminRemarks || ""
    });

  } catch (error) {
    console.error("Event status error:", error);

    return res.status(500).json({
      message: "Failed to update event status",
      error: error.message
    });
  }
});

// ======================================
// ADMIN: DELETE STUDENT ACCOUNT
// ======================================

router.delete("/students/:id", authMiddleware, async (req, res) => {
  try {
    // Verify admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can delete student accounts",
      });
    }

    // Find student
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Check existing OD applications
    const existingOD = await OD.countDocuments({
      studentId: student._id,
    });

    // Prevent deletion if OD records exist
    if (existingOD > 0) {
      return res.status(409).json({
        message:
          "This student has existing OD applications. Account deletion is blocked to preserve academic records.",
        totalODApplications: existingOD,
      });
    }

    // Delete student
    await User.findByIdAndDelete(student._id);

    return res.status(200).json({
      message: "Student account deleted successfully",
      deletedStudent: {
        id: student._id,
        name: student.name,
        registrationNumber: student.registrationNumber,
      },
    });

  } catch (error) {
    console.error("Delete student error:", error);

    return res.status(500).json({
      message: "Failed to delete student account",
    });
  }
});
// ======================================
// ADMIN: GET ALL FACULTY
// ======================================

router.get("/faculty", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can access faculty management",
      });
    }

    const { search, department } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    if (department) {
      filter.department = {
        $regex: `^${department}$`,
        $options: "i",
      };
    }

    const faculty = await Faculty.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Faculty fetched successfully",
      totalFaculty: faculty.length,
      faculty,
    });

  } catch (error) {
    console.error("Fetch faculty error:", error);

    res.status(500).json({
      message: "Failed to fetch faculty",
    });
  }
});
// ======================================
// ADMIN: VIEW FACULTY DETAILS
// ======================================

router.get("/faculty/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can access faculty details",
      });
    }

    const faculty = await Faculty.findById(req.params.id)
      .select("-password");

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    res.status(200).json({
      message: "Faculty details fetched successfully",
      faculty,
    });

  } catch (error) {
    console.error("Faculty details error:", error);

    res.status(500).json({
      message: "Failed to fetch faculty details",
    });
  }
});
// ======================================
// ADMIN: FREEZE / UNFREEZE FACULTY
// ======================================

router.patch("/faculty/:id/freeze", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can manage faculty accounts",
      });
    }

    const { isFrozen } = req.body;

    if (typeof isFrozen !== "boolean") {
      return res.status(400).json({
        message: "Please provide a valid account status",
      });
    }

    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    faculty.isFrozen = isFrozen;

    await faculty.save();

    res.status(200).json({
      message: isFrozen
        ? "Faculty account frozen successfully"
        : "Faculty account unfrozen successfully",

      faculty: {
        id: faculty._id,
        name: faculty.name,
        isFrozen: faculty.isFrozen,
      },
    });

  } catch (error) {
    console.error("Faculty freeze error:", error);

    res.status(500).json({
      message: "Failed to update faculty account",
    });
  }
});
// ======================================
// ADMIN: DELETE FACULTY
// ======================================

router.delete("/faculty/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can delete faculty accounts",
      });
    }

    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    // Check whether faculty has approval records
    const existingApprovals = await Approval.countDocuments({
      approverId: faculty._id,
    });

    if (existingApprovals > 0) {
      return res.status(409).json({
        message:
          "This faculty member has existing approval records. Deletion is blocked to preserve academic records.",
        totalApprovals: existingApprovals,
      });
    }

    await Faculty.findByIdAndDelete(faculty._id);

    res.status(200).json({
      message: "Faculty account deleted successfully",
      deletedFaculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
      },
    });

  } catch (error) {
    console.error("Delete faculty error:", error);

    res.status(500).json({
      message: "Failed to delete faculty",
    });
  }
});
// ======================================
// ADMIN: GET ALL EVENTS
// ======================================

router.get("/events", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can access events",
      });
    }

    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Events fetched successfully",
      totalEvents: events.length,
      events,
    });

  } catch (error) {
    console.error("Fetch events error:", error);

    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
});


// ======================================
// ADMIN: VIEW EVENT DETAILS
// ======================================

router.get("/events/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can view event details",
      });
    }

    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      message: "Event details fetched successfully",
      event,
    });

  } catch (error) {
    console.error("Event details error:", error);

    res.status(500).json({
      message: "Failed to fetch event details",
    });
  }
});


// ======================================
// ADMIN: APPROVE / REJECT EVENT
// ======================================

router.patch("/events/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can manage events",
      });
    }

    const { status, adminRemarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be approved or rejected",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    event.status = status;
    event.adminRemarks = adminRemarks || "";

    await event.save();

    res.status(200).json({
      message: `Event ${status} successfully`,
      event,
    });

  } catch (error) {
    console.error("Event status error:", error);

    res.status(500).json({
      message: "Failed to update event status",
    });
  }
});


// ======================================
// ADMIN: DELETE EVENT
// ======================================

router.delete("/events/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can delete events",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Preserve existing OD application records
    const existingOD = await OD.countDocuments({
      eventId: event._id,
    });

    if (existingOD > 0) {
      return res.status(409).json({
        message:
          "This event has existing OD applications. Deletion is blocked to preserve academic records.",
        totalODApplications: existingOD,
      });
    }

    await Event.findByIdAndDelete(event._id);

    res.status(200).json({
      message: "Event deleted successfully",
      deletedEvent: {
        id: event._id,
        title: event.title,
      },
    });

  } catch (error) {
    console.error("Delete event error:", error);

    res.status(500).json({
      message: "Failed to delete event",
    });
  }
});
// ==========================================
// ADMIN - GET ALL OD APPLICATIONS
// ==========================================

router.get("/od-applications", authMiddleware, async (req, res) => {
  try {
    // Only admin can access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can view OD applications"
      });
    }

    const { search, status } = req.query;

    // Fetch OD applications with student and event details
    const applications = await OD.find()
      .populate(
        "studentId",
        "name email registrationNumber department year section phone"
      )
      .populate(
        "eventId",
        "title date time venue"
      )
      .sort({ createdAt: -1 });

    // Fetch approval records for these applications
    const odIds = applications.map((od) => od._id);

    const approvals = await Approval.find({
      odId: { $in: odIds }
    })
      .populate("approverId", "name email department")
      .sort({ createdAt: 1 });

    // Attach approval details to each OD application
    let result = applications.map((od) => {
      const odApprovals = approvals.filter(
        (approval) => approval.odId.toString() === od._id.toString()
      );

      return {
        ...od.toObject(),
        approvals: odApprovals
      };
    });

    // Filter by OD status
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      result = result.filter(
        (od) => od.status === status
      );
    }

    // Search by student name, registration number, email or event title
    if (search) {
      const searchText = search.toLowerCase();

      result = result.filter((od) => {
        const student = od.studentId || {};
        const event = od.eventId || {};

        return (
          student.name?.toLowerCase().includes(searchText) ||
          student.registrationNumber?.toLowerCase().includes(searchText) ||
          student.email?.toLowerCase().includes(searchText) ||
          event.title?.toLowerCase().includes(searchText)
        );
      });
    }

    return res.status(200).json({
      message: "OD applications fetched successfully",
      total: result.length,
      applications: result
    });

  } catch (error) {
    console.error("Admin OD applications error:", error);

    return res.status(500).json({
      message: "Failed to fetch OD applications",
      error: error.message
    });
  }
});
// ==========================================
// ADMIN: REPORTS AND ANALYTICS
// ==========================================

router.get("/reports", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can access reports"
      });
    }

    // 1. Overall statistics
    const [
      totalStudents,
      totalFaculty,
      totalEvents,
      totalOD,
      pendingOD,
      approvedOD,
      rejectedOD
    ] = await Promise.all([
      User.countDocuments(),
      Faculty.countDocuments(),
      Event.countDocuments(),
      OD.countDocuments(),
      OD.countDocuments({ status: "pending" }),
      OD.countDocuments({ status: "approved" }),
      OD.countDocuments({ status: "rejected" })
    ]);

    // 2. Department-wise OD statistics
    const applications = await OD.find()
      .populate("studentId", "department")
      .select("status createdAt");

    const departmentMap = {};

    applications.forEach((application) => {
      const department =
        application.studentId?.department || "Unknown";

      if (!departmentMap[department]) {
        departmentMap[department] = {
          department,
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        };
      }

      departmentMap[department].total++;

      if (application.status === "pending") {
        departmentMap[department].pending++;
      } else if (application.status === "approved") {
        departmentMap[department].approved++;
      } else if (application.status === "rejected") {
        departmentMap[department].rejected++;
      }
    });

    const departmentStats = Object.values(departmentMap);

    // 3. Monthly OD application trends (last 6 months)
    const monthlyMap = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const label = date.toLocaleString("en-IN", {
        month: "short",
        year: "numeric"
      });

      monthlyMap[key] = {
        month: label,
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0
      };
    }

    applications.forEach((application) => {
      if (!application.createdAt) return;

      const date = new Date(application.createdAt);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthlyMap[key]) {
        monthlyMap[key].total++;

        if (application.status === "approved") {
          monthlyMap[key].approved++;
        } else if (application.status === "rejected") {
          monthlyMap[key].rejected++;
        } else if (application.status === "pending") {
          monthlyMap[key].pending++;
        }
      }
    });

    const monthlyStats = Object.values(monthlyMap);

    // 4. Send report data
    return res.status(200).json({
      message: "Reports generated successfully",

      overview: {
        totalStudents,
        totalFaculty,
        totalEvents,
        totalOD,
        pendingOD,
        approvedOD,
        rejectedOD
      },

      departmentStats,
      monthlyStats
    });

  } catch (error) {
    console.error("Admin reports error:", error);

    return res.status(500).json({
      message: "Failed to generate reports",
      error: error.message
    });
  }
});
// GET ADMIN PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ admin });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// UPDATE ADMIN PROFILE
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email } = req.body;

    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (email) {
      const existing = await Admin.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: admin._id }
      });

      if (existing) {
        return res.status(409).json({ message: "Email already exists" });
      }

      admin.email = email.toLowerCase().trim();
    }

    if (name) admin.name = name.trim();

    await admin.save();

    res.status(200).json({
      message: "Profile updated successfully",
      admin: {
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// CHANGE ADMIN PASSWORD
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Provide valid passwords (minimum 6 characters)"
      });
    }

    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;