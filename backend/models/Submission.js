const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Flexible submission values.
    // Example:
    // {
    //   github: "https://github.com/...",
    //   liveDemo: "https://...",
    //   document: "https://docs.google.com/...",
    //   notes: "..."
    // }
    submissionData: {
      type: Map,
      of: String,
      default: {},
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    grade: {
      type: Number,
      default: null,
      min: 0,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Graded",
        "Needs Resubmission",
      ],
      default: "Submitted",
    },

    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gradedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index(
  {
    assignmentId: 1,
    questionId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Submission",
  submissionSchema
);