const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// REGISTER
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

// LOGIN
router.post("/login", async (req, res) => {
  console.log("LOGIN ROUTE HIT");

  try {
    const { email, password } = req.body;

    console.log("LOGIN: email =", email);
    console.log("LOGIN: password received =", !!password);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    console.log("LOGIN: searching for user...");

    const user = await User.findOne({ email });

    console.log("LOGIN: user found =", !!user);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log("LOGIN: user email =", user.email);
    console.log("LOGIN: user role =", user.role);
    console.log("LOGIN: checking password...");

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("LOGIN: password match =", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log("LOGIN: creating JWT...");

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

    console.log("LOGIN: JWT created successfully");

    res.json({
      message: "Login successful",
      token,
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

// GET USER BY ID - ADMIN ONLY
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