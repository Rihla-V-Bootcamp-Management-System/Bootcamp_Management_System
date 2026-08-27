const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const User = require("../models/User");

const router = express.Router();

// =========================================================
// GET ALL USERS
// SUPER ADMIN ONLY
// =========================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware("superadmin"),
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
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

          User.countDocuments(filter),
        ]);

      const totalPages = Math.ceil(
        totalUsers / limit
      );

      return res.json({
        success: true,
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
      console.error(
        "GET USERS ERROR:",
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

// =========================================================
// GET USER BY ID
// AUTHENTICATED USERS
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
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
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
// =========================================================

router.get(
  "/admin/test",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({
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
// ASSIGN STUDENT TO MENTOR
// ADMIN ONLY
// =========================================================

router.patch(
  "/students/:studentId/mentor",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { mentorId } = req.body;

      // ===================================================
      // VALIDATE MENTOR ID
      // ===================================================

      if (!mentorId) {
        return res.status(400).json({
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
          message: "Student not found",
        });
      }

      // ===================================================
      // VALIDATE STUDENT ROLE
      // ===================================================

      if (student.role !== "student") {
        return res.status(400).json({
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
          message: "Mentor not found",
        });
      }

      // ===================================================
      // VALIDATE MENTOR ROLE
      // ===================================================

      if (mentor.role !== "mentor") {
        return res.status(400).json({
          message: "This user is not a mentor",
        });
      }

      // ===================================================
      // ASSIGN MENTOR
      // ===================================================

      student.assignedMentor = mentor._id;

      await student.save();

      // ===================================================
      // GET UPDATED STUDENT
      // ===================================================

      const updatedStudent =
        await User.findById(student._id)
          .select("-password -otp")
          .populate(
            "assignedMentor",
            "userID name email role"
          );

      return res.json({
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