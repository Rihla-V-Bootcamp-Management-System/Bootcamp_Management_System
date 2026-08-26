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

// ADMIN

router.post(
  "/register",
  authMiddleware,
  registerMentor
);

router.get(
  "/students",
  authMiddleware,
  getStudents
);

router.get(
  "/mentors",
  authMiddleware,
  getMentors
);

router.get(
  "/:id",
  authMiddleware,
  getMentorById
);

router.post(
  "/assign",
  authMiddleware,
  assignMentor
);

router.delete(
  "/remove/:studentId",
  authMiddleware,
  removeMentor
);

// STUDENT

router.get(
  "/my-mentor",
  authMiddleware,
  getMyMentor
);

// MENTOR

router.get(
  "/my-students",
  authMiddleware,
  getMyStudents
);

module.exports = router;