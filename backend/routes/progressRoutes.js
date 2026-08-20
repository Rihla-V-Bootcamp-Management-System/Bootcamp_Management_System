const express = require("express");
const {
  createProgress,
  getProgress,
} = require("../controllers/progressControllers");

const router = express.Router();

router.post("/", createProgress);
router.get("/", getProgress);

module.exports = router;