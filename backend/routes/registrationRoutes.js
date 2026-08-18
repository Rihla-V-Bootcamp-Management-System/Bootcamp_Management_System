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

const allowedTransitions = {
  Submitted: ["Shortlisted", "Rejected"],
  Shortlisted: ["Interviewed", "Rejected"],
  Interviewed: ["Accepted", "Rejected"],
  Accepted: [],
  Rejected: [],
};

router.post("/", async (req, res) => {
  try {
    const settings = await RegistrationSettings.findOne();

    if (!settings || !settings.registrationOpen) {
      return res.status(403).json({
        message: "Registration is currently closed",
      });
    }

    const { fullName, email, phone, batchId, department, experience } =
      req.body;

    if (!fullName || !email || !phone || !batchId) {
      return res.status(400).json({
        message: "Full name, email, phone, and batch ID are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingRegistration = await Registration.findOne({
      email: normalizedEmail,
      batchId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You have already registered for this batch",
      });
    }

    const registration = await Registration.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      batchId: batchId.trim(),
      responses: {
        department: department || "",
        experience: experience || "",
      },
      status: "Submitted",
    });

    res.status(201).json({
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email has already been registered for this batch",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const validStatuses = [
      "Submitted",
      "Shortlisted",
      "Interviewed",
      "Accepted",
      "Rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    const currentStatus = registration.status;
    const allowedNextStatuses = allowedTransitions[currentStatus] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    registration.status = status;

    if (status === "Accepted" || status === "Rejected") {
      registration.decidedAt = new Date();
    }

    if (status === "Accepted") {
      const existingUser = await User.findOne({
        email: registration.email,
      });

      if (existingUser) {
        return res.status(400).json({
          message: "A user with this email already exists",
        });
      }

      const lastUser = await User.findOne({
        userID: { $regex: /^STU-\d{4}-\d+$/ },
      }).sort({ userID: -1 });

      let nextNumber = 1;

      if (lastUser && lastUser.userID) {
        const match = lastUser.userID.match(/(\d+)$/);

        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      const year = new Date().getFullYear();
      const userID = `STU-${year}-${String(nextNumber).padStart(4, "0")}`;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const otpExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );

      const temporaryPassword = await bcrypt.hash(
        Math.random().toString(36),
        10
      );

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

      let emailSent = false;

      try {
        await sendAcceptedEmail(registration, createdUser);
        emailSent = true;
        console.log(`Accepted email sent to ${registration.email}`);
      } catch (emailError) {
        console.error("Accepted email error:", emailError.message);
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
          mustResetPassword: createdUser.mustResetPassword,
        },
      });
    }

    await registration.save();

    let emailSent = false;

    try {
      if (status === "Shortlisted") {
        await sendShortlistedEmail(registration);
        emailSent = true;
        console.log(`Shortlisted email sent to ${registration.email}`);
      }

      if (status === "Rejected") {
        await sendRejectedEmail(registration);
        emailSent = true;
        console.log(`Rejected email sent to ${registration.email}`);
      }
    } catch (emailError) {
      console.error("Status email error:", emailError.message);
    }

    res.status(200).json({
      message: emailSent
        ? `Registration status changed from ${currentStatus} to ${status} and email sent`
        : `Registration status changed from ${currentStatus} to ${status}, but email failed`,
      emailSent,
      registration,
    });
  } catch (error) {
    console.error("Status update error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;