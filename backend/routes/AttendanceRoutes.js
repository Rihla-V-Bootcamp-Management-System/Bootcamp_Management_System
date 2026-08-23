const express = require("express");

const router = express.Router();

const {
  createAttendance,
  getAttendanceById,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
} = require("../controllers/attendanceControllers");

const authMiddleware = require("../middleware/authMiddleware");

// =========================================================
// ATTENDANCE ROUTES
// =========================================================

// Create attendance
// ADMIN ONLY
router.post(
  "/",
  authMiddleware,
  createAttendance
);

// Get attendance
// ADMIN / MENTOR / STUDENT
router.get(
  "/",
  authMiddleware,
  getAttendance
);

// Attendance statistics
// ADMIN ONLY
router.get(
  "/stats",
  authMiddleware,
  getAttendanceStats
);

// Get one attendance record
router.get(
  "/:id",
  authMiddleware,
  getAttendanceById
);

// Update attendance
// ADMIN ONLY
router.put(
  "/:id",
  authMiddleware,
  updateAttendance
);

// Delete attendance
// ADMIN ONLY
router.delete(
  "/:id",
  authMiddleware,
  deleteAttendance
);

module.exports = router;