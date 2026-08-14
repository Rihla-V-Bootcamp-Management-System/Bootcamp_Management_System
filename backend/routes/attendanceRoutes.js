const express = require("express");

const {
  createAttendance,
  getAttendanceByStudent,
  getAttendancePercentage,
} = require("../controllers/attendanceControllers");

const router = express.Router();

router.post("/", createAttendance);
router.get("/student/:studentId", getAttendanceByStudent);
router.get("/student/:studentId/percentage", getAttendancePercentage);

module.exports = router;