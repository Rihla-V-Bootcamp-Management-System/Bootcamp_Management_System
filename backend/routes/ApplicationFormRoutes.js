const express = require("express");

const {
  getApplicationForm,
  createApplicationForm,
  updateApplicationForm
} = require("../controllers/ApplicationFormControllers");

const router = express.Router();
router.get("/:seasonId", getApplicationForm);
router.post("/:seasonId", createApplicationForm);
router.patch("/:seasonId", updateApplicationForm);

module.exports = router;