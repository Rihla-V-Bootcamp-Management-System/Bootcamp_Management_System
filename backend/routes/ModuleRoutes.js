const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} = require("../controllers/ModuleControllers");

// =========================================================
// MODULE ROUTES
// =========================================================

// GET MODULES
// Anyone authenticated can view modules
router.get(
  "/",
  authMiddleware,
  getModules
);

// GET SINGLE MODULE
router.get(
  "/:id",
  authMiddleware,
  getModuleById
);

// CREATE MODULE
// ADMIN ONLY
router.post(
  "/",
  authMiddleware,
  createModule
);

// UPDATE MODULE
// ADMIN ONLY
router.put(
  "/:id",
  authMiddleware,
  updateModule
);

// DELETE MODULE
// ADMIN ONLY
router.delete(
  "/:id",
  authMiddleware,
  deleteModule
);

module.exports = router;