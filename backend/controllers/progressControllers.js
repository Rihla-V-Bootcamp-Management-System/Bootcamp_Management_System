const Progress = require("../models/Progress");
const Batch = require("../models/Batch");

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

const createProgress = async (req, res) => {
  try {
    let targetStudentId;

    if (req.user.role === "STUDENT") {
      targetStudentId = req.user.id;
    } else if (req.user.role === "MENTOR") {
      targetStudentId = req.body.studentId;

      if (!targetStudentId) {
        return res.status(400).json({
          message: "studentId is required",
        });
      }

      const batches = await Batch.find({
        mentorIds: req.user.id,
        studentIds: targetStudentId,
      });

      if (batches.length === 0) {
        return res.status(403).json({
          message: "Student is not assigned to your batch",
        });
      }
    } else if (req.user.role === "ADMIN") {
      targetStudentId = req.body.studentId;

      if (!targetStudentId) {
        return res.status(400).json({
          message: "studentId is required",
        });
      }
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const { topic, status, notes } = req.body;

    if (!topic || !status) {
      return res.status(400).json({
        message: "topic and status are required",
      });
    }

    const progress = await Progress.findOneAndUpdate(
      {
        studentId: targetStudentId,
        topic,
      },
      {
        status,
        notes,
        updatedBy: req.user.id,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Progress saved successfully",
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getProgress = async (req, res) => {
  try {
    const { studentId, topic } = req.query;

    const filter = {};

    if (req.user.role === "STUDENT") {
      filter.studentId = req.user.id;

      if (studentId && studentId !== req.user.id.toString()) {
        return res.status(403).json({
          message: "You can only view your own progress",
        });
      }
    } else if (req.user.role === "MENTOR") {
      if (!studentId) {
        return res.status(400).json({
          message: "studentId is required",
        });
      }

      const batches = await Batch.find({
        mentorIds: req.user.id,
        studentIds: studentId,
      });

      if (batches.length === 0) {
        return res.status(403).json({
          message: "Student is not assigned to your batch",
        });
      }

      filter.studentId = studentId;
    } else if (req.user.role === "ADMIN") {
      if (studentId) {
        filter.studentId = studentId;
      }
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

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
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("updatedBy", "name");

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    if (req.user.role === "STUDENT") {
      if (
        progress.studentId._id.toString() !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          message: "You can only view your own progress",
        });
      }
    } else if (req.user.role === "MENTOR") {
      const batches = await Batch.find({
        mentorIds: req.user.id,
        studentIds: progress.studentId._id,
      });

      if (batches.length === 0) {
        return res.status(403).json({
          message: "Student is not assigned to your batch",
        });
      }
    } else if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    return res.status(200).json({
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        message: "Progress not found",
      });
    }

    if (req.user.role === "STUDENT") {
      if (progress.studentId.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          message: "You can only update your own progress",
        });
      }
    } else if (req.user.role === "MENTOR") {
      const batches = await Batch.find({
        mentorIds: req.user.id,
        studentIds: progress.studentId,
      });

      if (batches.length === 0) {
        return res.status(403).json({
          message: "Student is not assigned to your batch",
        });
      }
    } else if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const { status, notes } = req.body;

    if (status !== undefined) {
      progress.status = status;
    }

    if (notes !== undefined) {
      progress.notes = notes;
    }

    progress.updatedBy = req.user.id;

    await progress.save();

    return res.status(200).json({
      message: "Progress updated successfully",
      progress,
    });
  } catch (error) {
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