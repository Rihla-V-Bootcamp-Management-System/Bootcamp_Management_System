const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC INFORMATION
    // ==========================================

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

    // ==========================================
    // USER ID
    // ==========================================

    userID: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ==========================================
    // ROLE
    // ==========================================

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

    // ==========================================
    // GENDER
    // ==========================================

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: function () {
        return this.role === "student";
      },
    },

    // ==========================================
    // ASSIGNED MENTOR
    // ==========================================

    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==========================================
    // BATCH
    // ==========================================

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    // ==========================================
    // PASSWORD RESET
    // ==========================================

    mustResetPassword: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // OTP
    // ==========================================

    otp: {
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: function () {
        return this.role === "student";
      },
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },
  },
}
  
);

// =========================================================
// AUTOMATIC USER ID
// =========================================================

userSchema.pre("save", async function (next) {
  if (this.userID) {
    return next();
  }

  let userID;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    userID = `USER${randomNumber}`;

    exists = await mongoose.models.User.findOne({
      userID,
    });
  }

  this.userID = userID;

  next();
});

module.exports = mongoose.model(
  "User",
  userSchema
);