const Batch = require("../models/Batch");
const User = require("../models/User");

// ======================================================
// CREATE BATCH
// ======================================================

const createBatch = async (req, res) => {
  try {
    const {
      name,
      mentorIds = [],
      studentIds = [],
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Batch name is required",
      });
    }

    // Validate mentors
    if (!Array.isArray(mentorIds)) {
      return res.status(400).json({
        success: false,
        message: "mentorIds must be an array",
      });
    }

    // Validate students
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: "studentIds must be an array",
      });
    }

    // Check mentors exist
    if (mentorIds.length > 0) {
      const mentors = await User.find({
        _id: {
          $in: mentorIds,
        },
        role: "mentor",
      }).select("_id");

      if (mentors.length !== mentorIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more mentor IDs are invalid",
        });
      }
    }

    const batch = await Batch.create({
      name: name.trim(),
      mentorIds,
      studentIds,
    });

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch,
    });
  } catch (error) {
    console.error("Create batch error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A batch with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create batch",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL BATCHES
// ======================================================

const getBatches = async (req, res) => {
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
      .sort({
        createdAt: -1,
      });

    return res.json({
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
};

// ======================================================
// GET ONE BATCH
// ======================================================

const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id)
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

    return res.json({
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
};

// ======================================================
// UPDATE BATCH
// ======================================================

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      mentorIds,
      studentIds,
    } = req.body;

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (name !== undefined) {
      batch.name = name.trim();
    }

    if (mentorIds !== undefined) {
      if (!Array.isArray(mentorIds)) {
        return res.status(400).json({
          success: false,
          message: "mentorIds must be an array",
        });
      }

      batch.mentorIds = mentorIds;
    }

    if (studentIds !== undefined) {
      if (!Array.isArray(studentIds)) {
        return res.status(400).json({
          success: false,
          message: "studentIds must be an array",
        });
      }

      batch.studentIds = studentIds;
    }

    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate(
        "mentorIds",
        "name fullName email role"
      )
      .populate(
        "studentIds",
        "name fullName email role"
      );

    return res.json({
      success: true,
      message: "Batch updated successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error("Update batch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update batch",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN MENTORS TO BATCH
// ======================================================

const assignMentorsToBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorIds } = req.body;

    if (!Array.isArray(mentorIds)) {
      return res.status(400).json({
        success: false,
        message: "mentorIds must be an array",
      });
    }

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Make sure all selected users are mentors
    const mentors = await User.find({
      _id: {
        $in: mentorIds,
      },
      role: "mentor",
    }).select("_id");

    if (mentors.length !== mentorIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected users are not mentors",
      });
    }

    batch.mentorIds = mentorIds;

    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate(
        "mentorIds",
        "name fullName email role"
      )
      .populate(
        "studentIds",
        "name fullName email role"
      );

    return res.json({
      success: true,
      message: "Mentors assigned successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error(
      "Assign mentors to batch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to assign mentors",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN STUDENTS TO BATCH
// ======================================================

const assignStudentsToBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: "studentIds must be an array",
      });
    }

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    batch.studentIds = studentIds;

    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate(
        "mentorIds",
        "name fullName email role"
      )
      .populate(
        "studentIds",
        "name fullName email role"
      );

    return res.json({
      success: true,
      message: "Students assigned successfully",
      batch: updatedBatch,
    });
  } catch (error) {
    console.error(
      "Assign students to batch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to assign students",
      error: error.message,
    });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  assignMentorsToBatch,
  assignStudentsToBatch,
};