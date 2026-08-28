const express = require("express");

const {
  createApplicationForm,
  getApplicationForm,
  updateApplicationForm,
  getCurrentApplicationForm,
} = require("../controllers/ApplicationFormControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// CURRENT APPLICATION FORM
// =====================================================

// GET /api/application-forms
// Used by Admin FormBuilder
//
// Does NOT depend on registration being open.
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getCurrentApplicationForm
);

// =====================================================
// CURRENT APPLICATION FORM
// =====================================================

// GET /api/application-forms/current
// Used when the current application form is needed.

router.get(
  "/current",
  getCurrentApplicationForm
);

// =====================================================
// GET APPLICATION FORM BY SEASON
// =====================================================

// GET /api/application-forms/:seasonId

router.get(
  "/:seasonId",
  authMiddleware,
  roleMiddleware("admin"),
  getApplicationForm
);

// =====================================================
// CREATE APPLICATION FORM
// =====================================================

// POST /api/application-forms/:seasonId

router.post(
  "/:seasonId",
  authMiddleware,
  roleMiddleware("admin"),
  createApplicationForm
);

// =====================================================
// UPDATE APPLICATION FORM
// =====================================================

// PATCH /api/application-forms/:seasonId

router.patch(
  "/:seasonId",
  authMiddleware,
  roleMiddleware("admin"),
  updateApplicationForm
);

module.exports = router;