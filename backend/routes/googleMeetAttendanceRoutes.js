const express = require("express");

const {
  scheduleSession,
  syncSessionNow,
} = require("../controllers/googleMeetAttendanceController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CREATE GOOGLE MEET SESSION
// =====================================================

router.post(
  "/schedule",
  authMiddleware,
  scheduleSession
);

// =====================================================
// SYNC GOOGLE MEET ATTENDANCE
// =====================================================

router.post(
  "/:id/sync",
  authMiddleware,
  syncSessionNow
);

module.exports = router;