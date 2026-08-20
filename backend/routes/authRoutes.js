const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  registerUser,
  loginUser,
  verifyOtp,
  setPassword,
  getUserById,
} = require("../controllers/authControllers");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/verify-otp", verifyOtp);

router.post("/set-password", setPassword);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getUserById
);

module.exports = router;