const express = require("express");

const {
  createBatch,
  assignStudentsToMentor,
  getBatches,
  getBatchById,
} = require("../controllers/batchControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "mentor", "student"),
  getBatches
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "mentor", "student"),
  getBatchById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createBatch
);

router.post(
  "/:id/assign-mentor",
  authMiddleware,
  roleMiddleware("admin"),
  assignStudentsToMentor
);

module.exports = router;