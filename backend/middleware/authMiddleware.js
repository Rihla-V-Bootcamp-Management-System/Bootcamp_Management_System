const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =========================================================
// AUTHENTICATION MIDDLEWARE
// =========================================================

const authMiddleware = async (req, res, next) => {
  try {
    // =======================================================
    // GET AUTHORIZATION HEADER
    // =======================================================

    const authHeader = req.headers.authorization;

    console.log("Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    // =======================================================
    // GET TOKEN
    // =======================================================

    const token = authHeader.substring(7).trim();

    console.log(
      "Token received:",
      token ? "YES" : "NO"
    );

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token",
      });
    }

    // =======================================================
    // VERIFY TOKEN
    // =======================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("Decoded token:", decoded);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // =======================================================
    // FIND USER
    // =======================================================

    const user = await User.findById(
      decoded.id
    ).select("-password");

    console.log(
      "User found:",
      user ? user.email : "NO USER"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // =======================================================
    // ATTACH USER TO REQUEST
    // =======================================================

    req.user = user;
    req.userId = user._id;

    console.log("Authenticated user:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // =======================================================
    // CONTINUE
    // =======================================================

    next();

  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error.message
    );

    // =======================================================
    // TOKEN EXPIRED
    // =======================================================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again",
      });
    }

    // =======================================================
    // INVALID TOKEN
    // =======================================================

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // =======================================================
    // OTHER AUTHENTICATION ERRORS
    // =======================================================

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;