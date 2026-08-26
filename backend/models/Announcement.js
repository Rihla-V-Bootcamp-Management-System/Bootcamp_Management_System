const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "Contest",
        "Session",
        "Experience Sharing",
        "Deadline",
        "Special Event",
        "Other",
      ],
      default: "Other",
    },

    eventType: {
      type: String,
      enum: [
        "Special Event",
        "Competition",
        "Guest Speaker",
        "Career Event",
        "Hackathon",
      ],
      default: null,
    },

    isSpecial: {
      type: Boolean,
      default: false,
    },

    recipients: {
      type: [
        {
          type: String,
          enum: ["Superadmin", "Mentor", "Student"],
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one recipient is required",
      },
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    eventDate: {
      type: Date,
      default: null,
    },

    startTime: {
      type: String,
      trim: true,
      default: "",
    },

    endTime: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    activeLink: {
      type: String,
      trim: true,
      default: "",
    },

    publishDate: {
      type: Date,
      default: null,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Published"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Announcement", announcementSchema);