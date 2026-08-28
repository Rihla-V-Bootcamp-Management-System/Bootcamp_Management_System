const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const User = require("../models/User");

const router = express.Router();

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

module.exports = router;