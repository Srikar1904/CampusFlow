const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // CHECK WHETHER STUDENT ACCOUNT IS FROZEN
    if (decoded.role === "student") {
      const student = await User.findById(decoded.id)
        .select("isFrozen");

      if (!student) {
        return res.status(401).json({
          message: "Student account not found. Please login again.",
        });
      }

      if (student.isFrozen) {
        return res.status(403).json({
          message:
            "Your account has been frozen by the administrator. Please contact college administration.",
        });
      }
    }

    next();

  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
};

module.exports = authMiddleware;