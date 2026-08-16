const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true
    },
    responses: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ["Submitted", "Shortlisted", "Interviewed", "Accepted", "Rejected"],
      default: "Submitted"
    },
    interviewNotes: {
      type: String,
      default: ""
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    decidedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);