const express = require("express");

const {
  createApplicationForm,
  updateApplicationForm,
  getApplicationForm,
} = require("../controllers/ApplicationFormControllers");

const router = express.Router();

router.post("/:seasonId", createApplicationForm);
router.patch("/:seasonId", updateApplicationForm);
router.get("/:seasonId", getApplicationForm);

module.exports = router;