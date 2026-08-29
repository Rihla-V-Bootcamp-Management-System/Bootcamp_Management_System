const express = require("express");

const {
  scheduleSession,
  syncSessionNow,
  previewSessionParticipants,
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
// PREVIEW GOOGLE MEET PARTICIPANTS (BEFORE SYNC)
// =====================================================

router.get(
  "/:id/participants",
  authMiddleware,
  previewSessionParticipants
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