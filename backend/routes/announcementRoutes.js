const express = require("express");

const {
  createAnnouncement,
  getAnnouncements,
  getMyAnnouncements,
  getMentorBatches,
  getMentorStudents,
  getMentorAnnouncements,
  getStudentAnnouncements,
  markAnnouncementAsRead,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
} = require("../controllers/announcementController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================================================
// MENTOR-SPECIFIC ROUTES (Must precede /:id)
// =========================================================

router.get(
  "/mentor/batches",
  authMiddleware,
  roleMiddleware("mentor", "admin", "superadmin"),
  getMentorBatches
);

router.get(
  "/mentor/students",
  authMiddleware,
  roleMiddleware("mentor", "admin", "superadmin"),
  getMentorStudents
);

router.get(
  "/mentor",
  authMiddleware,
  roleMiddleware("mentor", "admin", "superadmin"),
  getMentorAnnouncements
);

router.post(
  "/mentor",
  authMiddleware,
  roleMiddleware("mentor", "admin", "superadmin"),
  createAnnouncement
);

router.delete(
  "/mentor/:id",
  authMiddleware,
  roleMiddleware("mentor", "admin", "superadmin"),
  deleteAnnouncement
);

// =========================================================
// STUDENT-SPECIFIC ROUTES
// =========================================================

router.get(
  "/student",
  authMiddleware,
  roleMiddleware("student", "admin", "superadmin"),
  getStudentAnnouncements
);

router.patch(
  "/:id/read",
  authMiddleware,
  markAnnouncementAsRead
);

router.post(
  "/:id/read",
  authMiddleware,
  markAnnouncementAsRead
);

// =========================================================
// GENERAL / ADMIN ROUTES
// =========================================================

router.get(
  "/mine",
  authMiddleware,
  roleMiddleware("admin", "superadmin", "mentor"),
  getMyAnnouncements
);

router.get(
  "/",
  authMiddleware,
  getAnnouncements
);

router.get(
  "/:id",
  authMiddleware,
  getAnnouncementById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  createAnnouncement
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin", "mentor"),
  updateAnnouncement
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin", "mentor"),
  deleteAnnouncement
);

router.post(
  "/:id/publish",
  authMiddleware,
  roleMiddleware("admin", "superadmin", "mentor"),
  publishAnnouncement
);

module.exports = router;