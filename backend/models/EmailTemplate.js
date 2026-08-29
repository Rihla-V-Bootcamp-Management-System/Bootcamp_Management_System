const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["SHORTLISTED", "ACCEPTED", "REJECTED"],
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);