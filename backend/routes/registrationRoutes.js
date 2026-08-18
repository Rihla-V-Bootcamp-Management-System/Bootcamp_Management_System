const express = require("express");

const {
  createRegistration,
} = require("../controllers/registrationControllers");

const router = express.Router();

router.post("/", createRegistration);

module.exports = router;