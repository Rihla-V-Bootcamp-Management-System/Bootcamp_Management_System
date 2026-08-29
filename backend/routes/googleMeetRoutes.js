const express = require("express");

const router = express.Router();

const {
  scheduleSession,
  syncSessionNow,
  previewSessionParticipants,
} = require("../controllers/googleMeetAttendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// =====================================================
// SCHEDULE GOOGLE MEET
// =====================================================

router.post(
  "/sessions",
  authMiddleware,
  roleMiddleware("mentor", "admin", "superadmin"),
  scheduleSession
);

// =====================================================
// PREVIEW GOOGLE MEET PARTICIPANTS
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