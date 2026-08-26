const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==============================
    // BASIC INFORMATION
    // ==============================

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
      required: function () {
        return this.role !== "mentor";
      },
      default: "",
    },

    // ==============================
    // ROLE
    // ==============================

    role: {
      type: String,
      enum: ["superadmin", "admin", "mentor", "student"],
      default: "student",
      required: true,
    },

    // ==============================
    // MENTOR INFORMATION
    // ==============================

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    telegramUsername: {
      type: String,
      trim: true,
      default: "",
    },

    // ==============================
    // MENTOR ASSIGNMENT
    // ==============================

    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==============================
    // BATCH
    // ==============================

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // ==============================
    // PASSWORD / OTP
    // ==============================

    mustResetPassword: {
      type: Boolean,
      default: false,
    },

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

    // ==============================
    // STUDENT INFORMATION
    // ==============================

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: function () {
        return this.role === "student";
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);