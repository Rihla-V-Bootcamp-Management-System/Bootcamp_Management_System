const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const {
  getMyStudents,
} = require(
  "../controllers/BatchControllers"
);

// ==========================================
// GET MENTOR'S ASSIGNED STUDENTS
// ==========================================

router.get(
  "/my-students",
  authMiddleware,
  getMyStudents
);

module.exports = router;