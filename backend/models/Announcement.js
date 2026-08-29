const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      maxlength: 200,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // AUTHOR / SENDER
    // =====================================================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    senderRole: {
      type: String,
      enum: ["admin", "superadmin", "mentor", "Admin", "Superadmin", "Mentor"],
      default: "admin",
    },

    // Keep authorId as an alias/reference from the other branch.
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // =====================================================
    // ANNOUNCEMENT TYPE
    // =====================================================

    type: {
      type: String,
      default: "Session",
    },

    eventType: {
      type: String,
      default: null,
    },

    isSpecial: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // BATCH
    // =====================================================

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // =====================================================
    // RECIPIENTS
    // =====================================================

    recipients: {
      type: [String],
      default: [],
    },

    // Specific users who should receive the announcement
    recipientUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Recipient roles
    recipientRoles: {
      type: [String],
      default: [],
    },

    // =====================================================
    // EVENT INFORMATION
    // =====================================================

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

    // =====================================================
    // PUBLISHING / STATUS
    // =====================================================

    publishDate: {
      type: Date,
      default: null,
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

module.exports = mongoose.model(
  "Announcement",
  announcementSchema
);