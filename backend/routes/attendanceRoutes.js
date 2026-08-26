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

router.post("/", authMiddleware, createAttendance);

router.get("/", authMiddleware, getAttendance);

router.get("/stats", authMiddleware, getAttendanceStats);

router.get("/:id", authMiddleware, getAttendanceById);

router.put("/:id", authMiddleware, updateAttendance);

router.delete("/:id", authMiddleware, deleteAttendance);

module.exports = router;