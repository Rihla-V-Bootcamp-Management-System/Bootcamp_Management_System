const Assignment = require("../models/Assignment");
const Batch = require("../models/Batch");

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      course,
      batchId,
      assignedStudents,
      deadline,
      maxScore,
    } = req.body;

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
        message:
          "Title, description, instructions, course, batch, deadline, and maxScore are required",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const students = Array.isArray(assignedStudents)
      ? assignedStudents
      : batch.studentIds;

    const invalidStudents = students.some(
      (studentId) =>
        !batch.studentIds.some(
          (id) =>
            id.toString() ===
            studentId.toString()
        )
    );

    if (invalidStudents) {
      return res.status(400).json({
        message:
          "One or more students are not in this batch",
      });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      course: course.trim(),
      batchId,
      assignedStudents: students,
      deadline,
      maxScore,
      createdBy: req.user._id,
    });

    const result = await Assignment.findById(
      assignment._id
    )
      .populate("batchId", "name")
      .populate(
        "assignedStudents",
        "name email gender"
      )
      .populate(
        "createdBy",
        "name email role"
      );

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: result,
    });
  } catch (error) {
    console.error(
      "Create assignment error:",
      error
    );

    res.status(500).json({
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};

const getAssignments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "student") {
      filter = {
        assignedStudents: req.user._id,
      };
    }

    const assignments = await Assignment.find(filter)
      .populate("batchId", "name")
      .populate(
        "assignedStudents",
        "name email gender"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({ createdAt: -1 });

    res.json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get assignments error:",
      error
    );

    res.status(500).json({
      message: "Failed to load assignments",
      error: error.message,
    });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(req.params.id)
        .populate("batchId", "name")
        .populate(
          "assignedStudents",
          "name email gender"
        )
        .populate(
          "createdBy",
          "name email role"
        );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    if (
      req.user.role === "student" &&
      !assignment.assignedStudents.some(
        (student) =>
          student._id.toString() ===
          req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        message:
          "You are not assigned to this assignment",
      });
    }

    res.json({
      assignment,
    });
  } catch (error) {
    console.error(
      "Get assignment error:",
      error
    );

    res.status(500).json({
      message: "Failed to load assignment",
      error: error.message,
    });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const {
      title,
      description,
      instructions,
      course,
      batchId,
      assignedStudents,
      deadline,
      maxScore,
    } = req.body;

    if (title !== undefined) {
      assignment.title = title.trim();
    }

    if (description !== undefined) {
      assignment.description =
        description.trim();
    }

    if (instructions !== undefined) {
      assignment.instructions =
        instructions.trim();
    }

    if (course !== undefined) {
      assignment.course = course.trim();
    }

    if (batchId !== undefined) {
      const batch =
        await Batch.findById(batchId);

      if (!batch) {
        return res.status(404).json({
          message: "Batch not found",
        });
      }

      assignment.batchId = batchId;
    }

    if (assignedStudents !== undefined) {
      if (!Array.isArray(assignedStudents)) {
        return res.status(400).json({
          message:
            "assignedStudents must be an array",
        });
      }

      const batch = await Batch.findById(
        assignment.batchId
      );

      const invalidStudents =
        assignedStudents.some(
          (studentId) =>
            !batch.studentIds.some(
              (id) =>
                id.toString() ===
                studentId.toString()
            )
        );

      if (invalidStudents) {
        return res.status(400).json({
          message:
            "One or more students are not in this batch",
        });
      }

      assignment.assignedStudents =
        assignedStudents;
    }

    if (deadline !== undefined) {
      assignment.deadline = deadline;
    }

    if (maxScore !== undefined) {
      assignment.maxScore = maxScore;
    }

    await assignment.save();

    res.json({
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error) {
    console.error(
      "Update assignment error:",
      error
    );

    res.status(500).json({
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment =
      await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    await assignment.deleteOne();

    res.json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete assignment error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete assignment",
      error: error.message,
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