
const express = require("express");

const {
  createApplicationForm,
  getApplicationForm,
  updateApplicationForm,
  getCurrentApplicationForm,
} = require("../controllers/ApplicationFormControllers");

const router = express.Router();

// =====================================================
// GET CURRENT OPEN SEASON APPLICATION FORM
// GET /api/application-forms
// =====================================================

router.get("/", getCurrentApplicationForm);

// =====================================================
// GET CURRENT APPLICATION FORM EXPLICITLY
// GET /api/application-forms/current
// =====================================================

router.get("/current", getCurrentApplicationForm);

// =====================================================
// GET APPLICATION FORM BY SEASON
// GET /api/application-forms/:seasonId
// =====================================================

router.get("/:seasonId", getApplicationForm);

// =====================================================
// CREATE APPLICATION FORM
// POST /api/application-forms/:seasonId
// =====================================================

router.post("/:seasonId", createApplicationForm);

// =====================================================
// UPDATE APPLICATION FORM
// PATCH /api/application-forms/:seasonId
// =====================================================

router.patch("/:seasonId", updateApplicationForm);

module.exports = router;
