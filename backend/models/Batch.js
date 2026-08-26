const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // When the batch started
    startDate: {
      type: Date,
      required: true,
    },

    // Daily/session attendance interval
    sessionStartTime: {
      type: String,
      default: "09:00",
    },

    sessionEndTime: {
      type: String,
      default: "13:00",
    },

    mentorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", batchSchema);