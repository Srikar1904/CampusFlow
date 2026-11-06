const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
// Student Registration
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      registrationNumber,
      department,
      year,
      section,
      phone,
    } = req.body;

    // Check whether student already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { registrationNumber }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Student already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      registrationNumber,
      department,
      year,
      section,
      phone,
    });

    res.status(201).json({
      message: "Student registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});
// Student Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
const token = jwt.sign(
  {
    id: user._id,
    role: "student",
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d",
  }
);
    res.status(200).json({
  message: "Student login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    registrationNumber: user.registrationNumber,
  },
});
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});
// Get Student Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const student = await User.findById(req.user.id).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});

// Update Student Profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const { name, department, year, section, phone } = req.body;

    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    student.name = name ?? student.name;
    student.department = department ?? student.department;
    student.year = year ?? student.year;
    student.section = section ?? student.section;
    student.phone = phone ?? student.phone;

    await student.save();

    res.status(200).json({
      message: "Profile updated successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        registrationNumber: student.registrationNumber,
        department: student.department,
        year: student.year,
        section: student.section,
        phone: student.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
});
module.exports = router;