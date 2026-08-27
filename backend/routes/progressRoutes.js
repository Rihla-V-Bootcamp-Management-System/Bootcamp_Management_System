const express = require("express");

const router = express.Router();

const {
  createProgress,
  getProgress,
  getProgressById,
  updateProgress,
} = require("../controllers/progressControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ==========================================
// STUDENT ONLY — CREATE / SAVE PROGRESS
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("student"),
  createProgress
);

// ==========================================
// ALL ROLES — VIEW PROGRESS
//
// Student → own progress only
// Mentor  → assigned students only
// Admin   → any progress
//
// Controller handles the detailed checks.
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "mentor", "student"),
  getProgress
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "mentor", "student"),
  getProgressById
);

// ==========================================
// STUDENT ONLY — UPDATE OWN PROGRESS
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("student"),
  updateProgress
);

module.exports = router;