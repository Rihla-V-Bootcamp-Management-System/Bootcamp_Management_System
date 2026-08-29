const express = require("express");
const bcrypt = require("bcryptjs");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const User = require("../models/User");

const router = express.Router();

// =========================================================
// GET SELF PROFILE (All Roles)
// GET /api/users/profile/me
// =========================================================

router.get("/profile/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -otp")
      .populate("batchId", "name startDate sessionStartTime sessionEndTime")
      .populate("assignedMentor", "name email role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});

// =========================================================
// CHANGE SELF PASSWORD (All Roles)
// PATCH /api/users/profile/change-password
// =========================================================

router.patch("/profile/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If user already had a password set, verify currentPassword
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password does not match",
        });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustResetPassword = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
});

// =========================================================
// GET ALL USERS
// ADMIN + SUPERADMIN
// GET /api/users
// =========================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const page = Math.max(
        parseInt(req.query.page, 10) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          parseInt(req.query.limit, 10) || 10,
          1
        ),
        100
      );

      const skip = (page - 1) * limit;

      const {
        search,
        role,
        gender,
      } = req.query;

      const filter = {};

      // =====================================================
      // ROLE FILTER
      // =====================================================

      if (role) {
        filter.role = role;
      }

      // =====================================================
      // GENDER FILTER
      // =====================================================

      if (gender) {
        filter.gender = gender;
      }

      // =====================================================
      // SEARCH
      // =====================================================

      if (search) {
        filter.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      // =====================================================
      // GET USERS
      // =====================================================

      const [users, totalUsers] =
        await Promise.all([
          User.find(filter)
            .select("-password -otp")
            .populate(
              "assignedMentor",
              "userID name email role"
            )
            .populate(
              "batchId",
              "name"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

          User.countDocuments(filter),
        ]);

      const totalPages = Math.max(
        Math.ceil(totalUsers / limit),
        1
      );

      return res.status(200).json({
        success: true,
        total: totalUsers,
        users,

        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      console.error("GET USERS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load users",
        error: error.message,
      });
    }
  }
);

// =========================================================
// GET USER BY ID
// GET /api/users/:id
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.params.id
      )
        .select("-password -otp")
        .populate(
          "assignedMentor",
          "userID name email role"
        )
        .populate(
          "batchId",
          "name"
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(
        "GET USER ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }
  }
);


// =========================================================
// ADMIN TEST
// GET /api/users/admin/test
// =========================================================

router.get(
  "/admin/test",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin access granted",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);

// =========================================================
// ASSIGN MENTOR TO STUDENT
// PATCH /api/users/students/:studentId/mentor
// =========================================================

router.patch(
  "/students/:studentId/mentor",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const { mentorId } = req.body;

      // ===================================================
      // VALIDATE MENTOR ID
      // ===================================================

      if (!mentorId) {
        return res.status(400).json({
          success: false,
          message: "Mentor ID is required",
        });
      }

      // ===================================================
      // FIND STUDENT
      // ===================================================

      const student = await User.findById(
        req.params.studentId
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // ===================================================
      // VALIDATE STUDENT
      // ===================================================

      if (
        String(student.role).toLowerCase() !==
        "student"
      ) {
        return res.status(400).json({
          success: false,
          message: "This user is not a student",
        });
      }

      // ===================================================
      // FIND MENTOR
      // ===================================================

      const mentor = await User.findById(
        mentorId
      );

      if (!mentor) {
        return res.status(404).json({
          success: false,
          message: "Mentor not found",
        });
      }

      // ===================================================
      // VALIDATE MENTOR
      // ===================================================

      if (
        String(mentor.role).toLowerCase() !==
        "mentor"
      ) {
        return res.status(400).json({
          success: false,
          message: "This user is not a mentor",
        });
      }

      // ===================================================
      // ASSIGN
      // ===================================================

      student.assignedMentor = mentor._id;

      await student.save();

      // ===================================================
      // UPDATED STUDENT
      // ===================================================

      const updatedStudent =
        await User.findById(student._id)
          .select("-password -otp")
          .populate(
            "assignedMentor",
            "userID name email role"
          )
          .populate(
            "batchId",
            "name"
          );

      return res.status(200).json({
        success: true,
        message: "Mentor assigned successfully",
        student: updatedStudent,
      });
    } catch (error) {
      console.error(
        "ASSIGN MENTOR ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to assign mentor",
        error: error.message,
      });
    }
  }
);

// =========================================================
// CREATE NEW USER ACCOUNT
// POST /api/users
// =========================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const { name, email, password, role, gender, batchId } = req.body;


      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role || "student",
        gender: gender || "Male",
        batchId: batchId || undefined,
        accountStatus: "active",
        mustResetPassword: false,
      });

      const populatedUser = await User.findById(user._id)
        .select("-password -otp")
        .populate("batchId", "name");

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: populatedUser,
      });
    } catch (error) {
      console.error("CREATE USER ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: error.message,
      });
    }
  }
);

// =========================================================
// UPDATE USER DETAILS (NAME, EMAIL, ROLE, BATCH)
// PUT /api/users/:id
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const { name, email, role, gender, batchId, status, accountStatus } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        (user.role === "admin" || user.role === "superadmin" || role === "admin" || role === "superadmin") &&
        req.user.role !== "superadmin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Only Superadmins have the privilege to update or assign batches for Admin accounts.",
        });
      }

      if (name) user.name = name.trim();
      if (email) user.email = email.trim().toLowerCase();
      if (role) user.role = role;
      if (gender) user.gender = gender;
      if (status || accountStatus) user.accountStatus = status || accountStatus;

      if (batchId !== undefined) {
        user.batchId = batchId ? batchId : null;
      }

      await user.save();

      const updatedUser = await User.findById(user._id)
        .select("-password -otp")
        .populate("batchId", "name")
        .populate("assignedMentor", "name email role");

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("UPDATE USER ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: error.message,
      });
    }
  }
);

// =========================================================
// ASSIGN / CHANGE BATCH FOR USER
// PATCH /api/users/:id/batch
// =========================================================

router.patch(
  "/:id/batch",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const { batchId } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }


      if (
        (user.role === "admin" || user.role === "superadmin") &&
        req.user.role !== "superadmin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Only Superadmins have the privilege to update or assign batches for Admin accounts.",
        });
      }

      user.batchId = batchId ? batchId : null;
      await user.save();

      const updatedUser = await User.findById(user._id)
        .select("-password -otp")
        .populate("batchId", "name");

      return res.status(200).json({
        success: true,
        message: "Batch assigned successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("ASSIGN BATCH ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to assign batch",
        error: error.message,
      });
    }
  }
);

const {
  sendSuspensionEmail,
  sendWarningEmail,
  sendAdminPasswordResetEmail,
  sendAccountDeletionEmail,
} = require("../services/emailService");

// =========================================================
// ISSUE WARNING TO USER (ADMIN & SUPERADMIN)
// POST /api/users/:id/warn
// =========================================================

router.post(
  "/:id/warn",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const { reason } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: "A reason is mandatory when issuing a warning to a student or user.",
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        (user.role === "admin" || user.role === "superadmin") &&
        req.user.role !== "superadmin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Only Superadmins can issue warnings to Admin accounts.",
        });
      }

      if (!Array.isArray(user.warnings)) {
        user.warnings = [];
      }

      user.warnings.push({
        reason: reason.trim(),
        warnedBy: req.user._id,
        warnedAt: new Date(),
      });

      await user.save();

      // Send automated warning email
      try {
        await sendWarningEmail({
          to: user.email,
          name: user.name,
          reason: reason.trim(),
          warningNumber: user.warnings.length,
        });
      } catch (mailErr) {
        console.error("WARNING EMAIL ERROR:", mailErr.message);
      }

      return res.status(200).json({
        success: true,
        message: `Official warning #${user.warnings.length} issued and notification email sent to ${user.email}.`,
        warnings: user.warnings,
      });
    } catch (error) {
      console.error("ISSUE WARNING ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to issue warning",
        error: error.message,
      });
    }
  }
);

// =========================================================
// TOGGLE USER STATUS (ACTIVE / SUSPENDED / DISABLED)
// PATCH /api/users/:id/status
// =========================================================

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const { status, reason } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        (user.role === "admin" || user.role === "superadmin") &&
        req.user.role !== "superadmin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Only Superadmins have the privilege to modify status for Admin accounts.",
        });
      }

      const targetStatus = status || (user.accountStatus === "suspended" || user.accountStatus === "disabled" ? "active" : "suspended");

      if (targetStatus === "suspended" || targetStatus === "disabled") {
        if (!reason || !reason.trim()) {
          return res.status(400).json({
            success: false,
            message: "A mandatory reason is required to suspend or disable an account.",
          });
        }
        user.suspensionReason = reason.trim();
      } else {
        user.suspensionReason = "";
      }

      user.accountStatus = targetStatus;
      await user.save();

      // Send suspension email if suspended
      if (targetStatus === "suspended" || targetStatus === "disabled") {
        try {
          await sendSuspensionEmail({
            to: user.email,
            name: user.name,
            reason: user.suspensionReason,
          });
        } catch (mailErr) {
          console.error("SUSPENSION EMAIL ERROR:", mailErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: `User status changed to ${targetStatus}${user.suspensionReason ? " and notification email dispatched." : "."}`,
        status: user.accountStatus,
      });
    } catch (error) {
      console.error("TOGGLE USER STATUS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update user status",
        error: error.message,
      });
    }
  }
);

// =========================================================
// RESET USER PASSWORD (ADMIN ACTION WITH MANDATORY REASON)
// PATCH /api/users/:id/reset-password
// =========================================================

router.patch(
  "/:id/reset-password",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const { password, newPassword, reason } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: "A reason is mandatory when resetting a user's password.",
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        (user.role === "admin" || user.role === "superadmin") &&
        req.user.role !== "superadmin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Only Superadmins have the privilege to reset password for Admin accounts.",
        });
      }

      const temporaryPassword = password || newPassword || `Pass#${Math.floor(100000 + Math.random() * 900000)}`;
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
      user.password = hashedPassword;
      user.mustResetPassword = true;
      await user.save();

      // Send email with temporary password & reason
      try {
        await sendAdminPasswordResetEmail({
          to: user.email,
          name: user.name,
          temporaryPassword,
          reason: reason.trim(),
        });
      } catch (mailErr) {
        console.error("PASSWORD RESET EMAIL ERROR:", mailErr.message);
      }

      return res.status(200).json({
        success: true,
        message: `User password reset successfully. Temporary credentials sent to ${user.email}.`,
        temporaryPassword,
      });
    } catch (error) {
      console.error("RESET USER PASSWORD ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to reset password",
        error: error.message,
      });
    }
  }
);

// =========================================================
// DELETE USER ACCOUNT WITH MANDATORY REASON
// DELETE /api/users/:id
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  async (req, res) => {
    try {
      const reason = req.body?.reason || req.query?.reason;

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: "A reason is mandatory before permanently deleting a user account.",
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        (user.role === "admin" || user.role === "superadmin") &&
        req.user.role !== "superadmin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Only Superadmins have the privilege to delete Admin accounts.",
        });
      }

      // Send deletion notice email before deleting
      try {
        await sendAccountDeletionEmail({
          to: user.email,
          name: user.name,
          reason: reason.trim(),
        });
      } catch (mailErr) {
        console.error("DELETION EMAIL ERROR:", mailErr.message);
      }

      await User.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        success: true,
        message: `User account deleted successfully and notification email sent to ${user.email}.`,
      });
    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }
);

module.exports = router;