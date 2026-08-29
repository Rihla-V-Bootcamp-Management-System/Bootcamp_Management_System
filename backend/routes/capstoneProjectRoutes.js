const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getCapstoneProjects,
  getCapstoneProjectById,
  createCapstoneProject,
  updateCapstoneProject,
  deleteCapstoneProject,
} = require("../controllers/capstoneProjectControllers");

// GET ALL
router.get(
  "/",
  authMiddleware,
  getCapstoneProjects
);

// GET SINGLE
router.get(
  "/:id",
  authMiddleware,
  getCapstoneProjectById
);

// CREATE
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "superadmin", "mentor"),
  createCapstoneProject
);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin", "mentor"),
  updateCapstoneProject
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "superadmin"),
  deleteCapstoneProject
);

module.exports = router;
