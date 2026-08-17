const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.mustResetPassword) {
      return res.status(403).json({
        message: "Password setup required",
        mustResetPassword: true,
        userID: user.userID,
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

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userID: user.userID,
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

router.post("/verify-otp", async (req, res) => {
  try {
    const { userID, otp } = req.body;

    if (!userID || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required",
      });
    }

    const user = await User.findOne({ userID });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.mustResetPassword) {
      return res.status(400).json({
        message: "OTP verification is not required",
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "No valid OTP found",
      });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    res.json({
      message: "OTP verified successfully",
      userID: user.userID,
      verified: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

router.post("/set-password", async (req, res) => {
  try {
    const { userID, otp, newPassword } = req.body;

    if (!userID || !otp || !newPassword) {
      return res.status(400).json({
        message: "User ID, OTP, and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const user = await User.findOne({ userID });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.mustResetPassword) {
      return res.status(400).json({
        message: "Password has already been set",
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "No valid OTP found",
      });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustResetPassword = false;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Password set successfully",
      token,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("SET PASSWORD ERROR:", error);

    res.status(500).json({
      message: "Failed to set password",
      error: error.message,
    });
  }
});

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        user,
      });
    } catch (error) {
      res.status(400).json({
        message: "Invalid user ID",
      });
    }
  }
);

module.exports = router;