
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Faculty = require("../models/Faculty");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =================================
// FACULTY REGISTRATION
// =================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingFaculty = await Faculty.findOne({
      email: normalizedEmail
    });

    if (existingFaculty) {
      return res.status(400).json({
        message: "Faculty already registered with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = await Faculty.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      department,
      phone
    });

    res.status(201).json({
      message: "Faculty registered successfully",
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Faculty registration failed",
      error: error.message
    });
  }
});


// =================================
// FACULTY LOGIN
// =================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const faculty = await Faculty.findOne({
      email: email.trim().toLowerCase()
    });

    if (!faculty) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    if (faculty.isFrozen) {
      return res.status(403).json({
        message: "Your faculty account is currently disabled"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      faculty.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: faculty._id,
        role: "faculty"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Faculty login successful",
      token,
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Faculty login failed",
      error: error.message
    });
  }
});


// =================================
// FACULTY: VIEW PROFILE
// =================================

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({
        message: "Access denied. Faculty only."
      });
    }

    const faculty = await Faculty.findById(req.user.id)
      .select("-password");

    if (!faculty || faculty.isFrozen) {
      return res.status(404).json({
        message: "Faculty account not found or disabled"
      });
    }

    res.status(200).json({
      message: "Faculty profile fetched successfully",
      faculty
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch faculty profile",
      error: error.message
    });
  }
});


// =================================
// FACULTY: UPDATE PROFILE
// =================================

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({
        message: "Access denied. Faculty only."
      });
    }

    const { name, department, phone } = req.body;

    const faculty = await Faculty.findById(req.user.id);

    if (!faculty || faculty.isFrozen) {
      return res.status(404).json({
        message: "Faculty account not found or disabled"
      });
    }

    if (name !== undefined) {
      faculty.name = name.trim();
    }

    if (department !== undefined) {
      faculty.department = department.trim();
    }

    if (phone !== undefined) {
      faculty.phone = phone.trim();
    }

    await faculty.save();

    res.status(200).json({
      message: "Faculty profile updated successfully",
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        phone: faculty.phone
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update faculty profile",
      error: error.message
    });
  }
});

module.exports = router;
