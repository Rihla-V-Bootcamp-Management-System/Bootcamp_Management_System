const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createBatch,
  assignStudentsToMentor,
  getBatches,
  getBatchById,
  getMentorBatches,
  updateBatch,
  deleteBatch,
} = require("../controllers/batchControllers");

// =========================================================
// GET ALL BATCHES
// Supports: /api/batches?page=1&limit=10
// =========================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "mentor", "student"),
  getBatches
);

// =========================================================
// GET MENTOR BATCHES
// GET /api/batches/mentor
// =========================================================

router.get(
  "/mentor",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "mentor"),
  getMentorBatches
);

// =========================================================
// GET BATCH BY ID
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "mentor", "student"),
  getBatchById
);


// =========================================================
// CREATE BATCH (Superadmin & Admin)
// =========================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
  createBatch
);

// =========================================================
// UPDATE BATCH (Superadmin & Admin)
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
  updateBatch
);

// =========================================================
// DELETE BATCH (Superadmin & Admin)
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
  deleteBatch
);

// =========================================================
// ASSIGN STUDENTS TO MENTOR (Superadmin & Admin)
// =========================================================

router.post(
  "/:id/assign-mentor",
  authMiddleware,
  roleMiddleware("superadmin", "admin"),
  assignStudentsToMentor
);

module.exports = router;