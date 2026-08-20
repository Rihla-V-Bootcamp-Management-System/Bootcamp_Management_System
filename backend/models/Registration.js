const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    // Real Season document ID
    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    batchId: {
      type: String,
      required: true,
      trim: true,
    },

    telegramUsername: {
      type: String,
      required: true,
      trim: true,
    },

    // University information
    educationLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },

    educationInstitution: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    studentYear: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },

    studentId: {
      type: String,
      required: true,
      trim: true,
    },

    programmingExperience: {
      type: String,
      required: true,
      enum: [
        "No experience",
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
    },

    // Coding platform usernames
    githubUsername: {
      type: String,
      required: true,
      trim: true,
    },

    codeforcesUsername: {
      type: String,
      required: true,
      trim: true,
    },

    leetcodeUsername: {
      type: String,
      required: true,
      trim: true,
    },

    // Commitment
    hoursPerDay: {
      type: Number,
      required: true,
      min: 5,
    },

    hoursPerWeek: {
      type: Number,
      required: true,
      min: 35,
    },

    motivation: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1000,
    },

    // Dynamic form answers
    responses: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Application status
    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "SHORTLISTED",
        "INTERVIEWED",
        "ACCEPTED",
        "REJECTED",
      ],
      default: "SUBMITTED",
    },

    interviewNotes: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    decidedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One application per email for each season
registrationSchema.index(
  { email: 1, seasonId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);