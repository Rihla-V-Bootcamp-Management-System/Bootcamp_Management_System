const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user
    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach authenticated user
    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Auth middleware error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;