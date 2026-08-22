const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createBatch,
  assignStudentsToMentor,
  getBatches,
  getBatchById,
} = require("../controllers/batchControllers");

// ==========================================
// GET ALL BATCHES
// ==========================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "mentor", "student"),
  getBatches
);

// ==========================================
// GET BATCH BY ID
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "mentor", "student"),
  getBatchById
);

// ==========================================
// CREATE BATCH
// ==========================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createBatch
);

// ==========================================
// ASSIGN STUDENTS TO MENTOR
// ==========================================

router.post(
  "/:id/assign-mentor",
  authMiddleware,
  roleMiddleware("admin"),
  assignStudentsToMentor
);

module.exports = router;