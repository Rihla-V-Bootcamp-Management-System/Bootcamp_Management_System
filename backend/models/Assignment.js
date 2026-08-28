const mongoose = require("mongoose");

// ==========================================
// QUESTION
// ==========================================
const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "textarea", "number", "url"],
      default: "text",
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

// ==========================================
// ATTACHMENT
// ==========================================
const attachmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "file",
        "image",
        "document",
        "link",
        "video",
      ],
      required: true,
    },

    url: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

// ==========================================
// SUBMISSION FIELD
// ==========================================
const submissionFieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "url",
        "text",
        "file",
        "document",
        "image",
      ],
      default: "url",
    },

    required: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// ==========================================
// TOPIC / CONTAINER
// ==========================================
const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Topic is optional.
    // If an assignment has no topic, topics = [].
    questions: {
      type: [questionSchema],
      default: [],
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    submissionFields: {
      type: [submissionFieldSchema],
      default: [],
    },
  },
  { _id: true }
);

// ==========================================
// ASSIGNMENT
// ==========================================
const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // DYNAMIC COURSE
    // ==========================================
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // ==========================================
    // OPTIONAL TOPICS
    // ==========================================
    topics: {
      type: [topicSchema],
      default: [],
    },

    // ==========================================
    // BATCH
    // ==========================================
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // ==========================================
    // ASSIGNED STUDENTS
    // ==========================================
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ==========================================
    // DEADLINE
    // ==========================================
    deadline: {
      type: Date,
      required: true,
    },

    // ==========================================
    // MAX SCORE
    // ==========================================
    maxScore: {
      type: Number,
      required: true,
      min: 0,
    },

    // ==========================================
    // CREATOR
    // ==========================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Assignment",
  assignmentSchema
);