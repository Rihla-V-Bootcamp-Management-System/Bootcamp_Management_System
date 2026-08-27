const express = require("express");

const router = express.Router();

const {
  scheduleSession,
} = require("../controllers/googleMeetAttendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// =====================================================
// SCHEDULE GOOGLE MEET
// =====================================================

router.post(
  "/sessions",
  authMiddleware,
  roleMiddleware("mentor", "admin"),
  scheduleSession
);

module.exports = router;