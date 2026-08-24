const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        message: "Name, email, password, and gender are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      gender,
      accountStatus: "active",
      mustResetPassword: false,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Invited users must complete password setup first
    if (user.accountStatus === "pending" || user.mustResetPassword) {
      return res.status(403).json({
        message: "Please verify your invitation and set your password first",
        mustResetPassword: true,
        accountStatus: user.accountStatus,
        userID: user.userID,
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        message: "Your account is not active",
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

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { userID, otp } = req.body;

    if (!userID || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required",
      });
    }

    const user = await User.findOne({
      userID: userID.trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.mustResetPassword) {
      return res.status(400).json({
        message: "Invitation verification is not required",
      });
    }

    if (user.otpVerified === true) {
      return res.status(400).json({
        message: "OTP has already been used",
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

    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.otpVerified = true;

    await user.save();

    return res.json({
      message: "Invitation verified successfully",
      userID: user.userID,
      role: user.role,
      verified: true,
    });
  } catch (error) {
    console.error("OTP VERIFICATION ERROR:", error);

    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

const setPassword = async (req, res) => {
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

    const user = await User.findOne({
      userID: userID.trim(),
    });

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

    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (!user.otpVerified) {
      return res.status(400).json({
        message: "OTP verification is required first",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustResetPassword = false;
    user.accountStatus = "active";

    // Clear temporary invitation credentials
    user.otp = null;
    user.otpExpiresAt = null;
    user.otpVerified = false;

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

    return res.json({
      message: "Password set successfully",
      token,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    console.error("SET PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Failed to set password",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid user ID",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  setPassword,
  getUserById,
};