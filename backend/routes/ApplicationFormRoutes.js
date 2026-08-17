const express = require("express");
const registrationControllers = require("../controllers/registrationControllers");
const router = express.Router();

router.post("/", registrationControllers.createRegistration);

module.exports = router;