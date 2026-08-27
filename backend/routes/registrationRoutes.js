const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const registrationController = require("../controllers/registrationControllers");

const {
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
} = registrationController;

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  getRegistrations
);

router.post(
  "/",
  createRegistration
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  updateRegistrationStatus
);

module.exports = router;