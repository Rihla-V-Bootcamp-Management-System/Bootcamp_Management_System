const express = require("express");

const router =
  express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createSession,
  openSession,
  startTracking,
  stopTracking,
  reviewSession,
  saveSession,
  getSessions,
  getSessionById,
  participantJoin,
  participantLeave,
} = require("../controllers/SessionController");

// =========================================================
// GET ALL SESSIONS
// =========================================================

router.get(
  "/",
  authMiddleware,
  getSessions
);

// =========================================================
// GET SESSION BY ID
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  getSessionById
);

// =========================================================
// CREATE SESSION
// =========================================================

router.post(
  "/",
  authMiddleware,
  createSession
);

// =========================================================
// OPEN SESSION
// =========================================================

router.post(
  "/:id/open",
  authMiddleware,
  openSession
);

// =========================================================
// START TRACKING
// =========================================================

router.post(
  "/:id/start",
  authMiddleware,
  startTracking
);

// =========================================================
// STOP TRACKING
// =========================================================

router.post(
  "/:id/stop",
  authMiddleware,
  stopTracking
);

// =========================================================
// REVIEW SESSION
// =========================================================

router.post(
  "/:id/review",
  authMiddleware,
  reviewSession
);

// =========================================================
// SAVE SESSION
// =========================================================

router.post(
  "/:id/save",
  authMiddleware,
  saveSession
);

// =========================================================
// STUDENT JOIN
// =========================================================

router.post(
  "/:id/join",
  authMiddleware,
  participantJoin
);

// =========================================================
// STUDENT LEAVE
// =========================================================

router.post(
  "/:id/leave",
  authMiddleware,
  participantLeave
);

module.exports = router;