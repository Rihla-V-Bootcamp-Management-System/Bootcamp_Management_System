const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["admin", "superadmin", "mentor"],
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    type: {
      type: String,
      enum: [
        "general",
        "assignment",
        "attendance",
        "progress",
        "custom",
      ],
      default: "general",
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