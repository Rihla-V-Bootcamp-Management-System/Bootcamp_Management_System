const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyStudents,
  getMyBatch,
} = require("../controllers/mentorController");

// Get mentor's assigned students
router.get(
  "/my-students",
  authMiddleware,
  getMyStudents
);

// Get mentor's assigned batches
router.get(
  "/my-batch",
  authMiddleware,
  getMyBatch
);

module.exports = router;