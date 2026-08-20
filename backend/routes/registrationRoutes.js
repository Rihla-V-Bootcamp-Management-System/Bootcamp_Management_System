const express = require("express");
const router = express.Router();

const RegistrationSettings = require("../models/RegistrationSettings");

const {
  createRegistration,
} = require("../controllers/registrationControllers");

const {
  updateRegistrationStatus,
} = require("../controllers/registrationStatusControllers");

router.post("/", async (req, res) => {
  try {
    const settings = await RegistrationSettings.findOne();

    if (!settings || !settings.registrationOpen) {
      return res.status(403).json({
        message: "Registration is currently closed",
      });
    }

    return createRegistration(req, res);
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.patch("/:id/status", updateRegistrationStatus);

module.exports = router;