const express = require("express");

const {
  createAnnouncement,
  getAnnouncements,
  getMyAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
} = require("../controllers/announcementController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================================================
// GET ANNOUNCEMENTS FOR CURRENT USER
// =========================================================

router.get(
  "/",
  authMiddleware,
  roleMiddleware(
    "superadmin",
    "admin",
    "mentor",
    "student"
  ),
  getAnnouncements
);

// =========================================================
// GET ADMIN'S OWN ANNOUNCEMENTS
// IMPORTANT: MUST COME BEFORE /:id
// =========================================================

router.get(
  "/mine",
  authMiddleware,
  roleMiddleware("admin"),
  getMyAnnouncements
);

// =========================================================
// GET SINGLE ANNOUNCEMENT
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "superadmin",
    "admin",
    "mentor",
    "student"
  ),
  getAnnouncementById
);

// =========================================================
// CREATE
// =========================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createAnnouncement
);

// =========================================================
// UPDATE
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateAnnouncement
);

// =========================================================
// DELETE
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteAnnouncement
);

// =========================================================
// PUBLISH
// =========================================================

router.post(
  "/:id/publish",
  authMiddleware,
  roleMiddleware("admin"),
  publishAnnouncement
);

module.exports = router;