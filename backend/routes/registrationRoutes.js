const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Registration = require("../models/Registration");
const RegistrationSettings = require("../models/RegistrationSettings");
const User = require("../models/User");

const {
  sendShortlistedEmail,
  sendAcceptedEmail,
  sendRejectedEmail,
} = require("../services/emailService");

// ======================================================
// STATUS TRANSITIONS
// ======================================================

const allowedTransitions = {
  SUBMITTED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEWED", "REJECTED"],
  INTERVIEWED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
};

// ======================================================
// CREATE REGISTRATION
// POST /api/registrations
// ======================================================

router.post("/", async (req, res) => {
  try {
    const settings = await RegistrationSettings.findOne();

    if (!settings || !settings.registrationOpen) {
      return res.status(403).json({
        message: "Registration is currently closed",
      });
    }

    const {
      seasonId,
      fullName,
      gender,
      email,
      phoneNumber,
      batchId,
      telegramUsername,
      educationLevel,
      educationInstitution,
      fieldOfStudy,
      studentId,
      programmingExperience,
      githubLink,
      codeforcesLink,
      leetcodeLink,
      hoursPerWeek,
      canCommitFiveHoursPerDay,
      motivation,
      responses,
    } = req.body;

    // ==================================================
    // REQUIRED FIELD VALIDATION
    // ==================================================

    if (!seasonId) {
      return res.status(400).json({
        message: "Season ID is required",
      });
    }

    if (!fullName) {
      return res.status(400).json({
        message: "Full name is required",
      });
    }

    if (!gender) {
      return res.status(400).json({
        message: "Gender is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    if (!batchId) {
      return res.status(400).json({
        message: "Batch ID is required",
      });
    }

    if (!telegramUsername) {
      return res.status(400).json({
        message: "Telegram username is required",
      });
    }

    if (educationLevel === undefined) {
      return res.status(400).json({
        message: "Education level is required",
      });
    }

    if (!educationInstitution) {
      return res.status(400).json({
        message: "Education institution is required",
      });
    }

    if (!fieldOfStudy) {
      return res.status(400).json({
        message: "Field of study is required",
      });
    }

    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required",
      });
    }

    if (!programmingExperience) {
      return res.status(400).json({
        message: "Programming experience is required",
      });
    }

    if (!githubLink) {
      return res.status(400).json({
        message: "GitHub link is required",
      });
    }

    if (!codeforcesLink) {
      return res.status(400).json({
        message: "Codeforces link is required",
      });
    }

    if (!leetcodeLink) {
      return res.status(400).json({
        message: "LeetCode link is required",
      });
    }

    if (hoursPerWeek === undefined) {
      return res.status(400).json({
        message: "Hours per week is required",
      });
    }

    if (canCommitFiveHoursPerDay === undefined) {
      return res.status(400).json({
        message: "Daily commitment confirmation is required",
      });
    }

    if (!motivation) {
      return res.status(400).json({
        message: "Motivation is required",
      });
    }

    // ==================================================
    // NORMALIZE EMAIL
    // ==================================================

    const normalizedEmail = email.trim().toLowerCase();

    // ==================================================
    // CHECK DUPLICATE APPLICATION
    // ==================================================

    const existingRegistration = await Registration.findOne({
      email: normalizedEmail,
      seasonId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message:
          "You have already submitted an application for this season",
      });
    }

    // ==================================================
    // CREATE REGISTRATION
    // ==================================================

    const registration = await Registration.create({
      seasonId,

      fullName: fullName.trim(),

      gender,

      email: normalizedEmail,

      phoneNumber: phoneNumber.trim(),

      batchId: batchId.trim(),

      telegramUsername: telegramUsername.trim(),

      educationLevel: Number(educationLevel),

      educationInstitution,

      fieldOfStudy,

      studentId: studentId.trim(),

      programmingExperience,

      githubLink: githubLink.trim(),

      codeforcesLink: codeforcesLink.trim(),

      leetcodeLink: leetcodeLink.trim(),

      hoursPerWeek: Number(hoursPerWeek),

      canCommitFiveHoursPerDay,

      motivation: motivation.trim(),

      responses: responses || {},

      status: "SUBMITTED",
    });

    return res.status(201).json({
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "You have already submitted an application for this season",
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE REGISTRATION STATUS
// PATCH /api/registrations/:id/status
// ======================================================

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // ==================================================
    // VALIDATE STATUS
    // ==================================================

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const validStatuses = [
      "SUBMITTED",
      "SHORTLISTED",
      "INTERVIEWED",
      "ACCEPTED",
      "REJECTED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    // ==================================================
    // FIND REGISTRATION
    // ==================================================

    const registration = await Registration.findById(
      req.params.id
    );

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    const currentStatus = registration.status;

    const allowedNextStatuses =
      allowedTransitions[currentStatus] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    registration.status = status;

    // ==================================================
    // DECIDED AT
    // ==================================================

    if (
      status === "ACCEPTED" ||
      status === "REJECTED"
    ) {
      registration.decidedAt = new Date();
    }

    // ==================================================
    // ACCEPTED
    // CREATE STUDENT ACCOUNT
    // ==================================================

    if (status === "ACCEPTED") {
      const existingUser = await User.findOne({
        email: registration.email,
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            "A user with this email already exists",
        });
      }

      // Find the latest student ID
      const lastUser = await User.findOne({
        userID: {
          $regex: /^STU-\d{4}-\d+$/,
        },
      }).sort({
        userID: -1,
      });

      let nextNumber = 1;

      if (lastUser && lastUser.userID) {
        const match = lastUser.userID.match(
          /(\d+)$/
        );

        if (match) {
          nextNumber =
            parseInt(match[1], 10) + 1;
        }
      }

      const year = new Date().getFullYear();

      const userID = `STU-${year}-${String(
        nextNumber
      ).padStart(4, "0")}`;

      // Generate OTP
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const otpExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );

      // Temporary password
      const temporaryPassword =
        await bcrypt.hash(
          Math.random().toString(36),
          10
        );

      // Create student account
      const createdUser = await User.create({
        name: registration.fullName,
        email: registration.email,
        password: temporaryPassword,
        role: "student",
        userID,
        otp,
        otpExpiresAt,
        mustResetPassword: true,
      });

      await registration.save();

      // ==================================================
      // ACCEPTED EMAIL
      // ==================================================

      let emailSent = false;

      try {
        await sendAcceptedEmail(
          registration,
          createdUser
        );

        emailSent = true;

        console.log(
          `Accepted email sent to ${registration.email}`
        );
      } catch (emailError) {
        console.error(
          "Accepted email error:",
          emailError.message
        );
      }

      return res.status(200).json({
        message: emailSent
          ? "Registration accepted, student account created, and email sent"
          : "Registration accepted and student account created, but email failed",

        registration,

        emailSent,

        user: {
          userID: createdUser.userID,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          otp: createdUser.otp,
          otpExpiresAt: createdUser.otpExpiresAt,
          mustResetPassword:
            createdUser.mustResetPassword,
        },
      });
    }

    // ==================================================
    // SAVE STATUS
    // ==================================================

    await registration.save();

    // ==================================================
    // STATUS EMAILS
    // ==================================================

    let emailSent = false;

    try {
      if (status === "SHORTLISTED") {
        await sendShortlistedEmail(
          registration
        );

        emailSent = true;

        console.log(
          `Shortlisted email sent to ${registration.email}`
        );
      }

      if (status === "REJECTED") {
        await sendRejectedEmail(
          registration
        );

        emailSent = true;

        console.log(
          `Rejected email sent to ${registration.email}`
        );
      }
    } catch (emailError) {
      console.error(
        "Status email error:",
        emailError.message
      );
    }

    return res.status(200).json({
      message: emailSent
        ? `Registration status changed from ${currentStatus} to ${status} and email sent`
        : `Registration status changed from ${currentStatus} to ${status}, but email failed`,

      emailSent,

      registration,
    });
  } catch (error) {
    console.error(
      "Status update error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = router;