const mongoose = require("mongoose");

const Level = require("../models/Level");
const Batch = require("../models/Batch");

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

// =========================================================
// CREATE LEVEL
// POST /api/levels
// =========================================================

const createLevel = async (req, res) => {
  try {
    console.log("\n========== CREATE LEVEL ==========");

    console.log("User:", {
      id: req.user?._id,
      role: req.user?.role,
    });

    console.log("Body:", req.body);

    // -----------------------------------------------------
    // ADMIN CHECK
    // -----------------------------------------------------

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create levels",
      });
    }

    // -----------------------------------------------------
    // GET DATA
    // -----------------------------------------------------

    const {
      name,
      description,
      levelNumber,
      batchId,
      order,
    } = req.body;

    // -----------------------------------------------------
    // REQUIRED
    // -----------------------------------------------------

    if (
      !name ||
      levelNumber === undefined ||
      !batchId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, levelNumber and batchId are required",
      });
    }

    // -----------------------------------------------------
    // VALIDATE BATCH ID
    // -----------------------------------------------------

    const cleanBatchId = String(batchId).trim();

    if (
      !mongoose.Types.ObjectId.isValid(cleanBatchId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid batchId",
      });
    }

    // -----------------------------------------------------
    // CHECK BATCH
    // -----------------------------------------------------

    const batch = await Batch.findById(cleanBatchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // -----------------------------------------------------
    // CHECK DUPLICATE LEVEL
    // -----------------------------------------------------

    const existingLevel = await Level.findOne({
      batchId: cleanBatchId,
      levelNumber: Number(levelNumber),
    });

    if (existingLevel) {
      return res.status(400).json({
        success: false,
        message:
          "This level number already exists in this batch",
      });
    }

    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    const level = await Level.create({
      name: String(name).trim(),
      description: description
        ? String(description).trim()
        : "",
      levelNumber: Number(levelNumber),
      batchId: cleanBatchId,
      order: Number(order) || Number(levelNumber),
    });

    // -----------------------------------------------------
    // POPULATE
    // -----------------------------------------------------

    const populatedLevel = await Level.findById(
      level._id
    ).populate("batchId", "name");

    console.log("✅ LEVEL CREATED");

    return res.status(201).json({
      success: true,
      message: "Level created successfully",
      level: populatedLevel,
    });
  } catch (error) {
    console.error("CREATE LEVEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create level",
      error: error.message,
    });
  }
};

// =========================================================
// GET LEVELS
// GET /api/levels
// GET /api/levels?batchId=...
// =========================================================

const getLevels = async (req, res) => {
  try {
    const { batchId, levelNumber } = req.query;

    const filter = {};

    // -----------------------------------------------------
    // FILTER BY BATCH
    // -----------------------------------------------------

    if (batchId) {
      const cleanBatchId = String(batchId).trim();

      if (
        !mongoose.Types.ObjectId.isValid(cleanBatchId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid batchId",
        });
      }

      filter.batchId = cleanBatchId;
    }

    // -----------------------------------------------------
    // FILTER BY LEVEL NUMBER
    // -----------------------------------------------------

    if (levelNumber !== undefined) {
      filter.levelNumber = Number(levelNumber);
    }

    // -----------------------------------------------------
    // GET
    // -----------------------------------------------------

    const levels = await Level.find(filter)
      .populate("batchId", "name")
      .sort({
        levelNumber: 1,
        order: 1,
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      total: levels.length,
      levels,
    });
  } catch (error) {
    console.error("GET LEVELS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load levels",
      error: error.message,
    });
  }
};

// =========================================================
// GET SINGLE LEVEL
// GET /api/levels/:id
// =========================================================

const getLevelById = async (req, res) => {
  try {
    const levelId = String(
      req.params.id || ""
    ).trim();

    if (
      !mongoose.Types.ObjectId.isValid(levelId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid level ID",
      });
    }

    const level = await Level.findById(levelId)
      .populate("batchId", "name");

    if (!level) {
      return res.status(404).json({
        success: false,
        message: "Level not found",
      });
    }

    return res.status(200).json({
      success: true,
      level,
    });
  } catch (error) {
    console.error("GET LEVEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load level",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE LEVEL
// PUT /api/levels/:id
// =========================================================

const updateLevel = async (req, res) => {
  try {
    console.log("\n========== UPDATE LEVEL ==========");

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update levels",
      });
    }

    const levelId = String(
      req.params.id || ""
    ).trim();

    if (
      !mongoose.Types.ObjectId.isValid(levelId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid level ID",
      });
    }

    const {
      name,
      description,
      levelNumber,
      order,
      isActive,
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = String(name).trim();
    }

    if (description !== undefined) {
      updateData.description =
        String(description).trim();
    }

    if (levelNumber !== undefined) {
      updateData.levelNumber =
        Number(levelNumber);
    }

    if (order !== undefined) {
      updateData.order = Number(order);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const level = await Level.findByIdAndUpdate(
      levelId,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("batchId", "name");

    if (!level) {
      return res.status(404).json({
        success: false,
        message: "Level not found",
      });
    }

    console.log("✅ LEVEL UPDATED");

    return res.status(200).json({
      success: true,
      message: "Level updated successfully",
      level,
    });
  } catch (error) {
    console.error("UPDATE LEVEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update level",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE LEVEL
// DELETE /api/levels/:id
// =========================================================

const deleteLevel = async (req, res) => {
  try {
    console.log("\n========== DELETE LEVEL ==========");

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete levels",
      });
    }

    const levelId = String(
      req.params.id || ""
    ).trim();

    if (
      !mongoose.Types.ObjectId.isValid(levelId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid level ID",
      });
    }

    const level = await Level.findByIdAndDelete(
      levelId
    );

    if (!level) {
      return res.status(404).json({
        success: false,
        message: "Level not found",
      });
    }

    console.log("✅ LEVEL DELETED");

    return res.status(200).json({
      success: true,
      message: "Level deleted successfully",
    });
  } catch (error) {
    console.error("DELETE LEVEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete level",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  createLevel,
  getLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
};