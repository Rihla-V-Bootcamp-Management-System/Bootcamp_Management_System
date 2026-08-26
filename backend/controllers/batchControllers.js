const Batch = require("../models/Batch");
const User = require("../models/User");

// =========================================================
// GET ALL BATCHES
// =========================================================

const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("mentorIds", "name email role")
      .populate("studentIds", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      count: batches.length,
      batches,
    });
  } catch (error) {
    console.error("Get batches error:", error);

    res.status(500).json({
      message: "Failed to load batches",
      error: error.message,
    });
  }
};

// =========================================================
// GET BATCH BY ID
// =========================================================

const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("mentorIds", "name email role")
      .populate("studentIds", "name email role");

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    res.json({
      batch,
    });
  } catch (error) {
    console.error("Get batch error:", error);

    res.status(500).json({
      message: "Failed to load batch",
      error: error.message,
    });
  }
};

// =========================================================
// CREATE BATCH
// =========================================================

const createBatch = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Batch name is required",
      });
    }

    const batch = await Batch.create({
      name: name.trim(),
    });

    res.status(201).json({
      message: "Batch created successfully",
      batch,
    });
  } catch (error) {
    console.error("Create batch error:", error);

    res.status(500).json({
      message: "Failed to create batch",
      error: error.message,
    });
  }
};

// =========================================================
// ASSIGN STUDENTS TO MENTOR + BATCH
// POST /api/batches/:id/assign-mentor
// =========================================================

const assignStudentsToMentor = async (req, res) => {
  try {
    console.log("\n======================================");
    console.log("ASSIGN STUDENTS TO BATCH");
    console.log("======================================");

    const { id } = req.params;
    const { mentorId, studentIds } = req.body;

    console.log("Batch ID:", id);
    console.log("Mentor ID:", mentorId);
    console.log("Student IDs:", studentIds);

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!mentorId) {
      return res.status(400).json({
        message: "mentorId is required",
      });
    }

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        message: "studentIds must be an array",
      });
    }

    // =====================================================
    // FIND BATCH
    // =====================================================

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    // =====================================================
    // ADD MENTOR TO BATCH
    // =====================================================

    if (!batch.mentorIds.includes(mentorId)) {
      batch.mentorIds.push(mentorId);
    }

    // =====================================================
    // ADD STUDENTS TO BATCH
    // =====================================================

    studentIds.forEach((studentId) => {
      if (!batch.studentIds.includes(studentId)) {
        batch.studentIds.push(studentId);
      }
    });

    await batch.save();

    // =====================================================
    // IMPORTANT:
    // ALSO SET User.batchId
    // =====================================================

    if (studentIds.length > 0) {
      await User.updateMany(
        {
          _id: { $in: studentIds },
          role: "student",
        },
        {
          $set: {
            batchId: batch._id,
          },
        },
        {
          runValidators: false,
        }
      );
    }

    // =====================================================
    // GET UPDATED BATCH
    // =====================================================

    const updatedBatch = await Batch.findById(id)
      .populate("mentorIds", "name email role")
      .populate("studentIds", "name email role");

    // =====================================================
    // SUCCESS
    // =====================================================

    console.log("======================================");
    console.log("STUDENTS SUCCESSFULLY ASSIGNED");
    console.log("Batch:", updatedBatch.name);
    console.log("Students:", studentIds.length);
    console.log("======================================");

    res.json({
      message: "Students assigned to mentor and batch successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("Assign students error:", error);

    res.status(500).json({
      message: "Failed to assign students",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  createBatch,
  assignStudentsToMentor,
  getBatches,
  getBatchById,
};