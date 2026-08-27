const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Registration = require("../models/Registration");
const ApplicationForm = require("../models/ApplicationForm");
const User = require("../models/User");

const { createAuditLog } = require("../services/auditLogService");

const {
  sendShortlistedEmail,
  sendAcceptedEmail,
  sendRejectedEmail,
} = require("../services/emailService");

// =====================================================
// ALLOWED STATUS TRANSITIONS
// =====================================================

const allowedTransitions = {
  SUBMITTED: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEWED", "REJECTED"],
  INTERVIEWED: ["ACCEPTED", "REJECTED"],
  ACCEPTED: [],
  REJECTED: [],
};

// =====================================================
// CREATE REGISTRATION
// PUBLIC
// POST /api/registrations
// =====================================================

const createRegistration = async (req, res) => {
  try {
    console.log("====================================");
    console.log("CREATE REGISTRATION REQUEST");
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    console.log("====================================");

    const {
      seasonId,
      batchId,
      fullName,
      gender,
      email,
      phoneNumber,
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

    // =================================================
    // 1. SEASON ID
    // =================================================

    if (!seasonId) {
      return res.status(400).json({
        message: "seasonId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(seasonId)) {
      return res.status(400).json({
        message: "Invalid seasonId",
      });
    }

    // =================================================
    // 2. BATCH ID
    // =================================================

    if (!batchId) {
      return res.status(400).json({
        message: "batchId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        message: "Invalid batchId",
      });
    }

    // =================================================
    // 3. REQUIRED FIELDS
    // =================================================

    if (
      !fullName ||
      !gender ||
      !email ||
      !phoneNumber ||
      !telegramUsername ||
      educationLevel === undefined ||
      educationLevel === null ||
      !educationInstitution ||
      !fieldOfStudy ||
      !studentId ||
      !programmingExperience ||
      !githubLink ||
      !codeforcesLink ||
      !leetcodeLink ||
      hoursPerWeek === undefined ||
      hoursPerWeek === null ||
      !motivation
    ) {
      console.log("MISSING REQUIRED FIELD");

      return res.status(400).json({
        message:
          "All required registration fields must be provided",
      });
    }

    // =================================================
    // 4. GENDER
    // =================================================

    if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({
        message: "Gender must be Male or Female",
      });
    }

    // =================================================
    // 5. EDUCATION LEVEL
    // =================================================

    const numericEducationLevel = Number(educationLevel);

    if (
      Number.isNaN(numericEducationLevel) ||
      numericEducationLevel < 1 ||
      numericEducationLevel > 3
    ) {
      return res.status(400).json({
        message: "Education level must be between 1 and 3",
      });
    }

    // =================================================
    // 6. HOURS PER WEEK
    // =================================================

    const numericHoursPerWeek = Number(hoursPerWeek);

    if (
      Number.isNaN(numericHoursPerWeek) ||
      numericHoursPerWeek < 35
    ) {
      return res.status(400).json({
        message:
          "Minimum required commitment is 35 hours per week",
      });
    }

    // =================================================
    // 7. FIVE HOURS PER DAY
    // =================================================

    if (canCommitFiveHoursPerDay !== true) {
      return res.status(400).json({
        message:
          "Applicant must be able to commit at least 5 hours per day",
      });
    }

    // =================================================
    // 8. RESPONSES
    // =================================================

    if (
      responses !== undefined &&
      (typeof responses !== "object" ||
        Array.isArray(responses))
    ) {
      return res.status(400).json({
        message: "responses must be an object",
      });
    }

    // =================================================
    // 9. FIND APPLICATION FORM
    // =================================================

    console.log(
      "SEARCHING APPLICATION FORM FOR SEASON:",
      seasonId
    );

    const applicationForm =
      await ApplicationForm.findOne({
        seasonId: new mongoose.Types.ObjectId(seasonId),
      });

    console.log(
      "APPLICATION FORM FOUND:",
      applicationForm
        ? applicationForm._id
        : "NOT FOUND"
    );

    if (!applicationForm) {
      const allForms =
        await ApplicationForm.find({})
          .select("_id seasonId");

      console.log(
        "ALL APPLICATION FORMS:",
        JSON.stringify(allForms, null, 2)
      );

      return res.status(404).json({
        message: "Application form not found",
        seasonId,
      });
    }

    // =================================================
    // 10. VALIDATE DYNAMIC RESPONSES
    // =================================================

    const submittedResponses = responses || {};

    for (const field of applicationForm.fields || []) {
      const fieldId = field.id || field._id?.toString();

      const value = submittedResponses[fieldId];

      // Required field
      if (
        field.required &&
        (value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) &&
            value.length === 0))
      ) {
        return res.status(400).json({
          message: `${field.label} is required`,
        });
      }

      // Select / Radio
      if (
        field.type === "select" ||
        field.type === "radio"
      ) {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          field.options?.length > 0 &&
          !field.options.includes(value)
        ) {
          return res.status(400).json({
            message:
              `Invalid option for ${field.label}`,
          });
        }
      }

      // Checkbox
      if (field.type === "checkbox") {
        if (
          value !== undefined &&
          value !== null &&
          typeof value !== "boolean"
        ) {
          return res.status(400).json({
            message:
              `${field.label} must be true or false`,
          });
        }
      }

      // Number
      if (field.type === "number") {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          typeof value !== "number"
        ) {
          return res.status(400).json({
            message:
              `${field.label} must be a number`,
          });
        }
      }
    }

    // =================================================
    // 11. NORMALIZE EMAIL
    // =================================================

    const normalizedEmail =
      email.trim().toLowerCase();

    // =================================================
    // 12. DUPLICATE APPLICATION
    // =================================================

    const existingRegistration =
      await Registration.findOne({
        email: normalizedEmail,
        seasonId,
      });

    if (existingRegistration) {
      return res.status(409).json({
        message:
          "You have already applied for this season.",
      });
    }

    // =================================================
    // 13. CREATE REGISTRATION
    // =================================================

    const registration =
      await Registration.create({
        seasonId,
        batchId,

        fullName: fullName.trim(),

        gender,

        email: normalizedEmail,

        phoneNumber:
          phoneNumber.trim(),

        telegramUsername:
          telegramUsername.trim(),

        educationLevel:
          numericEducationLevel,

        educationInstitution,

        fieldOfStudy,

        studentId:
          studentId.trim(),

        programmingExperience,

        githubLink:
          githubLink.trim(),

        codeforcesLink:
          codeforcesLink.trim(),

        leetcodeLink:
          leetcodeLink.trim(),

        hoursPerWeek:
          numericHoursPerWeek,

        canCommitFiveHoursPerDay,

        motivation:
          motivation.trim(),

        responses:
          submittedResponses,

        status: "SUBMITTED",

        submittedAt: new Date(),
      });

    console.log(
      "REGISTRATION CREATED:",
      registration._id
    );

    return res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error(
      "REGISTRATION ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This email has already been registered for this season",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message:
          "Registration validation failed",

        errors: Object.values(
          error.errors
        ).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      message:
        "Failed to submit registration",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET ALL REGISTRATIONS
// ADMIN
// GET /api/registrations
// =====================================================

const getRegistrations = async (req, res) => {
  try {
    console.log("GET REGISTRATIONS");

    const registrations =
      await Registration.find({})
        .populate(
          "seasonId",
          "name"
        )
        .populate(
          "batchId",
          "name"
        )
        .populate(
          "reviewedBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error(
      "GET REGISTRATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load registrations",
      error:
        error.message,
    });
  }
};

// =====================================================
// GET REGISTRATION BY ID
// ADMIN
// GET /api/registrations/:id
// =====================================================

const getRegistrationById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message:
          "Invalid registration ID",
      });
    }

    const registration =
      await Registration.findById(id)
        .populate(
          "seasonId",
          "name"
        )
        .populate(
          "batchId",
          "name"
        )
        .populate(
          "reviewedBy",
          "name email role"
        );

    if (!registration) {
      return res.status(404).json({
        message:
          "Registration not found",
      });
    }

    return res.status(200).json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error(
      "GET REGISTRATION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load registration",
      error:
        error.message,
    });
  }
};

// =====================================================
// UPDATE REGISTRATION STATUS
// ADMIN
// PATCH /api/registrations/:id/status
// =====================================================

const updateRegistrationStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      rejectionReason,
    } = req.body;

    const validStatuses = [
      "SUBMITTED",
      "SHORTLISTED",
      "INTERVIEWED",
      "ACCEPTED",
      "REJECTED",
    ];

    // =================================================
    // VALIDATE STATUS
    // =================================================

    if (!status) {
      return res.status(400).json({
        message:
          "Status is required",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status",
      });
    }

    // =================================================
    // FIND REGISTRATION
    // =================================================

    const registration =
      await Registration.findById(
        req.params.id
      );

    if (!registration) {
      return res.status(404).json({
        message:
          "Registration not found",
      });
    }

    // =================================================
    // CHECK TRANSITION
    // =================================================

    const currentStatus =
      registration.status;

    const allowedNextStatuses =
      allowedTransitions[
        currentStatus
      ] || [];

    if (
      !allowedNextStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    // =================================================
    // REVIEWER
    // =================================================

    registration.reviewedBy =
      req.user._id;

    registration.reviewedAt =
      new Date();

    // =================================================
    // REJECTION
    // =================================================

    if (status === "REJECTED") {
      registration.rejectionReason =
        rejectionReason?.trim() ||
        "No reason provided";
    }

    // =================================================
    // ACCEPT
    // =================================================

    if (status === "ACCEPTED") {
      const existingUser =
        await User.findOne({
          email:
            registration.email,
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "A user with this email already exists",
        });
      }

      // -----------------------------------------------
      // GENERATE STUDENT ID
      // -----------------------------------------------

      const lastUser =
        await User.findOne({
          userID: {
            $regex:
              /^STU-\d{4}-\d+$/,
          },
        }).sort({
          userID: -1,
        });

      let nextNumber = 1;

      if (lastUser?.userID) {
        const match =
          lastUser.userID.match(
            /(\d+)$/
          );

        if (match) {
          nextNumber =
            parseInt(
              match[1],
              10
            ) + 1;
        }
      }

      const year =
        new Date().getFullYear();

      const userID =
        `STU-${year}-${String(
          nextNumber
        ).padStart(4, "0")}`;

      // -----------------------------------------------
      // GENERATE OTP
      // -----------------------------------------------

      const otp =
        Math.floor(
          100000 +
            Math.random() *
              900000
        ).toString();

      const otpExpiresAt =
        new Date(
          Date.now() +
            24 * 60 * 60 * 1000
        );

      // -----------------------------------------------
      // TEMPORARY PASSWORD
      // -----------------------------------------------

      const temporaryPassword =
        await bcrypt.hash(
          Math.random().toString(36),
          10
        );

      // -----------------------------------------------
      // CREATE USER
      // -----------------------------------------------

      const createdUser =
        await User.create({
          name:
            registration.fullName,

          email:
            registration.email,

          password:
            temporaryPassword,

          role: "student",

          gender:
            registration.gender,

          userID,

          otp,

          otpExpiresAt,

          mustResetPassword: true,
        });

      // -----------------------------------------------
      // UPDATE REGISTRATION
      // -----------------------------------------------

      registration.status =
        "ACCEPTED";

      registration.decidedAt =
        new Date();

      await registration.save();

      // -----------------------------------------------
      // AUDIT LOG
      // -----------------------------------------------

      await createAuditLog({
        actor:
          req.user._id,

        actorRole:
          req.user.role,

        action:
          "STATUS_CHANGE",

        targetType:
          "Registration",

        targetId:
          registration._id.toString(),

        description:
          `${req.user.role} changed registration status from ${currentStatus} to ACCEPTED`,

        metadata: {
          registrationId:
            registration._id.toString(),

          applicantName:
            registration.fullName,

          applicantEmail:
            registration.email,

          previousStatus:
            currentStatus,

          newStatus:
            "ACCEPTED",

          studentUserID:
            createdUser.userID,
        },
      });

      // -----------------------------------------------
      // EMAIL
      // -----------------------------------------------

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
        success: true,

        message: emailSent
          ? "Registration accepted and student account created"
          : "Registration accepted and student account created, but email failed",

        emailSent,

        registration,

        user: {
          userID:
            createdUser.userID,

          name:
            createdUser.name,

          email:
            createdUser.email,

          role:
            createdUser.role,

          gender:
            createdUser.gender,
        },
      });
    }

    // =================================================
    // OTHER STATUS CHANGES
    // =================================================

    registration.status =
      status;

    if (
      status === "SHORTLISTED" ||
      status === "INTERVIEWED"
    ) {
      registration.rejectionReason =
        "";
    }

    if (status === "REJECTED") {
      registration.decidedAt =
        new Date();
    }

    await registration.save();

    // =================================================
    // SEND EMAIL
    // =================================================

    let emailSent = false;

    try {
      if (
        status ===
        "SHORTLISTED"
      ) {
        await sendShortlistedEmail(
          registration
        );

        emailSent = true;
      }

      if (
        status ===
        "REJECTED"
      ) {
        await sendRejectedEmail(
          registration
        );

        emailSent = true;
      }
    } catch (emailError) {
      console.error(
        "Status email error:",
        emailError.message
      );
    }

    // =================================================
    // AUDIT LOG
    // =================================================

    await createAuditLog({
      actor:
        req.user._id,

      actorRole:
        req.user.role,

      action:
        "STATUS_CHANGE",

      targetType:
        "Registration",

      targetId:
        registration._id.toString(),

      description:
        `${req.user.role} changed registration status from ${currentStatus} to ${status}`,

      metadata: {
        registrationId:
          registration._id.toString(),

        applicantName:
          registration.fullName,

        applicantEmail:
          registration.email,

        previousStatus:
          currentStatus,

        newStatus:
          status,
      },
    });

    return res.status(200).json({
      success: true,

      message: emailSent
        ? `Registration status changed to ${status} and email sent`
        : `Registration status changed to ${status}`,

      emailSent,

      registration,
    });
  } catch (error) {
    console.error(
      "STATUS UPDATE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Server error",

      error:
        error.message,
    });
  }
};

// =====================================================
// EXPORT EVERYTHING
// =====================================================

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
};