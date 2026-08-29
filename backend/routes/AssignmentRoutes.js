const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/AssignmentControllers");

// GET all assignments
router.get("/", authMiddleware, getAssignments);

// GET single assignment
router.get("/:id", authMiddleware, getAssignmentById);

// POST create assignment
router.post("/", authMiddleware, createAssignment);

// PUT update assignment
router.put("/:id", authMiddleware, updateAssignment);

// DELETE assignment
router.delete("/:id", authMiddleware, deleteAssignment);

module.exports = router;