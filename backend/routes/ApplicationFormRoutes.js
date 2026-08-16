const express = require("express");

const {
  createApplicationForm,
  updateApplicationForm
} = require("../controllers/ApplicationFormControllers");

const router = express.Router();

router.post("/:seasonId", createApplicationForm);
router.patch("/:seasonId", updateApplicationForm);

module.exports = router;