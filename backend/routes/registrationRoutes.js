const express = require("express");
const router = express.Router();

const Registration = require("../models/Registration");
const RegistrationSettings = require("../models/RegistrationSettings");

const {
  createRegistration,
} = require("../controllers/registrationControllers");

const {
  updateRegistrationStatus,
} = require("../controllers/registrationStatusControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// GET all registrations
router.get(
  "/",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "mentor"),
  async (req, res) => {
    try {
      const registrations = await Registration.find().sort({
        createdAt: -1,
      });

      res.json({
        registrations,
      });
    } catch (error) {
      console.error("GET REGISTRATIONS ERROR:", error);

      res.status(500).json({
        message: "Failed to get registrations",
        error: error.message,
      });
    }
  }
);

// GET single registration
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "mentor"),
  async (req, res) => {
    try {
      const registration = await Registration.findById(req.params.id);

      if (!registration) {
        return res.status(404).json({
          message: "Registration not found",
        });
      }

      res.json({
        registration,
      });
    } catch (error) {
      console.error("GET REGISTRATION ERROR:", error);

      res.status(500).json({
        message: "Failed to get registration",
        error: error.message,
      });
    }
  }
);

// CREATE registration
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

// UPDATE registration status
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("superadmin", "admin", "mentor"),
  updateRegistrationStatus
);

module.exports = router;