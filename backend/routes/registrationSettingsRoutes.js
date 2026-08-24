const express = require("express");
const RegistrationSettings = require("../models/RegistrationSettings");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// GET REGISTRATION SETTINGS
// GET /api/registration-settings
// ==========================================

router.get("/", async (req, res) => {
  try {
    let settings = await RegistrationSettings.findOne();

    if (!settings) {
      settings = await RegistrationSettings.create({
        registrationOpen: false,
        opensAt: null,
        closesAt: null,
      });
    }

    return res.json({
      registrationOpen: settings.registrationOpen,
      opensAt: settings.opensAt,
      closesAt: settings.closesAt,
    });
  } catch (error) {
    console.error("GET REGISTRATION SETTINGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get registration settings",
      error: error.message,
    });
  }
});

// ==========================================
// TOGGLE REGISTRATION
// PATCH /api/registration-settings/toggle
// ==========================================

router.patch(
  "/toggle",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { registrationOpen } = req.body;

      if (typeof registrationOpen !== "boolean") {
        return res.status(400).json({
          message: "registrationOpen must be true or false",
        });
      }

      let settings = await RegistrationSettings.findOne();

      if (!settings) {
        settings = new RegistrationSettings();
      }

      settings.registrationOpen = registrationOpen;

      await settings.save();

      return res.json({
        message: registrationOpen
          ? "Registration opened successfully"
          : "Registration closed successfully",
        registrationOpen: settings.registrationOpen,
        opensAt: settings.opensAt,
        closesAt: settings.closesAt,
      });
    } catch (error) {
      console.error("TOGGLE REGISTRATION ERROR:", error);

      return res.status(500).json({
        message: "Failed to update registration settings",
        error: error.message,
      });
    }
  }
);

// ==========================================
// SAVE REGISTRATION PERIOD
// PATCH /api/registration-settings/period
// ==========================================

router.patch(
  "/period",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { opensAt, closesAt } = req.body;

      if (!opensAt || !closesAt) {
        return res.status(400).json({
          message: "Opening and closing dates are required",
        });
      }

      const openingDate = new Date(opensAt);
      const closingDate = new Date(closesAt);

      if (Number.isNaN(openingDate.getTime())) {
        return res.status(400).json({
          message: "Invalid opening date",
        });
      }

      if (Number.isNaN(closingDate.getTime())) {
        return res.status(400).json({
          message: "Invalid closing date",
        });
      }

      if (openingDate >= closingDate) {
        return res.status(400).json({
          message: "Opening time must be before closing time",
        });
      }

      let settings = await RegistrationSettings.findOne();

      if (!settings) {
        settings = new RegistrationSettings();
      }

      settings.opensAt = openingDate;
      settings.closesAt = closingDate;

      await settings.save();

      return res.json({
        message: "Registration period saved successfully",
        registrationOpen: settings.registrationOpen,
        opensAt: settings.opensAt,
        closesAt: settings.closesAt,
      });
    } catch (error) {
      console.error("SAVE REGISTRATION PERIOD ERROR:", error);

      return res.status(500).json({
        message: "Failed to save registration period",
        error: error.message,
      });
    }
  }
);

module.exports = router;