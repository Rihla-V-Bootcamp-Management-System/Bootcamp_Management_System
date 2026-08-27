const express = require("express");

const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/AssignmentControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// GET ALL
// ==========================================
router.get(
  "/",
  authMiddleware,
  getAssignments
);

// ==========================================
// GET ONE
// ==========================================
router.get(
  "/:id",
  authMiddleware,
  getAssignmentById
);

// ==========================================
// CREATE
// ==========================================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createAssignment
);

// ==========================================
// UPDATE
// ==========================================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateAssignment
);

// ==========================================
// DELETE
// ==========================================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteAssignment
);

module.exports = router;