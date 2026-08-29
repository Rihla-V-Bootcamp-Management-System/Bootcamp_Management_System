const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createProgress,
  getProgress,
  getProgressById,
  updateProgress,
} = require("../controllers/progressControllers");

// GET /api/progress (supports ?studentId=... and ?topic=...)
router.get("/", authMiddleware, getProgress);

// GET /api/progress/:id
router.get("/:id", authMiddleware, getProgressById);

// POST /api/progress
router.post("/", authMiddleware, createProgress);

// PUT /api/progress/:id
router.put("/:id", authMiddleware, updateProgress);

module.exports = router;