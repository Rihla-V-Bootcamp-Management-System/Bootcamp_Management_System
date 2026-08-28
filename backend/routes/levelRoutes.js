const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createLevel,
  getLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
} = require("../controllers/levelController");

// =========================================================
// GET LEVELS
// Anyone authenticated can view
// =========================================================

router.get(
  "/",
  authMiddleware,
  getLevels
);

// =========================================================
// GET SINGLE LEVEL
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  getLevelById
);

// =========================================================
// CREATE LEVEL
// Admin only
// =========================================================

router.post(
  "/",
  authMiddleware,
  createLevel
);

// =========================================================
// UPDATE LEVEL
// Admin only
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  updateLevel
);

// =========================================================
// DELETE LEVEL
// Admin only
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteLevel
);

module.exports = router;