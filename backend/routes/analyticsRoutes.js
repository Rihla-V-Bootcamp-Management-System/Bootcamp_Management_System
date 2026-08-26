const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getAnalyticsOverview,
} = require("../controllers/analyticsControllers");

// =========================================================
// GET ANALYTICS OVERVIEW
// =========================================================

router.get(
  "/overview",
  authMiddleware,
  roleMiddleware("admin"),
  getAnalyticsOverview
);

module.exports = router;