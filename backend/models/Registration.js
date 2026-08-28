const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Season",
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Batch",
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
      set: (value) => {
        if (!value) return value;

        const normalized = String(value).toLowerCase();

        if (normalized === "male") {
          return "Male";
        }

        if (normalized === "female") {
          return "Female";
        }

        return value;
      },
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

    telegramUsername: {
      type: String,
      required: true,
      trim: true,
    },

    educationLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },

    educationInstitution: {
      type: String,
      default: "Other",
    },

    fieldOfStudy: {
      type: String,
      default: "Other",
    },

    studentId: {
      type: String,
      default: "N/A",
      trim: true,
    },

    programmingExperience: {
      type: String,
      default: "Beginner",
    },

    githubLink: {
      type: String,
      default: "",
      trim: true,
    },

    codeforcesLink: {
      type: String,
      default: "",
      trim: true,
    },

    leetcodeLink: {
      type: String,
      default: "",
      trim: true,
    },

    hoursPerWeek: {
      type: Number,
      default: 35,
    },

    canCommitFiveHoursPerDay: {
      type: Boolean,
      default: true,
    },

    motivation: {
      type: String,
      default: "",
      trim: true,
    },

    responses: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

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

registrationSchema.index(
  { email: 1, seasonId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);