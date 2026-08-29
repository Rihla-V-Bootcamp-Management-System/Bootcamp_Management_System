
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =========================================================
    // BASIC INFORMATION
    // =========================================================

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

    googleUserId: {
      type: String,
      default: null,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return this.role !== "mentor";
      },
      default: "",
    },

    // =========================================================
    // USER ID
    // =========================================================

    userID: {
      type: String,
      unique: true,
      sparse: true,
    },

    // =========================================================
    // ROLE
    // =========================================================

    role: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "mentor",
        "student",
      ],
      default: "student",
      required: true,
    },

    // =========================================================
    // MENTOR INFORMATION
    // =========================================================

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

    // =========================================================
    // GENDER
    // =========================================================

    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: null,
      required: function () {
        return this.role === "student";
      },
    },

    // =========================================================
    // ASSIGNED MENTOR
    // =========================================================

    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================================================
    // BATCH
    // =========================================================

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // =========================================================
    // PASSWORD RESET / FIRST LOGIN
    // =========================================================

    mustResetPassword: {
      type: Boolean,
      default: false,
    },

    // =========================================================
    // ACCOUNT STATUS & WARNINGS
    // =========================================================

    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "active",
    },

    suspensionReason: {
      type: String,
      default: "",
    },

    warnings: [
      {
        reason: { type: String, required: true },
        warnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        warnedAt: { type: Date, default: Date.now },
      },
    ],

    // =========================================================
    // INVITATION TOKEN
    // =========================================================

    invitationToken: {
      type: String,
      default: null,
    },

    invitationTokenExpiresAt: {
      type: Date,
      default: null,
    },

    // =========================================================
    // OTP
    // =========================================================

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

// =========================================================
// AUTOMATIC USER ID
// =========================================================
//
// IMPORTANT:
// This middleware intentionally does NOT use next().
// It uses the async Mongoose middleware style.
//
// =========================================================

userSchema.pre("save", async function () {
  // If user already has a userID, do nothing.
  if (this.userID) {
    return;
  }

  let userID;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    userID = `USER${randomNumber}`;

    exists = await mongoose.models.User.exists({
      userID,
    });
  }

  this.userID = userID;
});

// =========================================================
// EXPORT
// =========================================================

module.exports = mongoose.model("User", userSchema);

