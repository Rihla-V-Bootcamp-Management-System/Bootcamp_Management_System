const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
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
          message: "Name, email, and role are required",
        });
      }

      const allowedRoles = ["admin", "superadmin", "mentor"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message:
            "Invalid role. You can only assign admin, superadmin, or mentor",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(400).json({
          message: "A user with this email already exists",
        });
      }

      const rolePrefix = {
        admin: "ADM",
        superadmin: "SADM",
        mentor: "MTR",
      };

      const prefix = rolePrefix[role];

      const lastUser = await User.findOne({
        userID: {
          $regex: new RegExp(`^${prefix}-\\d{4}-\\d+$`),
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

      const userID = `${prefix}-${year}-${String(nextNumber).padStart(
        4,
        "0"
      )}`;

      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const otpExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );

      const temporaryPassword = await bcrypt.hash(
        Math.random().toString(36) +
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
        accountStatus: "pending",
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
        description: `Super Admin invited ${role} ${user.name}`,
        metadata: {
          userID: user.userID,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
          emailSent,
        },
      });

      return res.status(201).json({
        message: emailSent
          ? `${role} invited successfully and invitation email sent`
          : `${role} invited successfully but invitation email failed`,
        emailSent,
        user: {
          id: user._id,
          userID: user.userID,
          name: user.name,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
          mustResetPassword: user.mustResetPassword,
          otpExpiresAt: user.otpExpiresAt,
        },
      });
    } catch (error) {
      console.error("SUPER ADMIN ASSIGN ERROR:", error);

      return res.status(500).json({
        message: "Failed to invite user",
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
        .select("-password -otp -invitationToken")
        .sort({ createdAt: -1 });

      return res.json({
        count: users.length,
        users,
      });
    } catch (error) {
      console.error("SUPER ADMIN GET USERS ERROR:", error);

      return res.status(500).json({
        message: "Failed to get users",
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
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user._id.toString() === req.user._id.toString()) {
        return res.status(403).json({
          message: "You cannot delete your own account",
        });
      }

      if (!["admin", "mentor", "superadmin"].includes(user.role)) {
        return res.status(403).json({
          message:
            "Only Admin, Mentor, and Super Admin users assigned by Super Admin can be deleted",
        });
      }

      const deletedUser = {
        id: user._id.toString(),
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      await User.findByIdAndDelete(user._id);

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
        message: `${deletedUser.role} deleted successfully`,
        deletedUser,
      });
    } catch (error) {
      console.error("SUPER ADMIN DELETE USER ERROR:", error);

      return res.status(500).json({
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
        .populate("actor", "userID name email role")
        .sort({ createdAt: -1 });

      return res.json({
        count: logs.length,
        logs,
      });
    } catch (error) {
      console.error("SUPER ADMIN GET AUDIT LOGS ERROR:", error);

      return res.status(500).json({
        message: "Failed to get audit logs",
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
        admins,
        superadmins,
        mentors,
        pendingApplications,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "superadmin" }),
        User.countDocuments({ role: "mentor" }),
        Registration.countDocuments({
          status: {
            $in: ["Submitted", "Shortlisted"],
          },
        }),
      ]);

      return res.json({
        totalUsers,
        students,
        admins,
        superadmins,
        mentors,
        pendingApplications,
      });
    } catch (error) {
      console.error("SUPER ADMIN STATS ERROR:", error);

      return res.status(500).json({
        message: "Failed to get dashboard statistics",
        error: error.message,
      });
    }
  }
);

module.exports = router;