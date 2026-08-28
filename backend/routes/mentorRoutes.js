const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  registerMentor,
  getStudents,
  getMentors,
  getMentorById,
  assignMentor,
  removeMentor,
  getMyMentor,
  getMyStudents,
} = require("../controllers/mentorController");

// =========================================================
// ADMIN
// =========================================================

// Register mentor
router.post(
  "/register",
  authMiddleware,
  registerMentor
);

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

// Assign mentor
router.post(
  "/assign",
  authMiddleware,
  assignMentor
);

// Remove mentor
router.delete(
  "/remove/:studentId",
  authMiddleware,
  removeMentor
);

// =========================================================
// STUDENT
// =========================================================

// IMPORTANT: These must come BEFORE /:id
router.get(
  "/my-mentor",
  authMiddleware,
  getMyMentor
);

// =========================================================
// MENTOR
// =========================================================

router.get(
  "/my-students",
  authMiddleware,
  getMyStudents
);

// =========================================================
// ADMIN - SINGLE MENTOR
// IMPORTANT: Keep this LAST
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  getMentorById
);

module.exports = router;