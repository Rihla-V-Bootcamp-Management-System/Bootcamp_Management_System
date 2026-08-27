const express = require("express");

const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/AssignmentControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "mentor", "student"),
  getAssignments
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "mentor", "student"),
  getAssignmentById
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