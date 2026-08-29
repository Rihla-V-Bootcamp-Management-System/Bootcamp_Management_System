const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Batch = require("../models/Batch");

// ======================================================
// HELPERS
// ======================================================

const normalizeRole = (role) => {
  return String(role || "").trim().toLowerCase();
};

const isObjectIdEqual = (a, b) => {
  if (!a || !b) return false;
  return a.toString() === b.toString();
};

// ======================================================
// VERIFY MENTOR ASSIGNMENT ACCESS
// ======================================================

const verifyMentorAssignmentAccess = async (
  mentorId,
  assignment
) => {
  try {
    if (!mentorId || !assignment) {
      return {
        allowed: false,
        status: 403,
        message: "Authorization failed",
      };
    }

    // Assignment must have a batch
    if (!assignment.batchId) {
      return {
        allowed: false,
        status: 403,
        message:
          "This assignment is not connected to a batch",
      };
    }

    // Find batch
    const batch = await Batch.findById(
      assignment.batchId
    ).select("_id name mentorIds studentIds");

    if (!batch) {
      return {
        allowed: false,
        status: 404,
        message: "Batch not found",
      };
    }

    // Make sure mentorIds is an array
    const mentorIds = Array.isArray(batch.mentorIds)
      ? batch.mentorIds
      : [];

    // Debug information
    console.log(
      "=========================================="
    );
    console.log(
      "MENTOR ASSIGNMENT AUTHORIZATION"
    );
    console.log(
      "=========================================="
    );

    console.log(
      "Logged-in mentor ID:",
      mentorId.toString()
    );

    console.log(
      "Assignment ID:",
      assignment._id.toString()
    );

    console.log(
      "Assignment batch ID:",
      assignment.batchId.toString()
    );

    console.log(
      "Batch ID:",
      batch._id.toString()
    );

    console.log(
      "Batch name:",
      batch.name
    );

    console.log(
      "Batch mentor IDs:",
      mentorIds.map((id) => id.toString())
    );

    // Check mentor
    const isAssignedMentor = mentorIds.some(
      (id) =>
        id &&
        id.toString() === mentorId.toString()
    );

    console.log(
      "Is assigned mentor:",
      isAssignedMentor
    );

    console.log(
      "=========================================="
    );

    if (!isAssignedMentor) {
      return {
        allowed: false,
        status: 403,
        message:
          "You are not the assigned mentor for this batch",
      };
    }

    return {
      allowed: true,
      batch,
    };
  } catch (error) {
    console.error(
      "Mentor assignment access error:",
      error
    );

    return {
      allowed: false,
      status: 500,
      message:
        "Failed to verify mentor assignment access",
    };
  }
};

// ======================================================
// STUDENT
// CREATE / RESUBMIT SUBMISSION
// ======================================================

const createSubmission = async (req, res) => {
  try {
    const studentId = req.user._id;

    const { assignmentId } = req.params;

    const {
      questionId,
      submissionData,
    } = req.body;

    if (
      submissionData === undefined ||
      submissionData === null ||
      typeof submissionData !== "object" ||
      Array.isArray(submissionData)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Submission data is required",
      });
    }

    const assignment =
      await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check student assignment (if specific students assigned, enforce; otherwise open to batch)
    const assignedStudents =
      Array.isArray(
        assignment.assignedStudents
      )
        ? assignment.assignedStudents
        : [];


    if (assignedStudents.length > 0) {
      const isAssigned = assignedStudents.some((id) =>
        isObjectIdEqual(id, studentId)
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this assignment",
        });
      }
    }

    // Check deadline
    if (
      assignment.deadline &&
      new Date() >
        new Date(assignment.deadline)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Assignment deadline has passed",
      });
    }

    // ==================================================
    // FIND QUESTION INSIDE TOPICS
    // ==================================================

    if (questionId) {
      let questionExists = false;

      const topics = Array.isArray(
        assignment.topics
      )
        ? assignment.topics
        : [];

      for (const topic of topics) {
        const questions =
          Array.isArray(topic.questions)
            ? topic.questions
            : [];

        const found = questions.some(
          (question) =>
            question._id &&
            isObjectIdEqual(
              question._id,
              questionId
            )
        );

        if (found) {
          questionExists = true;
          break;
        }
      }

      if (!questionExists) {
        return res.status(400).json({
          success: false,
          message:
            "Question does not belong to this assignment",
        });
      }
    }

    // Find existing submission
    const existing =
      await Submission.findOne({
        assignmentId,
        questionId:
          questionId || null,
        studentId,
      });

    // Already submitted
    if (
      existing &&
      existing.status !==
        "Needs Resubmission"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already submitted this",
      });
    }

    let submission;

    // ==================================================
    // RESUBMISSION
    // ==================================================

    if (
      existing &&
      existing.status ===
        "Needs Resubmission"
    ) {
      existing.submissionData =
        submissionData;

      existing.submittedAt =
        new Date();

      existing.status = "Submitted";

      existing.grade = null;

      existing.feedback = "";

      existing.gradedBy = null;

      existing.gradedAt = null;

      submission =
        await existing.save();
    }

    // ==================================================
    // NEW SUBMISSION
    // ==================================================

    else {
      submission =
        await Submission.create({
          assignmentId,
          questionId:
            questionId || null,
          studentId,
          submissionData,
          submittedAt:
            new Date(),
          status: "Submitted",
        });
    }

    // Populate
    const result =
      await Submission.findById(
        submission._id
      )
        .populate(
          "assignmentId",
          "title description instructions course deadline maxScore topics batchId"
        )
        .populate(
          "studentId",
          "name fullName email"
        )
        .populate(
          "gradedBy",
          "name fullName email role"
        );

    return res.status(201).json({
      success: true,
      message:
        "Submission successful",
      submission: result,
    });
  } catch (error) {
    console.error(
      "Create submission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit",
      error: error.message,
    });
  }
};

// ======================================================
// STUDENT
// GET MY SUBMISSIONS
// ======================================================


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
          "title description course deadline maxScore"
        )
        .populate(
          "gradedBy",
          "name fullName email role"
        )
        .sort({
          submittedAt: -1,
        });

    return res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(
      "Get my submissions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load submissions",
      error: error.message,
    });
  }
};

// ======================================================
// MENTOR
// GET SUBMISSIONS FROM MY BATCHES
// ======================================================

const getMentorSubmissions = async (
  req,
  res
) => {
  try {
    const mentorId = req.user._id;

    const batches =
      await Batch.find({
        mentorIds: mentorId,
      }).select("_id");

    const batchIds =
      batches.map(
        (batch) => batch._id
      );

    if (batchIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        submissions: [],
      });
    }

    const assignments =
      await Assignment.find({
        batchId: {
          $in: batchIds,
        },
      }).select("_id");

    const assignmentIds =
      assignments.map(
        (assignment) =>
          assignment._id
      );

    if (
      assignmentIds.length === 0
    ) {
      return res.json({
        success: true,
        count: 0,
        submissions: [],
      });
    }

    const submissions =
      await Submission.find({
        assignmentId: {
          $in: assignmentIds,
        },
      })
        .populate(
          "studentId",
          "name fullName email"
        )
        .populate(
          "assignmentId",
          "title description instructions course deadline maxScore batchId"
        )
        .populate(
          "gradedBy",
          "name fullName email role"
        )
        .sort({
          submittedAt: -1,
        });

    return res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(
      "Get mentor submissions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load mentor submissions",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN / MENTOR
// GET SUBMISSIONS FOR ONE ASSIGNMENT
// ======================================================

const getAssignmentSubmissions =
  async (req, res) => {
    try {
      const {
        assignmentId,
      } = req.params;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const userRole =
        normalizeRole(
          req.user.role
        );

      console.log(
        "=========================================="
      );

      console.log(
        "GET ASSIGNMENT SUBMISSIONS"
      );

      console.log(
        "User ID:",
        req.user._id
      );

      console.log(
        "User role:",
        userRole
      );

      console.log(
        "Assignment ID:",
        assignmentId
      );

      console.log(
        "=========================================="
      );

      // Find assignment
      const assignment =
        await Assignment.findById(
          assignmentId
        );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found",
        });
      }

      // ==================================================
      // MENTOR AUTHORIZATION
      // ==================================================


      if (
        userRole === "mentor"
      ) {
        const access =
          await verifyMentorAssignmentAccess(
            req.user._id,
            assignment
          );

        if (!access.allowed) {
          console.log(
            "Mentor access denied:",
            access.message
          );

          return res.status(
            access.status
          ).json({
            success: false,
            message:
              access.message,
          });
        }
      }

      // ==================================================
      // ROLE CHECK
      // ==================================================

      if (
        userRole !== "admin" &&
        userRole !== "mentor"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to view these submissions",
        });
      }

      // ==================================================
      // FIND SUBMISSIONS
      // ==================================================

      const submissions =
        await Submission.find({
          assignmentId,
        })
          .populate(
            "studentId",
            "name fullName email"
          )
          .populate(
            "assignmentId",
            "title description instructions course deadline maxScore topics batchId"
          )
          .populate(
            "gradedBy",
            "name fullName email role"
          )
          .sort({
            submittedAt: -1,
          });

      return res.json({
        success: true,
        count: submissions.length,
        submissions,
      });
    } catch (error) {
      console.error(
        "Get assignment submissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load assignment submissions",
        error: error.message,
      });
    }
  };

// ======================================================
// MENTOR
// GRADE SUBMISSION
// ======================================================

const gradeSubmission = async (
  req,
  res
) => {
  try {
    const mentorId = req.user._id;

    const {
      grade,
      feedback,
    } = req.body;

    if (
      grade === undefined ||
      grade === null ||
      grade === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Grade is required",
      });
    }

    const numericGrade =
      Number(grade);

    if (
      Number.isNaN(numericGrade) ||
      numericGrade < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid grade",
      });
    }

    const submission =
      await Submission.findById(
        req.params.id
      );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message:
          "Submission not found",
      });
    }

    const assignment =
      await Assignment.findById(
        submission.assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found",
      });
    }

    const access =
      await verifyMentorAssignmentAccess(
        mentorId,
        assignment
      );

    if (!access.allowed) {
      return res.status(
        access.status
      ).json({
        success: false,
        message:
          access.message,
      });
    }

    if (
      assignment.maxScore !==
        undefined &&
      assignment.maxScore !==
        null &&
      numericGrade >
        Number(
          assignment.maxScore
        )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Grade cannot be greater than ${assignment.maxScore}`,
      });
    }

    submission.grade =
      numericGrade;

    submission.feedback =
      typeof feedback ===
      "string"
        ? feedback.trim()
        : "";

    submission.gradedBy =
      mentorId;

    submission.gradedAt =
      new Date();

    submission.status =
      "Graded";


    await submission.save();

    const result =
      await Submission.findById(
        submission._id
      )
        .populate(
          "studentId",
          "name fullName email"
        )
        .populate(
          "assignmentId",
          "title description course maxScore batchId"
        )
        .populate(
          "gradedBy",
          "name fullName email role"
        );

    return res.json({
      success: true,
      message:
        "Submission graded successfully",
      submission: result,
    });
  } catch (error) {
    console.error(
      "Grade submission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to grade submission",
      error: error.message,
    });
  }
};

// ======================================================
// MENTOR
// REQUEST RESUBMISSION
// ======================================================

const requestResubmission =
  async (req, res) => {
    try {
      const mentorId =
        req.user._id;

      const submission =
        await Submission.findById(
          req.params.id
        );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found",
        });
      }

      const assignment =
        await Assignment.findById(
          submission.assignmentId
        );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found",
        });
      }

      const access =
        await verifyMentorAssignmentAccess(
          mentorId,
          assignment
        );

      if (!access.allowed) {
        return res.status(
          access.status
        ).json({
          success: false,
          message:
            access.message,
        });
      }

      submission.status =
        "Needs Resubmission";

      submission.grade = null;

      submission.feedback =
        typeof req.body.feedback ===
        "string"
          ? req.body.feedback.trim()
          : "";

      submission.gradedBy =
        mentorId;

      submission.gradedAt =
        new Date();

      await submission.save();

      const result =
        await Submission.findById(
          submission._id
        )
          .populate(
            "studentId",
            "name fullName email"
          )
          .populate(
            "assignmentId",
            "title description course maxScore batchId"
          )
          .populate(
            "gradedBy",
            "name fullName email role"
          );

      return res.json({
        success: true,
        message:
          "Resubmission requested successfully",
        submission: result,
      });
    } catch (error) {
      console.error(
        "Request resubmission error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to request resubmission",
        error: error.message,
      });
    }
  };

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createSubmission,
  getMySubmissions,
  getMentorSubmissions,
  getAssignmentSubmissions,
  gradeSubmission,
  requestResubmission,
};