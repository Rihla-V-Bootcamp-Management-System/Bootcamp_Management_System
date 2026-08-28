const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createDailyTask,
  getDailyTasks,
  getMyDailyTasks,
  getDailyTasksByBatch,
  getDailyTaskById,
  updateDailyTask,
  deleteDailyTask,
} = require("../controllers/dailyTaskControllers");

// =========================================================
// STUDENT - GET MY TASKS
// GET /api/daily-tasks/my
// =========================================================

router.get(
  "/my",
  authMiddleware,
  getMyDailyTasks
);

// =========================================================
// ADMIN - GET ALL TASKS
// GET /api/daily-tasks
// =========================================================

router.get(
  "/",
  authMiddleware,
  getDailyTasks
);

// =========================================================
// GET TASKS BY BATCH
// GET /api/daily-tasks/batch/:batchId
// =========================================================

router.get(
  "/batch/:batchId",
  authMiddleware,
  getDailyTasksByBatch
);

// =========================================================
// GET SINGLE TASK
// GET /api/daily-tasks/:id
// =========================================================

router.get(
  "/:id",
  authMiddleware,
  getDailyTaskById
);

// =========================================================
// ADMIN - CREATE TASK
// POST /api/daily-tasks
// =========================================================

router.post(
  "/",
  authMiddleware,
  createDailyTask
);

// =========================================================
// ADMIN - UPDATE TASK
// PUT /api/daily-tasks/:id
// =========================================================

router.put(
  "/:id",
  authMiddleware,
  updateDailyTask
);

// =========================================================
// ADMIN - DELETE TASK
// DELETE /api/daily-tasks/:id
// =========================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteDailyTask
);

module.exports = router;