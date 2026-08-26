const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createBatch,
  assignStudentsToMentor,
  getBatches,
  getBatchById,
  updateBatch,
} = require("../controllers/batchControllers");

// =========================================================
// GET ALL BATCHES
// Supports:
// /api/batches?page=1&limit=10
// =========================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "superadmin",
    "admin",
    "mentor",
    "student"
  ),
  getBatches
);

// =========================================================
// GET BATCH BY ID
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "superadmin",
    "admin",
    "mentor",
    "student"
  ),
  getBatchById
);

// =========================================================
// CREATE BATCH
// =========================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("superadmin"),
  createBatch
);

// =========================================================
// UPDATE BATCH
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin"),
  updateBatch
);

// =========================================================
// ASSIGN STUDENTS TO MENTOR
// =========================================================

router.post(
  "/:id/assign-mentor",
  authMiddleware,
  roleMiddleware("superadmin"),
  assignStudentsToMentor
);

module.exports = router;