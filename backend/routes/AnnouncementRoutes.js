const express = require("express");

const {
  getMentorBatches,
  getMentorStudents,
  createAnnouncement,
  getMentorAnnouncements,
  getStudentAnnouncements,
  markAnnouncementAsRead,
  deleteAnnouncement,
} = require("../controllers/AnnouncementController");

const router = express.Router();

// ============================================================
// MENTOR
// ============================================================

router.get(
  "/mentor/batches",
  getMentorBatches
);

router.get(
  "/mentor/students",
  getMentorStudents
);

router.get(
  "/mentor",
  getMentorAnnouncements
);

router.post(
  "/mentor",
  createAnnouncement
);

router.delete(
  "/mentor/:id",
  deleteAnnouncement
);

// ============================================================
// STUDENT
// ============================================================

router.get(
  "/student",
  getStudentAnnouncements
);

router.patch(
  "/:announcementId/read",
  markAnnouncementAsRead
);

module.exports = router;