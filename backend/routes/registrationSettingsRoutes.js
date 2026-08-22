const express = require("express");
const RegistrationSettings = require("../models/RegistrationSettings");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let settings = await RegistrationSettings.findOne();

    if (!settings) {
      settings = await RegistrationSettings.create({
        registrationOpen: false,
      });
    }

    res.json({
      registrationOpen: settings.registrationOpen,
      opensAt: settings.opensAt,
      closesAt: settings.closesAt,
    });
  } catch (error) {
    console.error("GET REGISTRATION SETTINGS ERROR:", error);

    res.status(500).json({
      message: "Failed to get registration settings",
      error: error.message,
    });
  }
});

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

      res.json({
        message: registrationOpen
          ? "Registration opened successfully"
          : "Registration closed successfully",
        registrationOpen: settings.registrationOpen,
      });
    } catch (error) {
      console.error("TOGGLE REGISTRATION ERROR:", error);

      res.status(500).json({
        message: "Failed to update registration settings",
        error: error.message,
      });
    }
  }
);

module.exports = router;