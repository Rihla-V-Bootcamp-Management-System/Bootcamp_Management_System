const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // =====================================================
    // REFERENCES
    // =====================================================

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // =====================================================
    // SESSION INFORMATION
    // =====================================================

    week: {
      type: Number,
      required: true,
      min: 1,
    },

    sessionDate: {
      type: Date,
      required: true,
    },

    sessionStartTime: {
      type: Date,
      default: null,
    },

    sessionEndTime: {
      type: Date,
      default: null,
    },

    // =====================================================
    // PARTICIPATION TIME
    // =====================================================

    checkInTime: {
      type: Date,
      default: null,
    },

    checkOutTime: {
      type: Date,
      default: null,
    },

    attendedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // =====================================================
    // STATUS
    // =====================================================

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Late",
        "Excused",
      ],
      default: "Absent",
    },

    // =====================================================
    // AUTOMATIC STATUS
    // =====================================================

    calculatedStatus: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Late",
        "Excused",
      ],
      default: "Absent",
    },

    // =====================================================
    // ADMIN OVERRIDE
    // =====================================================

    manuallyOverridden: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // EXCUSE
    // =====================================================

    excuseReason: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // ADMIN / NOTES
    // =====================================================

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================================
    // ATTENDANCE SOURCE
    // =====================================================

    source: {
      type: String,
      enum: [
        "manual",
        "google_meet_auto",
      ],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// ONE ATTENDANCE RECORD PER STUDENT PER SESSION
// =====================================================

attendanceSchema.index(
  {
    sessionId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);