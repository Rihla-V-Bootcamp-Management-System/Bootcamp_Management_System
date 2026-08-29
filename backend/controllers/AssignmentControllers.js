const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Batch = require("../models/Batch");
const User = require("../models/User");

// ==========================================
// CREATE ASSIGNMENT
// ==========================================
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      course,
      topics,
      batchId,
      assignedStudents,
      deadline,
      maxScore,
    } = req.body;

    // ------------------------------------------
    // REQUIRED FIELDS
    // ------------------------------------------
    if (
      !title ||
      !description ||
      !instructions ||
      !course ||
      !batchId ||
      !deadline ||
      maxScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, instructions, course, batch, deadline and maximum score are required.",
      });
    }

    // ------------------------------------------
    // CHECK COURSE
    // ------------------------------------------
    const existingCourse = await Course.findOne({
      _id: course,
      isActive: true,
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Selected course not found.",
      });
    }

    // ------------------------------------------
    // CHECK BATCH
    // ------------------------------------------
    const existingBatch = await Batch.findById(batchId);

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Selected batch not found.",
      });
    }

    // ------------------------------------------
    // CREATE
    // ------------------------------------------
    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      course,
      topics: Array.isArray(topics) ? topics : [],
      batchId,
      assignedStudents: Array.isArray(assignedStudents)
        ? assignedStudents
        : [],
      deadline,
      maxScore,
      createdBy: req.user._id || req.user.id,
    });

    // ------------------------------------------
    // RETURN POPULATED DATA
    // ------------------------------------------
    const populatedAssignment =
      await Assignment.findById(assignment._id)
        .populate("course", "name description")
        .populate("batchId", "name")
        .populate("createdBy", "name email")
        .populate(
          "assignedStudents",
          "name email"
        );

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL ASSIGNMENTS
// ==========================================
const getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.batchId) {
      filter.batchId = req.query.batchId;
    }
    if (req.query.course) {
      filter.course = req.query.course;
    }

    const assignments = await Assignment.find(filter)
      .populate("course", "name description")
      .populate("batchId", "name")
      .populate("createdBy", "name email")
      .populate(
        "assignedStudents",
        "name email"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      assignments,
      data: assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ONE ASSIGNMENT
// ==========================================
const getAssignmentById = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(req.params.id)
        .populate("course", "name description")
        .populate("batchId", "name")
        .populate("createdBy", "name email")
        .populate(
          "assignedStudents",
          "name email"
        );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE ASSIGNMENT
// ==========================================
const updateAssignment = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const {
      title,
      description,
      instructions,
      course,
      topics,
      batchId,
      assignedStudents,
      deadline,
      maxScore,
    } = req.body;

    if (title !== undefined) {
      assignment.title = title.trim();
    }

    if (description !== undefined) {
      assignment.description = description.trim();
    }

    if (instructions !== undefined) {
      assignment.instructions =
        instructions.trim();
    }

    if (course !== undefined) {
      const existingCourse = await Course.findOne({
        _id: course,
        isActive: true,
      });

      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: "Selected course not found.",
        });
      }

      assignment.course = course;
    }

    if (topics !== undefined) {
      assignment.topics = Array.isArray(topics)
        ? topics
        : [];
    }

    if (batchId !== undefined) {
      const existingBatch =
        await Batch.findById(batchId);

      if (!existingBatch) {
        return res.status(404).json({
          success: false,
          message: "Selected batch not found.",
        });
      }

      assignment.batchId = batchId;
    }

    if (assignedStudents !== undefined) {
      assignment.assignedStudents =
        Array.isArray(assignedStudents)
          ? assignedStudents
          : [];
    }

    if (deadline !== undefined) {
      assignment.deadline = deadline;
    }

    if (maxScore !== undefined) {
      assignment.maxScore = maxScore;
    }

    await assignment.save();

    const updatedAssignment =
      await Assignment.findById(assignment._id)
        .populate("course", "name description")
        .populate("batchId", "name")
        .populate("createdBy", "name email")
        .populate(
          "assignedStudents",
          "name email"
        );

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE ASSIGNMENT
// ==========================================
const deleteAssignment = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    await assignment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};