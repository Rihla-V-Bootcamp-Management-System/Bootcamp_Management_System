const express = require("express");

const {
  createApplicationForm,
  updateApplicationForm,
  getApplicationForm,
} = require("../controllers/ApplicationFormControllers");

const router = express.Router();

// Create form
router.post("/", createApplicationForm);

// Update form
router.patch("/", updateApplicationForm);

// Get form
router.get("/", getApplicationForm);

module.exports = router;