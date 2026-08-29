const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    // =========================================================
    // STUDENT
    // =========================================================
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================================================
    // BATCH
    // =========================================================
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    // =========================================================
    // CERTIFICATE NUMBER
    // =========================================================
    certificateNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    // =========================================================
    // CERTIFICATE TITLE
    // =========================================================
    title: {
      type: String,
      default: "Bootcamp Completion Certificate",
      trim: true,
    },

    // =========================================================
    // CERTIFICATE FILE
    // =========================================================
    certificateUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // Cloudinary public ID
    certificatePublicId: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================================================
    // ISSUED BY
    // =========================================================
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================================================
    // ISSUE DATE
    // =========================================================
    issuedAt: {
      type: Date,
      default: Date.now,
    },

    // =========================================================
    // STATUS
    // =========================================================
    status: {
      type: String,
      enum: ["Issued", "Revoked"],
      default: "Issued",
    },

    // =========================================================
    // REVOCATION INFORMATION
    // =========================================================
    revokedAt: {
      type: Date,
      default: null,
    },

    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    revokeReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// PREVENT DUPLICATE CERTIFICATE FOR SAME STUDENT + BATCH
// =========================================================
certificateSchema.index(
  {
    studentId: 1,
    batchId: 1,
  },
  {
    unique: true,
  }
);

// =========================================================
// INDEXES FOR SEARCHING / FILTERING
// =========================================================
certificateSchema.index({
  batchId: 1,
});

certificateSchema.index({
  status: 1,
});

module.exports = mongoose.model("Certificate", certificateSchema);
