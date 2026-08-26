const mongoose = require("mongoose");

const capstoneProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    requirements: {
      type: String,
      trim: true,
      default: "",
    },

    level: {
      type: Number,
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    maxScore: {
      type: Number,
      default: 100,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CapstoneProject",
  capstoneProjectSchema
);