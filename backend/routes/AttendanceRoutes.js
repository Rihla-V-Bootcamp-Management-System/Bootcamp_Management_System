const express = require("express");

const router = express.Router();

const {
  checkIn,
  checkOut,
  excuseAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceControllers");

const authMiddleware = require("../middleware/authMiddleware");

// =========================================================
// ATTENDANCE
// =========================================================

// Student check-in
router.post(
  "/check-in",
  authMiddleware,
  checkIn
);

// Student check-out
router.post(
  "/check-out",
  authMiddleware,
  checkOut
);

// Approve excuse
router.post(
  "/excuse",
  authMiddleware,
  excuseAttendance
);

// View attendance
router.get(
  "/",
  authMiddleware,
  getAttendance
);

// Update attendance
router.put(
  "/:id",
  authMiddleware,
  updateAttendance
);

// Delete attendance
router.delete(
  "/:id",
  authMiddleware,
  deleteAttendance
);

module.exports = router;