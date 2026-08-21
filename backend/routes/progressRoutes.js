const express = require("express");

const router = express.Router();

const {
  createProgress,
  getProgress,
  getProgressById,
  updateProgress,
} = require("../controllers/progressControllers");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createProgress);

router.get("/", authMiddleware, getProgress);

router.get("/:id", authMiddleware, getProgressById);

router.put("/:id", authMiddleware, updateProgress);

module.exports = router;