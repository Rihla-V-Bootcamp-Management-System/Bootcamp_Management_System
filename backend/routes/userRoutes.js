const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  console.log("LOGIN ROUTE HIT");

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate(
        "assignedMentor",
        "userID name email role"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);

    res.status(400).json({
      message: "Invalid user ID",
    });
  }
});

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

router.patch(
  "/students/:studentId/mentor",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { mentorId } = req.body;

      if (!mentorId) {
        return res.status(400).json({
          message: "Mentor ID is required",
        });
      }

      const student = await User.findById(req.params.studentId);

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      if (student.role !== "student") {
        return res.status(400).json({
          message: "This user is not a student",
        });
      }

      const mentor = await User.findById(mentorId);

      if (!mentor) {
        return res.status(404).json({
          message: "Mentor not found",
        });
      }

      if (mentor.role !== "mentor") {
        return res.status(400).json({
          message: "This user is not a mentor",
        });
      }

      student.assignedMentor = mentor._id;

      await student.save();

      const updatedStudent = await User.findById(student._id)
        .select("-password")
        .populate(
          "assignedMentor",
          "userID name email role"
        );

      return res.json({
        message: "Mentor assigned successfully",
        student: updatedStudent,
      });
    } catch (error) {
      console.error("ASSIGN MENTOR ERROR:", error);

      return res.status(500).json({
        message: "Failed to assign mentor",
        error: error.message,
      });
    }
  }
);

module.exports = router;