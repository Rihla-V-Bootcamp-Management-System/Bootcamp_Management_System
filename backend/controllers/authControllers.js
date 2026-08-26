const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================================
// REGISTER STUDENT
// POST /api/auth/register
// =====================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
    } = req.body;

    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        message:
          "Name, email, password, and gender are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
      gender,
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

// =====================================================
// REGISTER MENTOR
// POST /api/auth/register-mentor
// =====================================================

const registerMentor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      telegramUsername,
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !telegramUsername
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, phone number, and Telegram username are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedTelegram =
      telegramUsername
        .trim()
        .replace(/^@/, "");

    // -------------------------------
    // CHECK EMAIL
    // -------------------------------

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // -------------------------------
    // CHECK PHONE
    // -------------------------------

    const existingPhone = await User.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    // -------------------------------
    // CHECK TELEGRAM
    // -------------------------------

    const existingTelegram = await User.findOne({
      telegramUsername: normalizedTelegram,
    });

    if (existingTelegram) {
      return res.status(400).json({
        success: false,
        message:
          "Telegram username is already registered",
      });
    }

    // -------------------------------
    // HASH PASSWORD
    // -------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // -------------------------------
    // CREATE MENTOR
    // -------------------------------

    const mentor = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      role: "mentor",

      phone: phone.trim(),

      telegramUsername:
        normalizedTelegram,

      mustResetPassword: false,
    });

    return res.status(201).json({
      success: true,
      message: "Mentor registered successfully",

      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        phone: mentor.phone,
        telegramUsername:
          mentor.telegramUsername,
        role: mentor.role,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER MENTOR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Mentor registration failed",
      error: error.message,
    });
  }
};

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    if (user.mustResetPassword) {
      return res.status(403).json({
        message: "Password setup required",
        mustResetPassword: true,
        userId: user._id,
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
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
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        phone: user.phone,
        telegramUsername:
          user.telegramUsername,
        batchId: user.batchId,
        assignedMentor:
          user.assignedMentor,
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

// =====================================================
// GET USER BY ID
// GET /api/auth/users/:id
// =====================================================

const getUserById = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.params.id
      ).select("-password");

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

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  registerUser,
  registerMentor,
  loginUser,
  getUserById,
};