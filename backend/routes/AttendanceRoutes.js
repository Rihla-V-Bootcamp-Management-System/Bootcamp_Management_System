const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  checkIn,
  checkOut,
  excuseAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceSummary,
  getBatchAttendanceSummary,
} = require("../controllers/attendanceControllers");

// =========================================================
// STUDENT CHECK-IN
// POST /api/attendance/check-in
// =========================================================

router.post(
  "/check-in",
  authMiddleware,
  checkIn
);

// =========================================================
// STUDENT CHECK-OUT
// POST /api/attendance/check-out
// =========================================================

router.post(
  "/check-out",
  authMiddleware,
  checkOut
);

// =========================================================
// APPROVE / CREATE EXCUSE
// POST /api/attendance/excuse
// =========================================================

router.post(
  "/excuse",
  authMiddleware,
  excuseAttendance
);

// =========================================================
// GET ATTENDANCE
// GET /api/attendance
//
// Examples:
// /api/attendance?sessionId=123
// /api/attendance?batchId=123
// =========================================================

router.get(
  "/",
  authMiddleware,
  getAttendance
);

router.get(
  "/student",
  authMiddleware,
  getAttendance
);

// =========================================================
// GET LOGGED-IN STUDENT ATTENDANCE SUMMARY
// GET /api/attendance/my
// =========================================================

router.get(
  "/my",
  authMiddleware,
  getStudentAttendanceSummary
);

// =========================================================
// GET BATCH ATTENDANCE SUMMARY (FOR MENTORS & ADMINS)
// GET /api/attendance/batch-summary/:batchId
// GET /api/attendance/batch/:batchId
// =========================================================

router.get(
  "/batch-summary/:batchId",
  authMiddleware,
  getBatchAttendanceSummary
);

router.get(
  "/batch/:batchId",
  authMiddleware,
  getBatchAttendanceSummary
);

// =========================================================
// UPDATE ATTENDANCE
// PUT /api/attendance/:id
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  updateAttendance
);

// =========================================================
// DELETE ATTENDANCE
// DELETE /api/attendance/:id
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteAttendance
);

module.exports = router;