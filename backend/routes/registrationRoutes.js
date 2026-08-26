const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const registrationController = require("../controllers/registrationControllers");

console.log("REGISTRATION CONTROLLER:", registrationController);
console.log(
  "getRegistrations:",
  typeof registrationController.getRegistrations
);
console.log(
  "createRegistration:",
  typeof registrationController.createRegistration
);
console.log(
  "updateRegistrationStatus:",
  typeof registrationController.updateRegistrationStatus
);

const {
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
} = registrationController;

// GET ALL
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getRegistrations
);

// CREATE
router.post(
  "/",
  createRegistration
);

// STATUS
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateRegistrationStatus
);

module.exports = router;