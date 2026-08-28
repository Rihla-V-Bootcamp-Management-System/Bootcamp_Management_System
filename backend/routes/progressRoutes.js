const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getStudents,
  getMentors,
  assignMentor,
  removeMentor,
  getMyMentor,
  getMyStudents,
} = require("../controllers/mentorController");

// =========================================================
// ADMIN
// =========================================================

// Get all students
router.get(
  "/students",
  authMiddleware,
  getStudents
);

// Get all mentors
router.get(
  "/mentors",
  authMiddleware,
  getMentors
);

// Assign mentor to student
router.post(
  "/assign",
  authMiddleware,
  assignMentor
);

// Remove mentor from student
router.delete(
  "/remove/:studentId",
  authMiddleware,
  removeMentor
);

// =========================================================
// STUDENT
// =========================================================

// Get currently logged-in student's mentor
router.get(
  "/my-mentor",
  authMiddleware,
  getMyMentor
);

// =========================================================
// MENTOR
// =========================================================

// Get students assigned to currently logged-in mentor
router.get(
  "/my-students",
  authMiddleware,
  getMyStudents
);

module.exports = router;