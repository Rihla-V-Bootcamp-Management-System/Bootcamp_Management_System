const mongoose = require("mongoose");

const moduleResourceSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "pdf",
        "video",
        "link",
        "document",
        "image",
        "other",
      ],
      default: "link",
    },

    url: {
      type: String,
      trim: true,
      default: "",
    },

    fileUrl: {
      type: String,
      trim: true,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ModuleResource",
  moduleResourceSchema
);