const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    // =====================================================
    // BATCH
    // =====================================================

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // =====================================================
    // SESSION INFORMATION
    // =====================================================

    title: {
      type: String,
      trim: true,
      default: "Attendance Session",
    },

    week: {
      type: Number,
      required: true,
      min: 1,
    },

    sessionDate: {
      type: Date,
      required: true,
    },

    // Scheduled time entered by admin
    scheduledStartTime: {
      type: Date,
      default: null,
    },

    scheduledEndTime: {
      type: Date,
      default: null,
    },

    // =====================================================
    // ACTUAL TRACKING
    // =====================================================

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    totalMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "Created",
        "Open",
        "Tracking",
        "Stopped",
        "Reviewed",
        "Saved",
      ],
      default: "Created",
    },

    // =====================================================
    // CREATED BY
    // =====================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // REVIEW
    // =====================================================

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // SAVED
    // =====================================================

    savedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// ONE SESSION PER BATCH / WEEK / DATE
// =====================================================

sessionSchema.index(
  {
    batchId: 1,
    week: 1,
    sessionDate: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);