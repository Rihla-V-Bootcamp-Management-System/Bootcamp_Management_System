const bcrypt = require("bcryptjs");
const Registration = require("../models/Registration");
const User = require("../models/User");
const { createAuditLog } = require("../services/auditLogService");

const {
  sendShortlistedEmail,
  sendAcceptedEmail,
  sendRejectedEmail,
} = require("../services/emailService");

const allowedTransitions = {
  SUBMITTED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEWED", "REJECTED"],
  INTERVIEWED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const validStatuses = [
      "SUBMITTED",
      "SHORTLISTED",
      "INTERVIEWED",
      "ACCEPTED",
      "REJECTED",
    ];

    // 1. Validate status
    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    // 2. Find registration
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    // 3. Check allowed transition
    const currentStatus = registration.status;

    const allowedNextStatuses =
      allowedTransitions[currentStatus] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    // 4. Save reviewer information
    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();

    // 5. Handle rejection
    if (status === "REJECTED") {
      registration.rejectionReason =
        rejectionReason?.trim() || "No reason provided";
    }

    // 6. Handle accepted application
    if (status === "ACCEPTED") {
      const existingUser = await User.findOne({
        email: registration.email,
      });

      if (existingUser) {
        return res.status(400).json({
          message: "A user with this email already exists",
        });
      }

      // Generate student ID
      const lastUser = await User.findOne({
        userID: { $regex: /^STU-\d{4}-\d+$/ },
      }).sort({ userID: -1 });

      let nextNumber = 1;

      if (lastUser?.userID) {
        const match = lastUser.userID.match(/(\d+)$/);

        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
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
      const temporaryPassword = await bcrypt.hash(
        Math.random().toString(36),
        10
      );

      // Create student account
      const createdUser = await User.create({
        name: registration.fullName,
        email: registration.email,
        password: temporaryPassword,
        role: "student",
        gender: registration.gender,
        userID,
        otp,
        otpExpiresAt,
        mustResetPassword: true,
      });

      // Update registration
      registration.status = "ACCEPTED";
      registration.decidedAt = new Date();

      await registration.save();

      // Audit log
      await createAuditLog({
        actor: req.user._id,
        actorRole: req.user.role,
        action: "STATUS_CHANGE",
        targetType: "Registration",
        targetId: registration._id.toString(),
        description: `${req.user.role} changed registration status from ${currentStatus} to ACCEPTED`,
        metadata: {
          registrationId: registration._id.toString(),
          applicantName: registration.fullName,
          applicantEmail: registration.email,
          previousStatus: currentStatus,
          newStatus: "ACCEPTED",
          studentUserID: createdUser.userID,
        },
      });

      // Send accepted email
      let emailSent = false;

      try {
        await sendAcceptedEmail(
          registration,
          createdUser
        );

        emailSent = true;
      } catch (emailError) {
        console.error(
          "Accepted email error:",
          emailError.message
        );
      }

      return res.status(200).json({
        message: emailSent
          ? "Registration accepted and student account created"
          : "Registration accepted and student account created, but email failed",

        emailSent,

        registration,

        user: {
          userID: createdUser.userID,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          gender: createdUser.gender,
        },
      });
    }

    // 7. For other statuses
    registration.status = status;

    if (
      status === "SHORTLISTED" ||
      status === "INTERVIEWED"
    ) {
      registration.rejectionReason = "";
    }

    if (status === "REJECTED") {
      registration.decidedAt = new Date();
    }

    await registration.save();

    // 8. Send appropriate email
    let emailSent = false;

    try {
      if (status === "SHORTLISTED") {
        await sendShortlistedEmail(registration);
        emailSent = true;
      }

      if (status === "REJECTED") {
        await sendRejectedEmail(registration);
        emailSent = true;
      }
    } catch (emailError) {
      console.error(
        "Status email error:",
        emailError.message
      );
    }

    // 9. Audit log
    await createAuditLog({
      actor: req.user._id,
      actorRole: req.user.role,
      action: "STATUS_CHANGE",
      targetType: "Registration",
      targetId: registration._id.toString(),
      description: `${req.user.role} changed registration status from ${currentStatus} to ${status}`,
      metadata: {
        registrationId: registration._id.toString(),
        applicantName: registration.fullName,
        applicantEmail: registration.email,
        previousStatus: currentStatus,
        newStatus: status,
      },
    });

    return res.status(200).json({
      message: emailSent
        ? `Registration status changed to ${status} and email sent`
        : `Registration status changed to ${status}`,

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
};

module.exports = {
  updateRegistrationStatus,
};