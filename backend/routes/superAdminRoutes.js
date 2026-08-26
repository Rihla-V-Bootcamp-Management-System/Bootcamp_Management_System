const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Batch = require("../models/Batch");
const Registration = require("../models/Registration");
const AuditLog = require("../models/AuditLog");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const { sendStaffInvitationEmail } = require("../services/emailService");
const { createAuditLog } = require("../services/auditLogService");

const router = express.Router();

router.post(
  "/assign",
  authMiddleware,
  roleMiddleware("superadmin"),
  async (req, res) => {
    try {
      const { name, email, role } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and role are required",
        });
      }

      if (!["admin", "mentor"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Super Admin can only assign admin or mentor",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists",
        });
      }

      const lastUser = await User.findOne({
        userID: {
          $regex:
            role === "admin"
              ? /^ADM-\d{4}-\d+$/
              : /^MTR-\d{4}-\d+$/,
        },
      }).sort({ userID: -1 });

      let nextNumber = 1;

      if (lastUser && lastUser.userID) {
        const match = lastUser.userID.match(/(\d+)$/);

        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }

      const year = new Date().getFullYear();

      const prefix =
        role === "admin"
          ? "ADM"
          : "MTR";

      const userID = `${prefix}-${year}-${String(
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

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: temporaryPassword,
        role,
        userID,
        otp,
        otpExpiresAt,
        otpVerified: false,
        mustResetPassword: true,
      });

      let emailSent = false;

      try {
        await sendStaffInvitationEmail(user);
        emailSent = true;
      } catch (emailError) {
        console.error(
          "STAFF INVITATION EMAIL ERROR:",
          emailError.message
        );
      }

      await createAuditLog({
        actor: req.user._id,
        actorRole: req.user.role,
        action: "ASSIGN_STAFF",
        targetType: "User",
        targetId: user._id.toString(),
        description: `Super Admin assigned ${role} ${user.name}`,
        metadata: {
          userID: user.userID,
          email: user.email,
          role: user.role,
          emailSent,
        },
      });

      return res.status(201).json({
        success: true,
        message: emailSent
          ? `${role} assigned successfully and invitation email sent`
          : `${role} assigned successfully but invitation email failed`,
        emailSent,
        user: {
          id: user._id,
          userID: user.userID,
          name: user.name,
          email: user.email,
          role: user.role,
          batchId: user.batchId,
          mustResetPassword: user.mustResetPassword,
          otpExpiresAt: user.otpExpiresAt,
        },
      });
    } catch (error) {
      console.error(
        "SUPER ADMIN ASSIGN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to assign user",
        error: error.message,
      });
    }
  }
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("superadmin"),
  async (req, res) => {
    try {
      const users = await User.find({})
        .select("-password -otp")
        .populate(
          "batchId",
          "name year season status"
        )
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      console.error(
        "SUPER ADMIN GET USERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get users",
        error: error.message,
      });
    }
  }
);

router.patch(
  "/users/:id/batch",
  authMiddleware,
  roleMiddleware("superadmin"),
  async (req, res) => {
    try {
      const { batchId } = req.body;

      if (!batchId) {
        return res.status(400).json({
          success: false,
          message: "Batch ID is required",
        });
      }

      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role !== "admin") {
        return res.status(400).json({
          success: false,
          message:
            "Only an admin can be assigned to a batch",
        });
      }

      const batch = await Batch.findById(
        batchId
      );

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      user.batchId = batch._id;

      await user.save();

      await createAuditLog({
        actor: req.user._id,
        actorRole: req.user.role,
        action: "ASSIGN_ADMIN_TO_BATCH",
        targetType: "User",
        targetId: user._id.toString(),
        description: `Super Admin assigned admin ${user.name} to batch ${batch.name}`,
        metadata: {
          adminId: user._id.toString(),
          adminEmail: user.email,
          batchId: batch._id.toString(),
          batchName: batch.name,
        },
      });

      return res.status(200).json({
        success: true,
        message:
          "Admin assigned to batch successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          batchId: user.batchId,
        },
        batch: {
          id: batch._id,
          name: batch.name,
          year: batch.year,
          season: batch.season,
          status: batch.status,
        },
      });
    } catch (error) {
      console.error(
        "ASSIGN ADMIN TO BATCH ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to assign admin to batch",
        error: error.message,
      });
    }
  }
);

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("superadmin"),
  async (req, res) => {
    try {
      const user = await User.findById(
        req.params.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (
        user._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot delete your own account",
        });
      }

      if (user.role === "superadmin") {
        return res.status(403).json({
          success: false,
          message:
            "Super Admin users cannot be deleted",
        });
      }

      if (
        !["admin", "mentor"].includes(
          user.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only Admin and Mentor users assigned by Super Admin can be deleted",
        });
      }

      const deletedUser = {
        id: user._id.toString(),
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      await User.findByIdAndDelete(
        user._id
      );

      await createAuditLog({
        actor: req.user._id,
        actorRole: req.user.role,
        action: "DELETE_STAFF",
        targetType: "User",
        targetId: deletedUser.id,
        description: `Super Admin deleted ${deletedUser.role} ${deletedUser.name}`,
        metadata: {
          userID: deletedUser.userID,
          email: deletedUser.email,
          role: deletedUser.role,
        },
      });

      return res.json({
        success: true,
        message: `${deletedUser.role} deleted successfully`,
        deletedUser,
      });
    } catch (error) {
      console.error(
        "SUPER ADMIN DELETE USER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }
);

router.get(
  "/audit-logs",
  authMiddleware,
  roleMiddleware("superadmin"),
  async (req, res) => {
    try {
      const logs = await AuditLog.find()
        .populate(
          "actor",
          "userID name email role"
        )
        .sort({
          createdAt: -1,
        });

      return res.json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (error) {
      console.error(
        "SUPER ADMIN GET AUDIT LOGS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get audit logs",
        error: error.message,
      });
    }
  }
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("superadmin"),
  async (req, res) => {
    try {
      const [
        totalUsers,
        students,
        mentors,
        pendingApplications,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({
          role: "student",
        }),
        User.countDocuments({
          role: "mentor",
        }),
        Registration.countDocuments({
          status: {
            $in: [
              "Submitted",
              "Shortlisted",
            ],
          },
        }),
      ]);

      return res.json({
        success: true,
        totalUsers,
        students,
        mentors,
        pendingApplications,
      });
    } catch (error) {
      console.error(
        "SUPER ADMIN STATS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to get dashboard statistics",
        error: error.message,
      });
    }
  }
);

module.exports = router;