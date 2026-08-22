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

router.post(
  "/:assignmentId",
  authMiddleware,
  roleMiddleware("student"),
  createSubmission
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  getMySubmissions
);

router.get(
  "/mentor/submissions",
  authMiddleware,
  roleMiddleware("mentor"),
  getMentorSubmissions
);

router.get(
  "/assignment/:assignmentId",
  authMiddleware,
  roleMiddleware("admin", "mentor"),
  getAssignmentSubmissions
);

router.patch(
  "/:id/grade",
  authMiddleware,
  roleMiddleware("mentor"),
  gradeSubmission
);

router.patch(
  "/:id/request-resubmission",
  authMiddleware,
  roleMiddleware("mentor"),
  requestResubmission
);

module.exports = router;