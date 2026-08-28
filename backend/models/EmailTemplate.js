const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "SHORTLISTED",
        "ACCEPTED",
        "REJECTED",
      ],
      unique: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    text: {
      type: String,
      required: true,
    },

    html: {
      type: String,
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmailTemplate",
  emailTemplateSchema
);