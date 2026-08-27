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

    const normalizedGender = registration.gender
      ? registration.gender.toLowerCase()
      : null;

    const reviewerUpdate = {
      status,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };

    if (
      status === "SHORTLISTED" ||
      status === "INTERVIEWED"
    ) {
      reviewerUpdate.rejectionReason = "";
    }

    if (status === "REJECTED") {
      reviewerUpdate.rejectionReason =
        rejectionReason?.trim() || "No reason provided";

      reviewerUpdate.decidedAt = new Date();
    }

    if (status === "ACCEPTED") {
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

      if (lastUser?.userID) {
        const match = lastUser.userID.match(/(\d+)$/);

        if (match) {
          nextNumber =
            parseInt(match[1], 10) + 1;
        }
      }

      const year = new Date().getFullYear();

      const userID = `STU-${year}-${String(
        nextNumber
      ).padStart(4, "0")}`;

      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const otpExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );

      const temporaryPassword = await bcrypt.hash(
        Math.random().toString(36),
        10
      );

      const userGender =
        normalizedGender === "male"
          ? "male"
          : normalizedGender === "female"
          ? "female"
          : undefined;

      const createdUser = await User.create({
        name: registration.fullName,
        email: registration.email,
        password: temporaryPassword,
        role: "student",
        gender: userGender,
        userID,
        otp,
        otpExpiresAt,
        mustResetPassword: true,
      });

      reviewerUpdate.status = "ACCEPTED";
      reviewerUpdate.decidedAt = new Date();

      const updatedRegistration =
        await Registration.findByIdAndUpdate(
          registration._id,
          {
            $set: reviewerUpdate,
          },
          {
            new: true,
            runValidators: false,
          }
        );

      await createAuditLog({
        actor: req.user._id,
        actorRole: req.user.role,
        action: "STATUS_CHANGE",
        targetType: "Registration",
        targetId: registration._id.toString(),
        description: `${req.user.role} changed registration status from ${currentStatus} to ACCEPTED`,
        metadata: {
          registrationId:
            registration._id.toString(),
          applicantName:
            registration.fullName,
          applicantEmail:
            registration.email,
          previousStatus: currentStatus,
          newStatus: "ACCEPTED",
          studentUserID:
            createdUser.userID,
        },
      });

      let emailSent = false;

      try {
        await sendAcceptedEmail(
          updatedRegistration,
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

        registration: updatedRegistration,

        user: {
          userID: createdUser.userID,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          gender: createdUser.gender,
        },
      });
    }

    const updatedRegistration =
      await Registration.findByIdAndUpdate(
        registration._id,
        {
          $set: reviewerUpdate,
        },
        {
          new: true,
          runValidators: false,
        }
      );

    let emailSent = false;

    try {
      if (status === "SHORTLISTED") {
        await sendShortlistedEmail(
          updatedRegistration
        );

        emailSent = true;
      }

      if (status === "REJECTED") {
        await sendRejectedEmail(
          updatedRegistration
        );

        emailSent = true;
      }
    } catch (emailError) {
      console.error(
        "Status email error:",
        emailError.message
      );
    }

    await createAuditLog({
      actor: req.user._id,
      actorRole: req.user.role,
      action: "STATUS_CHANGE",
      targetType: "Registration",
      targetId: registration._id.toString(),
      description: `${req.user.role} changed registration status from ${currentStatus} to ${status}`,
      metadata: {
        registrationId:
          registration._id.toString(),
        applicantName:
          registration.fullName,
        applicantEmail:
          registration.email,
        previousStatus: currentStatus,
        newStatus: status,
      },
    });

    return res.status(200).json({
      message: emailSent
        ? `Registration status changed to ${status} and email sent`
        : `Registration status changed to ${status}`,

      emailSent,
      registration: updatedRegistration,
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