const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  registerUser,
  loginUser,
  verifyOtp,
  setPassword,
  getUserById,
  getUsers,
} = require("../controllers/authControllers");

const router = express.Router();

// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// VERIFY OTP
router.post("/verify-otp", verifyOtp);

// SET PASSWORD
router.post("/set-password", setPassword);

// GET ALL USERS
// SUPERADMIN ONLY
router.get(
  "/users",
  authMiddleware,
  roleMiddleware("superadmin"),
  getUsers
);

// GET SINGLE USER
// ADMIN / SUPERADMIN
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  getUserById
);

module.exports = router;