const express = require("express");
const router = express.Router();

const {
  getAbout,
  getAdminAbout,
  createAbout,
  updateAbout,
} = require("../controllers/aboutController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", getAbout);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  getAdminAbout
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  createAbout
);

router.patch(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  updateAbout
);

module.exports = router;