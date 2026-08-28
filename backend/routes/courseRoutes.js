const express = require("express");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// GET ALL COURSES
// ==========================================
router.get(
  "/",
  authMiddleware,
  getCourses
);

// ==========================================
// GET ONE COURSE
// ==========================================
router.get(
  "/:id",
  authMiddleware,
  getCourseById
);

// ==========================================
// CREATE COURSE
// ADMIN ONLY
// ==========================================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createCourse
);

// ==========================================
// UPDATE COURSE
// ADMIN ONLY
// ==========================================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateCourse
);

// ==========================================
// DELETE / DEACTIVATE COURSE
// ADMIN ONLY
// ==========================================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteCourse
);

module.exports = router;