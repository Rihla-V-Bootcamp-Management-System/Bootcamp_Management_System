const express = require("express");

const {
  createSubmission,
  getMySubmissions,
  getMentorSubmissions,
  getAssignmentSubmissions,
  gradeSubmission,
  requestResubmission,
} = require("../controllers/SubmissionControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// STUDENT
// ======================================================

// Submit / resubmit assignment
// POST /api/submissions/:assignmentId

router.post(
  "/:assignmentId",
  authMiddleware,
  roleMiddleware("student"),
  createSubmission
);

// Student's own submissions
// GET /api/submissions/my

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  getMySubmissions
);

// ======================================================
// MENTOR
// ======================================================

// All submissions from mentor's batches
// GET /api/submissions/mentor

router.get(
  "/mentor",
  authMiddleware,
  roleMiddleware("mentor"),
  getMentorSubmissions
);

// Grade submission
// PATCH /api/submissions/:id/grade

router.patch(
  "/:id/grade",
  authMiddleware,
  roleMiddleware("mentor"),
  gradeSubmission
);

// Request resubmission
// PATCH /api/submissions/:id/resubmit

router.patch(
  "/:id/resubmit",
  authMiddleware,
  roleMiddleware("mentor"),
  requestResubmission
);

// ======================================================
// ADMIN + MENTOR
// ======================================================

// All submissions for one assignment
// GET /api/submissions/assignment/:assignmentId

router.get(
  "/assignment/:assignmentId",
  authMiddleware,
  roleMiddleware("admin", "mentor"),
  getAssignmentSubmissions
);

module.exports = router;