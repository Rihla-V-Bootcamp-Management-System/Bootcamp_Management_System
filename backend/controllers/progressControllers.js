const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const Batch = require("../models/Batch");

// =========================================================
// HELPERS
// =========================================================

const getRole = (user) => {
  return String(user?.role || "").trim().toLowerCase();
};

const isMentorAssigned = (batch, mentorId) => {
  return batch.mentorIds.some(
    (id) => id.toString() === mentorId.toString()
  );
};

const isStudentInBatch = (batch, studentId) => {
  return batch.studentIds.some(
    (id) => id.toString() === studentId.toString()
  );
};

// =========================================================
// CREATE / SAVE PROGRESS
// STUDENT ONLY
// =========================================================

const createProgress = async (req, res) => {
  try {
    const role = getRole(req.user);
    let { studentId, topic, status, notes } = req.body;

    if (role === "student") {
      studentId = req.user._id;
    } else if (role === "mentor" || role === "admin" || role === "superadmin") {
      if (!studentId) {
        return res.status(400).json({
          message: "studentId is required when mentor or admin is updating progress",
        });
      }
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!topic || !status) {
      return res.status(400).json({
        message: "topic and status are required",
      });
    }

    const progress = await Progress.findOneAndUpdate(
      {
        studentId,
        topic,
      },
      {
        $set: {
          status,
          notes: notes || "",
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .populate("studentId", "name email")
      .populate("updatedBy", "name");

    return res.status(200).json({
      message: "Progress saved successfully",
      progress,
    });
  } catch (error) {
    console.error("Create progress error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================================
// GET PROGRESS
// ADMIN -> all / specific student
// MENTOR -> assigned students
// STUDENT -> own progress
// =========================================================

const getProgress = async (req, res) => {
  try {
    const role = getRole(req.user);

    const { studentId, topic } = req.query;

    const filter = {};

    // =====================================================
    // STUDENT
    // =====================================================

    if (role === "student") {
      filter.studentId = req.user._id;

      if (
        studentId &&
        studentId !== req.user._id.toString()
      ) {
        return res.status(403).json({
          message: "You can only view your own progress",
        });
      }
    }

    // =====================================================
    // MENTOR
    // =====================================================

    else if (role === "mentor") {
      if (!studentId) {
        return res.status(400).json({
          message:
            "studentId is required when viewing a student's progress",
        });
      }

      filter.studentId = studentId;
    }

    // =====================================================
    // ADMIN / SUPERADMIN
    // =====================================================

    else if (role === "admin" || role === "superadmin") {
      if (studentId) {
        filter.studentId = studentId;
      }
    }

    // =====================================================
    // UNKNOWN ROLE
    // =====================================================

    else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // =====================================================
    // TOPIC FILTER
    // =====================================================

    if (topic) {
      filter.topic = topic;
    }

    const progress = await Progress.find(filter)
      .populate("studentId", "name email")
      .populate("updatedBy", "name")
      .sort({ topic: 1 });

    return res.status(200).json({
      total: progress.length,
      progress,
    });
  } catch (error) {
    console.error("Get progress error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================================
// GET PROGRESS BY ID
// =========================================================

const getProgressById = async (req, res) => {
  try {
    const role = getRole(req.user);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid progress ID",
      });
    }

    const progress = await Progress.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("updatedBy", "name");

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    // =====================================================
    // STUDENT
    // =====================================================

    if (role === "student") {
      if (
        progress.studentId._id.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You can only view your own progress",
        });
      }
    }

    // =====================================================
    // MENTOR
    // =====================================================

    else if (role === "mentor") {
      const batches = await Batch.find({
        mentorIds: req.user._id,
        studentIds: progress.studentId._id,
      });

      if (batches.length === 0) {
        return res.status(403).json({
          message:
            "This student is not assigned to your batch",
        });
      }
    }

    // =====================================================
    // ADMIN
    // =====================================================

    else if (role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    return res.status(200).json({
      progress,
    });
  } catch (error) {
    console.error("Get progress by ID error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================================
// UPDATE PROGRESS
// STUDENT ONLY
// =========================================================

const updateProgress = async (req, res) => {
  try {
    const role = getRole(req.user);

    if (role !== "student") {
      return res.status(403).json({
        message: "Only students can update progress",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid progress ID",
      });
    }

    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    if (
      progress.studentId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only update your own progress",
      });
    }

    const { status, notes } = req.body;

    if (status !== undefined) {
      progress.status = status;
    }

    if (notes !== undefined) {
      progress.notes = notes;
    }

    progress.updatedBy = req.user._id;

    await progress.save();

    const updatedProgress =
      await Progress.findById(progress._id)
        .populate("studentId", "name email")
        .populate("updatedBy", "name");

    return res.status(200).json({
      message: "Progress updated successfully",
      progress: updatedProgress,
    });
  } catch (error) {
    console.error("Update progress error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProgress,
  getProgress,
  getProgressById,
  updateProgress,
};