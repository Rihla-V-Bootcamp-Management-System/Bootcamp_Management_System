const express = require("express");
const router = express.Router();

const Batch = require("../models/Batch");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ============================================================
// GET ALL BATCHES
// GET /api/batches
// ============================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const batches = await Batch.find()
        .populate(
          "mentorIds",
          "name fullName email role"
        )
        .populate(
          "studentIds",
          "name fullName email role"
        )
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: batches.length,
        batches,
      });
    } catch (error) {
      console.error("Get batches error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load batches",
        error: error.message,
      });
    }
  }
);

// ============================================================
// GET ONE BATCH
// GET /api/batches/:batchId
// ============================================================

router.get(
  "/:batchId",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { batchId } = req.params;

      const batch = await Batch.findById(batchId)
        .populate(
          "mentorIds",
          "name fullName email role"
        )
        .populate(
          "studentIds",
          "name fullName email role"
        );

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      return res.status(200).json({
        success: true,
        batch,
      });
    } catch (error) {
      console.error("Get batch error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load batch",
        error: error.message,
      });
    }
  }
);

// ============================================================
// ASSIGN MENTOR TO BATCH
// PATCH /api/batches/:batchId/assign-mentor
// ============================================================

router.patch(
  "/:batchId/assign-mentor",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { batchId } = req.params;
      const { mentorId } = req.body;

      if (!mentorId) {
        return res.status(400).json({
          success: false,
          message: "mentorId is required",
        });
      }

      const batch = await Batch.findById(batchId);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      if (!Array.isArray(batch.mentorIds)) {
        batch.mentorIds = [];
      }

      const alreadyAssigned =
        batch.mentorIds.some(
          (id) =>
            id.toString() === mentorId.toString()
        );

      if (!alreadyAssigned) {
        batch.mentorIds.push(mentorId);
        await batch.save();
      }

      const updatedBatch =
        await Batch.findById(batchId)
          .populate(
            "mentorIds",
            "name fullName email role"
          )
          .populate(
            "studentIds",
            "name fullName email role"
          );

      return res.status(200).json({
        success: true,
        message:
          "Mentor assigned to batch successfully",
        batch: updatedBatch,
      });
    } catch (error) {
      console.error(
        "Assign mentor error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to assign mentor",
        error: error.message,
      });
    }
  }
);

module.exports = router;