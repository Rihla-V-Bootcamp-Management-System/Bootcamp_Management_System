const mongoose = require("mongoose");
const DailyTask = require("../models/DailyTask");
const Batch = require("../models/Batch");
const User = require("../models/User");

// =========================================================
// HELPERS
// =========================================================

const getRole = (user) => {
  return String(user?.role || "")
    .trim()
    .toLowerCase();
};

const isAdmin = (user) => {
  const role = getRole(user);

  return role === "admin" || role === "superadmin";
};

const isStudent = (user) => {
  return getRole(user) === "student";
};

// =========================================================
// ADMIN - CREATE DAILY TASK
// POST /api/daily-tasks
// =========================================================

const createDailyTask = async (req, res) => {
  try {
    console.log("========== CREATE DAILY TASK ==========");
    console.log("USER:", req.user?._id);
    console.log("ROLE:", getRole(req.user));
    console.log("BODY:", req.body);

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create daily tasks",
        detectedRole: getRole(req.user),
      });
    }

    const {
      batchId,
      level,
      week,
      day,
      title,
      description,
      points,
    } = req.body;

    if (
      !batchId ||
      level === undefined ||
      day === undefined ||
      !title
    ) {
      return res.status(400).json({
        success: false,
        message:
          "batchId, level, day and title are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batchId",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const dailyTask = await DailyTask.create({
      batchId,
      level: Number(level),
      week: Number(week) || 1,
      day,
      title: String(title).trim(),
      description: description
        ? String(description).trim()
        : "",
      points: Number(points) || 0,
      isActive: true,
    });

    const populatedTask =
      await DailyTask.findById(dailyTask._id).populate(
        "batchId",
        "name startDate endDate"
      );

    return res.status(201).json({
      success: true,
      message: "Daily task created successfully",
      dailyTask: populatedTask,
    });
  } catch (error) {
    console.error("CREATE DAILY TASK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create daily task",
      error: error.message,
    });
  }
};

// =========================================================
// ADMIN - GET ALL DAILY TASKS
// GET /api/daily-tasks
// =========================================================

const getDailyTasks = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view all daily tasks",
        detectedRole: getRole(req.user),
      });
    }

    const dailyTasks = await DailyTask.find()
      .populate("batchId", "name startDate endDate")
      .sort({
        week: 1,
        level: 1,
        day: 1,
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      total: dailyTasks.length,
      dailyTasks,
    });
  } catch (error) {
    console.error("GET DAILY TASKS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load daily tasks",
      error: error.message,
    });
  }
};

// =========================================================
// STUDENT - GET MY DAILY TASKS
// GET /api/daily-tasks/my
// =========================================================

const getMyDailyTasks = async (req, res) => {
  try {
    console.log("========== GET MY DAILY TASKS ==========");

    // authMiddleware already loaded the CURRENT user
    const userId = req.user?._id;
    const role = getRole(req.user);

    console.log("AUTH USER ID:", userId);
    console.log("AUTH USER ROLE:", role);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing",
      });
    }

    // -----------------------------------------------------
    // STUDENT ONLY
    // -----------------------------------------------------

    if (!isStudent(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only students can access student daily tasks",
        detectedRole: role,
      });
    }

    // -----------------------------------------------------
    // GET CURRENT STUDENT
    // -----------------------------------------------------

    const student = await User.findById(userId)
      .select("name email role batchId assignedMentor level")
      .populate(
        "batchId",
        "name startDate endDate"
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // -----------------------------------------------------
    // SAFETY CHECK
    // -----------------------------------------------------

    if (getRole(student) !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access student daily tasks",
        detectedRole: getRole(student),
      });
    }

    // -----------------------------------------------------
    // NO BATCH
    // -----------------------------------------------------

    if (!student.batchId) {
      return res.status(200).json({
        success: true,
        assigned: false,

        message:
          "You are not assigned to a batch yet.",

        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: "student",
        },

        batch: null,
        total: 0,
        dailyTasks: [],
      });
    }

    const batchId = student.batchId._id;

    // -----------------------------------------------------
    // GET STUDENT TASKS
    // -----------------------------------------------------

    const dailyTasks = await DailyTask.find({
      batchId: batchId,
      $or: [
        { isActive: true },
        { isActive: { $exists: false } },
      ],
    })
      .populate(
        "batchId",
        "name startDate endDate"
      )
      .sort({
        week: 1,
        level: 1,
        day: 1,
        createdAt: 1,
      });

    console.log(
      "STUDENT:",
      student.email
    );

    console.log(
      "BATCH:",
      student.batchId.name
    );

    console.log(
      "TASKS FOUND:",
      dailyTasks.length
    );

    // -----------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------

    return res.status(200).json({
      success: true,
      assigned: true,

      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: "student",
        level: student.level,
      },

      batch: student.batchId,

      total: dailyTasks.length,

      dailyTasks,
    });
  } catch (error) {
    console.error("GET MY DAILY TASKS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load your daily tasks",
      error: error.message,
    });
  }
};

// =========================================================
// GET DAILY TASKS BY BATCH
// GET /api/daily-tasks/batch/:batchId
// =========================================================

const getDailyTasksByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batchId",
      });
    }

    const dailyTasks = await DailyTask.find({
      batchId,
    })
      .populate(
        "batchId",
        "name startDate endDate"
      )
      .sort({
        week: 1,
        level: 1,
        day: 1,
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      total: dailyTasks.length,
      dailyTasks,
    });
  } catch (error) {
    console.error(
      "GET DAILY TASKS BY BATCH ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load batch daily tasks",
      error: error.message,
    });
  }
};

// =========================================================
// GET SINGLE DAILY TASK
// GET /api/daily-tasks/:id
// =========================================================

const getDailyTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily task ID",
      });
    }

    const dailyTask =
      await DailyTask.findById(id).populate(
        "batchId",
        "name startDate endDate"
      );

    if (!dailyTask) {
      return res.status(404).json({
        success: false,
        message: "Daily task not found",
      });
    }

    return res.status(200).json({
      success: true,
      dailyTask,
    });
  } catch (error) {
    console.error(
      "GET DAILY TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get daily task",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE DAILY TASK
// PUT /api/daily-tasks/:id
// =========================================================

const updateDailyTask = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update daily tasks",
        detectedRole: getRole(req.user),
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily task ID",
      });
    }

    const {
      batchId,
      level,
      week,
      day,
      title,
      description,
      points,
      isActive,
    } = req.body;

    const updateData = {};

    if (batchId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid batchId",
        });
      }

      updateData.batchId = batchId;
    }

    if (level !== undefined) {
      updateData.level = Number(level);
    }

    if (week !== undefined) {
      updateData.week = Number(week);
    }

    if (day !== undefined) {
      updateData.day = day;
    }

    if (title !== undefined) {
      updateData.title = String(title).trim();
    }

    if (description !== undefined) {
      updateData.description =
        String(description).trim();
    }

    if (points !== undefined) {
      updateData.points = Number(points) || 0;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const dailyTask =
      await DailyTask.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "batchId",
        "name startDate endDate"
      );

    if (!dailyTask) {
      return res.status(404).json({
        success: false,
        message: "Daily task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Daily task updated successfully",
      dailyTask,
    });
  } catch (error) {
    console.error(
      "UPDATE DAILY TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update daily task",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE DAILY TASK
// DELETE /api/daily-tasks/:id
// =========================================================

const deleteDailyTask = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete daily tasks",
        detectedRole: getRole(req.user),
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily task ID",
      });
    }

    const dailyTask =
      await DailyTask.findByIdAndDelete(id);

    if (!dailyTask) {
      return res.status(404).json({
        success: false,
        message: "Daily task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Daily task deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE DAILY TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete daily task",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createDailyTask,
  getDailyTasks,
  getMyDailyTasks,
  getDailyTasksByBatch,
  getDailyTaskById,
  updateDailyTask,
  deleteDailyTask,
};