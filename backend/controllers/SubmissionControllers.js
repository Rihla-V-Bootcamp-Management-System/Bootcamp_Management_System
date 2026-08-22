const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Batch = require("../models/Batch");

const createSubmission = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { assignmentId } = req.params;
    const {
      githubUrl,
      liveDemoUrl,
      notes,
    } = req.body;

    if (!githubUrl) {
      return res.status(400).json({
        message: "GitHub URL is required",
      });
    }

    try {
      new URL(githubUrl);
    } catch {
      return res.status(400).json({
        message: "Invalid GitHub URL",
      });
    }

    if (liveDemoUrl) {
      try {
        new URL(liveDemoUrl);
      } catch {
        return res.status(400).json({
          message: "Invalid live demo URL",
        });
      }
    }

    const assignment =
      await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const assigned =
      assignment.assignedStudents.some(
        (id) =>
          id.toString() ===
          studentId.toString()
      );

    if (!assigned) {
      return res.status(403).json({
        message:
          "You are not assigned to this assignment",
      });
    }

    if (
      new Date() >
      new Date(assignment.deadline)
    ) {
      return res.status(400).json({
        message: "Assignment deadline has passed",
      });
    }

    const existing =
      await Submission.findOne({
        assignmentId,
        studentId,
      });

    if (existing) {
      return res.status(409).json({
        message:
          "You have already submitted this assignment",
      });
    }

    const submission =
      await Submission.create({
        assignmentId,
        studentId,
        githubUrl: githubUrl.trim(),
        liveDemoUrl: liveDemoUrl
          ? liveDemoUrl.trim()
          : "",
        notes: notes ? notes.trim() : "",
      });

    const result =
      await Submission.findById(
        submission._id
      )
        .populate(
          "assignmentId",
          "title description course deadline"
        )
        .populate(
          "studentId",
          "name email gender"
        );

    res.status(201).json({
      message:
        "Assignment submitted successfully",
      submission: result,
    });
  } catch (error) {
    console.error(
      "Create submission error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to submit assignment",
      error: error.message,
    });
  }
};
const getMySubmissions = async (
  req,
  res
) => {
  try {
    const submissions =
      await Submission.find({
        studentId: req.user._id,
      })
        .populate(
          "assignmentId",
          "title description course deadline"
        )
        .populate(
          "gradedBy",
          "name email role"
        )
        .sort({
          submittedAt: -1,
        });

    res.json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load submissions",
      error: error.message,
    });
  }
};

const getMentorSubmissions = async (
  req,
  res
) => {
  try {
    const mentorId = req.user._id;

    const batches = await Batch.find({
      mentorIds: mentorId,
    }).select("_id");

    const batchIds = batches.map(
      (batch) => batch._id
    );

    const assignments =
      await Assignment.find({
        batchId: {
          $in: batchIds,
        },
      }).select("_id");

    const assignmentIds =
      assignments.map(
        (assignment) => assignment._id
      );

    const submissions =
      await Submission.find({
        assignmentId: {
          $in: assignmentIds,
        },
      })
        .populate(
          "studentId",
          "name email gender"
        )
        .populate(
          "assignmentId",
          "title description course deadline"
        )
        .populate(
          "gradedBy",
          "name email role"
        )
        .sort({
          submittedAt: -1,
        });

    res.json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load mentor submissions",
      error: error.message,
    });
  }
};

const getAssignmentSubmissions = async (
  req,
  res
) => {
  try {
    const assignment =
      await Assignment.findById(
        req.params.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    if (req.user.role === "mentor") {
      const batch = await Batch.findById(
        assignment.batchId
      );

      if (!batch) {
        return res.status(404).json({
          message: "Batch not found",
        });
      }

      const isAssignedMentor =
        batch.mentorIds.some(
          (id) =>
            id.toString() ===
            req.user._id.toString()
        );

      if (!isAssignedMentor) {
        return res.status(403).json({
          message:
            "You are not the assigned mentor",
        });
      }
    }

    const submissions =
      await Submission.find({
        assignmentId:
          req.params.assignmentId,
      })
        .populate(
          "studentId",
          "name email gender"
        )
        .populate(
          "assignmentId",
          "title description course deadline"
        )
        .populate(
          "gradedBy",
          "name email role"
        )
        .sort({
          submittedAt: -1,
        });

    res.json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load assignment submissions",
      error: error.message,
    });
  }
};

const gradeSubmission = async (
  req,
  res
) => {
  try {
    const mentorId = req.user._id;
    const { grade, feedback } = req.body;

    if (
      grade === undefined ||
      grade === null
    ) {
      return res.status(400).json({
        message: "Grade is required",
      });
    }

    const numericGrade = Number(grade);

    if (
      Number.isNaN(numericGrade) ||
      numericGrade < 0
    ) {
      return res.status(400).json({
        message: "Invalid grade",
      });
    }

    const submission =
      await Submission.findById(
        req.params.id
      );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const assignment =
      await Assignment.findById(
        submission.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const batch = await Batch.findById(
      assignment.batchId
    );

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const isAssignedMentor =
      batch.mentorIds.some(
        (id) =>
          id.toString() ===
          mentorId.toString()
      );

    if (!isAssignedMentor) {
      return res.status(403).json({
        message:
          "You can only grade students assigned to you",
      });
    }

    submission.grade = numericGrade;
    submission.feedback =
      feedback ? feedback.trim() : "";
    submission.gradedBy = mentorId;
    submission.gradedAt = new Date();
    submission.status = "Graded";

    await submission.save();

    const result =
      await Submission.findById(
        submission._id
      )
        .populate(
          "studentId",
          "name email gender"
        )
        .populate(
          "assignmentId",
          "title description course deadline"
        )
        .populate(
          "gradedBy",
          "name email role"
        );

    res.json({
      message:
        "Submission graded successfully",
      submission: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to grade submission",
      error: error.message,
    });
  }
};

const requestResubmission = async (
  req,
  res
) => {
  try {
    const mentorId = req.user._id;

    const submission =
      await Submission.findById(
        req.params.id
      );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const assignment =
      await Assignment.findById(
        submission.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    const batch = await Batch.findById(
      assignment.batchId
    );

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const isAssignedMentor =
      batch.mentorIds.some(
        (id) =>
          id.toString() ===
          mentorId.toString()
      );

    if (!isAssignedMentor) {
      return res.status(403).json({
        message:
          "You are not the assigned mentor",
      });
    }

    submission.status =
      "Needs Resubmission";

    submission.grade = null;
    submission.gradedBy = null;
    submission.gradedAt = null;

    if (req.body.feedback !== undefined) {
      submission.feedback =
        req.body.feedback.trim();
    }

    await submission.save();

    res.json({
      message:
        "Resubmission requested successfully",
      submission,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to request resubmission",
      error: error.message,
    });
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getMentorSubmissions,
  getAssignmentSubmissions,
  gradeSubmission,
  requestResubmission,
};