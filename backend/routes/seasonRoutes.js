const express = require("express");

const {
  createSeason,
  getSeasons,
  getCurrentSeason,
  updateSeason,
} = require("../controllers/seasonController");

const router = express.Router();

router.post("/", createSeason);

router.get("/", getSeasons);

router.get("/current", getCurrentSeason);

router.patch("/:id", updateSeason);

module.exports = router;