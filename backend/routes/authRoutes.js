const express = require("express");

const router = express.Router();

const {
  registerUser,
  registerMentor,
  loginUser,
  getUserById,
} = require("../controllers/authControllers");

// =====================================================
// STUDENT REGISTRATION
// =====================================================

router.post(
  "/register",
  registerUser
);

// =====================================================
// MENTOR REGISTRATION
// =====================================================

router.post(
  "/register-mentor",
  registerMentor
);

// =====================================================
// LOGIN
// =====================================================

router.post(
  "/login",
  loginUser
);

// =====================================================
// GET USER BY ID
// =====================================================

router.get(
  "/users/:id",
  getUserById
);

module.exports = router;