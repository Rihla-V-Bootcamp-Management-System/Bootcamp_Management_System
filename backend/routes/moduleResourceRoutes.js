const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createModuleResource,
  getModuleResources,
  getModuleResource,
  updateModuleResource,
  deleteModuleResource,
} = require("../controllers/moduleResourceController");

// =========================================================
// ADMIN - CREATE MODULE RESOURCE
// POST /api/module-resources
// =========================================================

router.post(
  "/",
  authMiddleware,
  createModuleResource
);

// =========================================================
// GET RESOURCES FOR A MODULE
// GET /api/module-resources/module/:moduleId
// =========================================================

router.get(
  "/module/:moduleId",
  authMiddleware,
  getModuleResources
);

// =========================================================
// GET SINGLE RESOURCE
// GET /api/module-resources/:id
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  getModuleResource
);

// =========================================================
// ADMIN - UPDATE RESOURCE
// PUT /api/module-resources/:id
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  updateModuleResource
);

// =========================================================
// ADMIN - DELETE RESOURCE
// DELETE /api/module-resources/:id
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteModuleResource
);

module.exports = router;