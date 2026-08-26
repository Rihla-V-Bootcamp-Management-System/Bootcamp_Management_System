const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =========================================================
// REGISTER USER
// =========================================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;

    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        message: "Name, email, password, and gender are required",
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
      gender,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        userID: user.userID,
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

// =========================================================
// LOGIN USER
// =========================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("========== LOGIN ATTEMPT ==========");
    console.log("Email received:", email);
    console.log("Password received:", password ? "YES" : "NO");

    // -----------------------------------------
    // Validate input
    // -----------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // -----------------------------------------
    // Find user
    // -----------------------------------------

    const user = await User.findOne({ email });

    console.log("User found:", !!user);

    // -----------------------------------------
    // User not found
    // -----------------------------------------

    if (!user) {
      console.log("LOGIN FAILED: User not found");

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log("User email:", user.email);
    console.log("User role:", user.role);
    console.log("Password exists:", !!user.password);
    console.log("Must reset password:", user.mustResetPassword);

    // -----------------------------------------
    // Password reset required
    // -----------------------------------------

    if (user.mustResetPassword) {
      console.log("LOGIN BLOCKED: Password setup required");

      return res.status(403).json({
        message: "Password setup required",
        mustResetPassword: true,
        userID: user.userID,
      });
    }

    // -----------------------------------------
    // Check password
    // -----------------------------------------

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      console.log("LOGIN FAILED: Password does not match");

      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // -----------------------------------------
    // Create JWT
    // -----------------------------------------

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

    console.log("LOGIN SUCCESS:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // -----------------------------------------
    // Return response
    // -----------------------------------------

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

// =========================================================
// VERIFY OTP
// =========================================================

const verifyOtp = async (req, res) => {
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

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.otpVerified = true;

    await user.save();

    return res.json({
      message: "OTP verified successfully",
      userID: user.userID,
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

// =========================================================
// SET PASSWORD
// =========================================================

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

    if (!user.otpVerified) {
      return res.status(400).json({
        message: "OTP verification is required first",
      });
    }

    // -----------------------------------------
    // Hash new password
    // -----------------------------------------

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;
    user.mustResetPassword = false;
    user.otp = null;
    user.otpExpiresAt = null;
    user.otpVerified = false;

    await user.save();

    // -----------------------------------------
    // Create JWT
    // -----------------------------------------

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

// =========================================================
// GET USER BY ID
// =========================================================

const getUserById = async (req, res) => {
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

    return res.json({
      user,
    });
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);

    return res.status(400).json({
      message: "Invalid user ID",
    });
  }
};

// =========================================================
// GET USERS
// PAGINATION + SEARCH + ROLE + GENDER
// SUPER ADMIN ONLY
// =========================================================

const getUsers = async (req, res) => {
  try {
    // -----------------------------------------
    // Pagination
    // -----------------------------------------

    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit) || 10,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    // -----------------------------------------
    // Query filters
    // -----------------------------------------

    const { search, role, gender } = req.query;

    const filter = {};

    // -----------------------------------------
    // Role filter
    // -----------------------------------------

    if (role) {
      filter.role = role;
    }

    // -----------------------------------------
    // Gender filter
    // -----------------------------------------

    if (gender) {
      filter.gender = gender;
    }

    // -----------------------------------------
    // Search
    // Name OR Email
    // -----------------------------------------

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

    // -----------------------------------------
    // Get users + total count
    // -----------------------------------------

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate(
          "assignedMentor",
          "userID name email role"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    // -----------------------------------------
    // Pagination information
    // -----------------------------------------

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
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  setPassword,
  getUserById,
  getUsers,
};