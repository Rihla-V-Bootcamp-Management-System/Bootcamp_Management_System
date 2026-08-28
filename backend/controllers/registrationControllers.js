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

    let effectiveSeasonId = seasonId;
    let effectiveBatchId = batchId;

    // Auto-resolve Season if missing
    if (!effectiveSeasonId || !mongoose.Types.ObjectId.isValid(effectiveSeasonId)) {
      const Season = mongoose.models.Season || mongoose.model("Season", new mongoose.Schema({ name: String, isOpen: Boolean }, { timestamps: true }));
      let activeSeason = await Season.findOne({ isOpen: true }).sort({ createdAt: -1 });
      if (!activeSeason) {
        activeSeason = await Season.findOne().sort({ createdAt: -1 });
      }
      if (!activeSeason) {
        activeSeason = await Season.create({ name: "Bootcamp Season 1", isOpen: true });
      }
      effectiveSeasonId = activeSeason._id;
    }

    // Auto-resolve Batch if missing
    if (!effectiveBatchId || !mongoose.Types.ObjectId.isValid(effectiveBatchId)) {
      const Batch = mongoose.models.Batch || mongoose.model("Batch", new mongoose.Schema({ name: String }, { timestamps: true }));
      let activeBatch = await Batch.findOne().sort({ createdAt: -1 });
      if (!activeBatch) {
        activeBatch = await Batch.create({ name: "Batch 1" });
      }
      effectiveBatchId = activeBatch._id;
    }

    // 3. REQUIRED CORE FIELDS
    if (!fullName || !email || !phoneNumber || !telegramUsername) {
      return res.status(400).json({
        message: "Full name, email, phone number, and telegram username are required",
      });
    }

    // 4. GENDER
    const normalizedGender = gender && String(gender).toLowerCase() === "female" ? "Female" : "Male";

    // 5. EDUCATION LEVEL
    const parsedEducationLevel = Number(educationLevel);
    const validEducationLevel =
      !Number.isNaN(parsedEducationLevel) && parsedEducationLevel >= 1 && parsedEducationLevel <= 5
        ? parsedEducationLevel
        : 1;

    // 6. HOURS PER WEEK & COMMITMENT
    const parsedHours = Number(hoursPerWeek);
    const validHoursPerWeek = !Number.isNaN(parsedHours) && parsedHours > 0 ? parsedHours : 35;
    const validCommitment = canCommitFiveHoursPerDay !== false;

    // 8. RESPONSES
    if (responses !== undefined && (typeof responses !== "object" || Array.isArray(responses))) {
      return res.status(400).json({
        message: "responses must be an object",
      });
    }

    // 9. FIND APPLICATION FORM (OPTIONAL)
    const applicationForm = await ApplicationForm.findOne({
      seasonId: new mongoose.Types.ObjectId(effectiveSeasonId),
    });

    // 10. VALIDATE DYNAMIC RESPONSES (IF FORM EXISTS)
    const submittedResponses = responses || {};

    if (applicationForm && Array.isArray(applicationForm.fields)) {
      for (const field of applicationForm.fields) {
        const fieldId = field.id || field._id?.toString();
        const value = submittedResponses[fieldId];

        if (
          field.required &&
          (value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0))
        ) {
          return res.status(400).json({
            message: `${field.label} is required`,
          });
        }
      }
    }

    // 11. NORMALIZE EMAIL
    const normalizedEmail = email.trim().toLowerCase();

    // 12. DUPLICATE APPLICATION
    const existingRegistration = await Registration.findOne({
      email: normalizedEmail,
      seasonId: effectiveSeasonId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You have already applied for this season.",
      });
    }

    // 13. CREATE REGISTRATION
    const registration = await Registration.create({
      seasonId: effectiveSeasonId,
      batchId: effectiveBatchId,
      fullName: fullName.trim(),
      gender: normalizedGender,
      email: normalizedEmail,
      phoneNumber: (phoneNumber || "").trim(),
      telegramUsername: (telegramUsername || "").trim(),
      educationLevel: validEducationLevel,
      educationInstitution: educationInstitution || "Other",
      fieldOfStudy: fieldOfStudy || "Other",
      studentId: (studentId || "N/A").trim(),
      programmingExperience: programmingExperience || "Beginner",
      githubLink: (githubLink || "").trim(),
      codeforcesLink: (codeforcesLink || "").trim(),
      leetcodeLink: (leetcodeLink || "").trim(),
      hoursPerWeek: validHoursPerWeek,
      canCommitFiveHoursPerDay: validCommitment,
      motivation: (motivation || "").trim(),
      responses: submittedResponses,
      status: "SUBMITTED",
      submittedAt: new Date(),
    });

    console.log("REGISTRATION CREATED:", registration._id);

    return res.status(201).json({
      success: true,
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email has already been registered for this season",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Registration validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Failed to submit registration",
      error: error.message,
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

    const registrations = await Registration.find({})
      .populate("seasonId", "name")
      .populate("batchId", "name")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error("GET REGISTRATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load registrations",
      error: error.message,
    });
  }
};

// =====================================================
// GET REGISTRATION BY ID
// ADMIN
// GET /api/registrations/:id
// =====================================================

const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid registration ID",
      });
    }

    const registration = await Registration.findById(id)
      .populate("seasonId", "name")
      .populate("batchId", "name")
      .populate("reviewedBy", "name email role");

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    return res.status(200).json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error("GET REGISTRATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to load registration",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE REGISTRATION STATUS
// ADMIN
// PATCH /api/registrations/:id/status
// =====================================================

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

    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();

    if (status === "REJECTED") {
      registration.rejectionReason = rejectionReason?.trim() || "No reason provided";
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
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      const year = new Date().getFullYear();
      const userID = `STU-${year}-${String(nextNumber).padStart(4, "0")}`;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const temporaryPassword = await bcrypt.hash(
        Math.random().toString(36),
        10
      );

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

      registration.status = "ACCEPTED";
      registration.decidedAt = new Date();

      await registration.save();

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

      let emailSent = false;

      try {
        await sendAcceptedEmail(registration, createdUser);
        emailSent = true;
      } catch (emailError) {
        console.error("Accepted email error:", emailError.message);
      }

      return res.status(200).json({
        success: true,
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

    // OTHER STATUS CHANGES (SHORTLISTED, INTERVIEWED, REJECTED)
    registration.status = status;

    if (status === "SHORTLISTED" || status === "INTERVIEWED") {
      registration.rejectionReason = "";
    }

    if (status === "REJECTED") {
      registration.decidedAt = new Date();
    }

    await registration.save();

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
      console.error("Status email error:", emailError.message);
    }

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
      success: true,
      message: emailSent
        ? `Registration status changed to ${status} and email sent`
        : `Registration status changed to ${status}`,
      emailSent,
      registration,
    });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
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