const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
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
      max: 5,
    },

    educationInstitution: {
      type: String,
      required: true,
      enum: [
        "Adama University",
        "Addis Ababa University",
        "Jimma University",
        "Hawassa University",
        "Bahir Dar University",
        "Mekelle University",
        "Gondar University",
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

    hoursPerWeek: {
      type: Number,
      required: true,
      min: 35,
    },

    canCommitFiveHoursPerDay: {
      type: Boolean,
      required: true,
    },

    motivation: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1000,
    },

    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: true,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "SHORTLISTED", "REJECTED"],
      default: "SUBMITTED",
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
  },
  {
    timestamps: true,
  }
);

registrationSchema.index(
  { email: 1, seasonId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);