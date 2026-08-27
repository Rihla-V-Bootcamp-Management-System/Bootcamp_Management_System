const express = require("express");
const router = express.Router();

const Batch = require("../models/Batch");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createBatch,
  assignStudentsToMentor,
  getBatches,
  getBatchById,
} = require("../controllers/batchControllers");

// ==========================================
// PUBLIC BATCHES FOR REGISTRATION
// ==========================================
// Students/applicants need to select a batch
// before submitting the registration.
router.get("/public", async (req, res) => {
  try {
    const batches = await Batch.find()
      .select("_id name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error("GET PUBLIC BATCHES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get available batches",
      error: error.message,
    });
  }
});

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