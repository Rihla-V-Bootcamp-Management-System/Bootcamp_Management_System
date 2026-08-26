const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {

    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
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
      enum: ["Male", "Female"]
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
    },

    telegramUsername: {
      type: String,
      required: true,
      trim: true,
    },
    educationLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    educationInstitution: {
      type: String,
      required: true,
      enum: [
        "Adama University",
        "Addis Ababa University",
        "Jimma University",
        "Other",
      ],
    },
    fieldOfStudy: {
      type: String,
      required: true,
      enum: [
        "Software Engineering",
        "Computer Science",
        "Electrical Engineering",
        "Other",
      ],
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
    githubLink: {
      type: String,
      required: true,
      trim: true,
    },
    codeforcesLink: {
      type: String,
      required: true,
      trim: true,
    },
    leetcodeLink: {
      type: String,
      required: true,
      trim: true,
    },
    hoursPerWeek: {
      type: Number,
      required: true,
      min: 35,
    },
    canCommitFiveHoursPerDay: {
      type: Boolean,
      required: true,
      validate: {
        validator: function (value) {
          return value === true;
        },
        message:
          "Applicant must be able to commit at least 5 hours per day.",
      },
    },
    motivation: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1000,
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
