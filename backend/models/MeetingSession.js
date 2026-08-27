const mongoose = require("mongoose");

const meetingSessionSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    meetingCode: {
      type: String,
      required: true,
      trim: true,
    },

    meetingUri: {
      type: String,
      default: "",
    },

    scheduledStart: {
      type: Date,
      required: true,
    },

    scheduledEnd: {
      type: Date,
      required: true,
    },

    syncStatus: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
    },

    unmatchedParticipants: [
      {
        displayName: {
          type: String,
          default: "",
        },

        googleUserId: {
          type: String,
          default: null,
        },

        attendedMinutes: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MeetingSession",
  meetingSessionSchema
);