const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    seasonId: {
      type: String,
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
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
      trim: true,
    },

    fieldOfStudy: {
      type: String,
      required: true,
      trim: true,
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
      trim: true,
      default: "",
    },

    codeforcesLink: {
      type: String,
      trim: true,
      default: "",
    },

    leetcodeLink: {
      type: String,
      trim: true,
      default: "",
    },

    hoursPerday: {
      type: Number,
      required: true,
      min: 5,
    },

    canCommitFiveHoursPerDay: {
      type: Boolean,
      required: true,
      validate: {
        validator: function (value) {
          return value === true;
        },
        message: "Applicant must be able to commit at least 5 hours per day.",
      },
    },

    motivation: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["Submitted"],
      default: "Submitted",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Registration", registrationSchema);