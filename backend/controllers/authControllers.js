
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =========================================================
// REGISTER USER
// =========================================================

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
        success: false,
        message:
          "Name, email, password, and gender are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
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
      accountStatus: "active",
      mustResetPassword: false,
    });

    return res.status(201).json({
      success: true,
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
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// =========================================================
// REGISTER MENTOR
// POST /api/auth/register-mentor
// =========================================================

const registerMentor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      telegramUsername,
    } = req.body;

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

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const normalizedTelegram =
      telegramUsername
        .trim()
        .replace(/^@/, "");

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const existingPhone = await User.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

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

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const mentor = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "mentor",
      phone: phone.trim(),
      telegramUsername: normalizedTelegram,
      mustResetPassword: false,
      accountStatus: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Mentor registered successfully",
      mentor: {
        id: mentor._id,
        userID: mentor.userID,
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

// =========================================================
// LOGIN
// POST /api/auth/login
// =========================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("========== LOGIN ATTEMPT ==========");
    console.log("Email received:", email);
    console.log(
      "Password received:",
      password ? "YES" : "NO"
    );

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    console.log("User found:", !!user);

    if (!user) {
      console.log(
        "LOGIN FAILED: User not found"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    console.log("User email:", user.email);
    console.log("User role:", user.role);
    console.log(
      "Password exists:",
      !!user.password
    );
    console.log(
      "Must reset password:",
      user.mustResetPassword
    );
    console.log(
      "Account status:",
      user.accountStatus
    );

    // =====================================================
    // INVITED USER
    // =====================================================

    if (
      user.accountStatus === "pending" ||
      user.mustResetPassword === true
    ) {
      console.log(
        "LOGIN BLOCKED: Password setup required"
      );

      return res.status(403).json({
        success: false,
        message:
          "Please verify your invitation and set your password first",
        mustResetPassword: true,
        accountStatus:
          user.accountStatus,
        userID: user.userID,
      });
    }

    // =====================================================
    // ACCOUNT STATUS
    // =====================================================

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    // =====================================================
    // PASSWORD
    // =====================================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "Password match:",
      passwordMatch
    );

    if (!passwordMatch) {
      console.log(
        "LOGIN FAILED: Password does not match"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // =====================================================
    // JWT
    // =====================================================

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

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userID: user.userID,
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
        accountStatus:
          user.accountStatus,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// =========================================================
// VERIFY OTP
// POST /api/auth/verify-otp
// =========================================================

const verifyOtp = async (req, res) => {
  try {
    console.log("\n======================================");
    console.log("VERIFY OTP REQUEST");
    console.log("======================================");

    const { userID, otp } = req.body;

    console.log("User ID received:", userID);
    console.log(
      "OTP received:",
      otp ? "YES" : "NO"
    );

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!userID || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "User ID and OTP are required",
      });
    }

    const normalizedUserID =
      userID.trim();

    const normalizedOtp =
      String(otp).trim();

    // =====================================================
    // FIND USER
    // =====================================================

    const user = await User.findOne({
      userID: normalizedUserID,
    });

    console.log(
      "User found:",
      !!user
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User information:", {
      id: user._id,
      userID: user.userID,
      email: user.email,
      role: user.role,
      mustResetPassword:
        user.mustResetPassword,
      otpVerified:
        user.otpVerified,
      hasOtp: !!user.otp,
      otpExpiresAt:
        user.otpExpiresAt,
    });

    // =====================================================
    // CHECK RESET REQUIREMENT
    // =====================================================

    if (!user.mustResetPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Invitation verification is not required",
      });
    }

    // =====================================================
    // CHECK OTP VERIFIED
    // =====================================================

    if (user.otpVerified === true) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has already been used",
      });
    }

    // =====================================================
    // CHECK OTP
    // =====================================================

    if (
      !user.otp ||
      !user.otpExpiresAt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid OTP found",
      });
    }

    // =====================================================
    // CHECK EXPIRATION
    // =====================================================

    if (
      new Date() >
      new Date(user.otpExpiresAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // =====================================================
    // CHECK OTP VALUE
    // =====================================================

    if (
      String(user.otp).trim() !==
      normalizedOtp
    ) {
      console.log("OTP mismatch");
      console.log(
        "Database OTP:",
        user.otp
      );
      console.log(
        "Received OTP:",
        normalizedOtp
      );

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // =====================================================
    // OTP MATCHED
    // =====================================================

    console.log("OTP MATCHED");

    const updatedUser =
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            otpVerified: true,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to update OTP verification",
      });
    }

    console.log(
      "OTP VERIFIED SUCCESSFULLY"
    );

    return res.status(200).json({
      success: true,
      message:
        "Invitation verified successfully",
      userID: updatedUser.userID,
      role: updatedUser.role,
      verified: true,
    });
  } catch (error) {
    console.error(
      "OTP VERIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "OTP verification failed",
      error: error.message,
    });
  }
};

// =========================================================
// SET PASSWORD
// POST /api/auth/set-password
// =========================================================

const setPassword = async (req, res) => {
  try {
    console.log("\n======================================");
    console.log("SET PASSWORD REQUEST");
    console.log("======================================");

    const {
      userID,
      otp,
      newPassword,
    } = req.body;

    console.log("User ID:", userID);
    console.log(
      "OTP received:",
      otp ? "YES" : "NO"
    );
    console.log(
      "Password received:",
      newPassword ? "YES" : "NO"
    );

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !userID ||
      !otp ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User ID, OTP, and new password are required",
      });
    }

    const normalizedUserID =
      userID.trim();

    const normalizedOtp =
      String(otp).trim();

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long",
      });
    }

    // =====================================================
    // FIND USER
    // =====================================================

    const user = await User.findOne({
      userID: normalizedUserID,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Set password user:", {
      id: user._id,
      userID: user.userID,
      email: user.email,
      role: user.role,
      mustResetPassword:
        user.mustResetPassword,
      otpVerified:
        user.otpVerified,
      hasOtp: !!user.otp,
      otpExpiresAt:
        user.otpExpiresAt,
    });

    // =====================================================
    // CHECK RESET REQUIREMENT
    // =====================================================

    if (!user.mustResetPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password has already been set",
      });
    }

    // =====================================================
    // CHECK OTP
    // =====================================================

    if (
      !user.otp ||
      !user.otpExpiresAt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid OTP found. Please request a new invitation.",
      });
    }

    // =====================================================
    // CHECK EXPIRATION
    // =====================================================

    if (
      new Date() >
      new Date(user.otpExpiresAt)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new invitation.",
      });
    }

    // =====================================================
    // CHECK OTP
    // =====================================================

    if (
      String(user.otp).trim() !==
      normalizedOtp
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // =====================================================
    // OTP MUST BE VERIFIED
    // =====================================================

    if (user.otpVerified !== true) {
      return res.status(400).json({
        success: false,
        message:
          "Please verify your OTP first",
      });
    }

    // =====================================================
    // HASH PASSWORD
    // =====================================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // =====================================================
    // UPDATE USER
    //
    // IMPORTANT:
    // Do NOT use user.save() here.
    //
    // We use findByIdAndUpdate() to avoid the
    // Mongoose save middleware and prevent:
    //
    // "next is not a function"
    //
    // =====================================================

    const updatedUser =
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            password: hashedPassword,
            mustResetPassword: false,
            accountStatus: "active",
            otp: null,
            otpExpiresAt: null,
            otpVerified: false,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to update user password",
      });
    }

    console.log(
      "PASSWORD SET SUCCESSFULLY"
    );

    // =====================================================
    // CREATE JWT
    // =====================================================

    const token = jwt.sign(
      {
        id: updatedUser._id,
        role: updatedUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        "Password set successfully",
      token,
      user: {
        id: updatedUser._id,
        userID: updatedUser.userID,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        gender: updatedUser.gender,
        phone: updatedUser.phone,
        telegramUsername:
          updatedUser.telegramUsername,
        batchId: updatedUser.batchId,
        assignedMentor:
          updatedUser.assignedMentor,
        accountStatus:
          updatedUser.accountStatus,
        mustResetPassword:
          updatedUser.mustResetPassword,
      },
    });
  } catch (error) {
    console.error(
      "\n======================================"
    );
    console.error(
      "SET PASSWORD ERROR"
    );
    console.error(
      "======================================"
    );
    console.error(error);
    console.error(
      "Error name:",
      error.name
    );
    console.error(
      "Error message:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to set password",
      error: error.message,
    });
  }
};

// =========================================================
// GET USER BY ID
// =========================================================

const getUserById = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
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
      "GET USER BY ID ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        "Invalid user ID",
    });
  }
};

// =========================================================
// GET USERS
// PAGINATION + SEARCH + ROLE + GENDER
// =========================================================

const getUsers = async (
  req,
  res
) => {
  try {
    const page = Math.max(
      parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(
          req.query.limit,
          10
        ) || 10,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const {
      search,
      role,
      gender,
    } = req.query;

    const filter = {};

    // =====================================================
    // ROLE
    // =====================================================

    if (role) {
      filter.role =
        role.trim().toLowerCase();
    }

    // =====================================================
    // GENDER
    // =====================================================

    if (gender) {
      filter.gender =
        gender.trim();
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
        {
          userID: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // =====================================================
    // GET USERS
    // =====================================================

    const [
      users,
      totalUsers,
    ] = await Promise.all([
      User.find(filter)
        .select(
          "-password -otp -invitationToken"
        )
        .populate(
          "assignedMentor",
          "userID name email role"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    const totalPages =
      Math.ceil(
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
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET USERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get users",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  registerUser,
  registerMentor,
  loginUser,
  verifyOtp,
  setPassword,
  getUserById,
  getUsers,
};

