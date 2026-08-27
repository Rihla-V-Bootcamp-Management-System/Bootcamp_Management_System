const mongoose = require("mongoose");

const formQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "number",
        "select",
        "file",
      ],
      default: "text",
    },

    options: {
      type: [String],
      default: [],
    },

    fileTypes: {
      type: [String],
      enum: ["image", "pdf", "any"],
      default: [],
    },

    required: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FormQuestion",
  formQuestionSchema
);