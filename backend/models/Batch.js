const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    sessionStartTime: {
      type: String,
      required: true,
      default: "09:00",
    },

    sessionEndTime: {
      type: String,
      required: true,
      default: "13:00",
    },

    endDate: {
      type: Date,
      default: null,
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