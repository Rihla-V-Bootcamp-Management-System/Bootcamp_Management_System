const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "mentor", "student"],
      default: "student",
      required: true,
    },

    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: null,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    mustResetPassword: {
      type: Boolean,
      default: false,
    },

    // Account activation status
    accountStatus: {
      type: String,
      enum: ["pending", "active"],
      default: "active",
    },

    // Secure invitation token
    invitationToken: {
      type: String,
      default: null,
    },

    // Invitation token expiration time
    invitationTokenExpiresAt: {
      type: Date,
      default: null,
    },

    // Old OTP fields kept temporarily
    // so the existing OTP system does not break
    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);