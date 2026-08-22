const express = require("express");

const {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getAssignments
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createAssignment
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateAssignment
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteAssignment
);

module.exports = router;