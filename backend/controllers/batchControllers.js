const Batch = require("../models/Batch");

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

const assignStudentsToMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId, studentIds } = req.body;

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

    const batch = await Batch.findById(id);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    if (!batch.mentorIds.includes(mentorId)) {
      batch.mentorIds.push(mentorId);
    }

    studentIds.forEach((studentId) => {
      if (!batch.studentIds.includes(studentId)) {
        batch.studentIds.push(studentId);
      }
    });

    await batch.save();

    const updatedBatch = await Batch.findById(id)
      .populate("mentorIds", "name email role")
      .populate("studentIds", "name email role");

    res.json({
      message: "Students assigned to mentor successfully",
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

module.exports = {
  createBatch,
  assignStudentsToMentor,
  getBatches,
  getBatchById,
};