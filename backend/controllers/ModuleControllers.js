const Module = require("../models/Module");
const mongoose = require("mongoose");
// =========================================================
// HELPER
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
// CREATE MODULE
// POST /api/modules
// =========================================================

const createModule = async (req, res) => {
  try {
    // -----------------------------------------------------
    // CHECK ADMIN
    // -----------------------------------------------------

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create modules",
      });
    }

    const {
      title,
      description,
      level,
      batchId,
      order,
    } = req.body;

    // -----------------------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------------------

    if (!title || level === undefined || !batchId) {
      return res.status(400).json({
        success: false,
        message: "Title, level and batchId are required",
      });
    }

    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    const module = await Module.create({
      title,
      description,
      level,
      batchId,
      order: order || 1,
    });

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      module,
    });
  } catch (error) {
    console.error("CREATE MODULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create module",
      error: error.message,
    });
  }
};

// =========================================================
// GET MODULES
// GET /api/modules
// =========================================================

// =========================================================
// GET MODULES
// GET /api/modules
// =========================================================

const getModules = async (req, res) => {
  try {
    const { batchId, level } = req.query;

    const filter = {};

    // -----------------------------------------------------
    // VALIDATE BATCH ID
    // -----------------------------------------------------

    if (batchId) {
      const cleanBatchId = String(batchId).trim();

      if (!mongoose.Types.ObjectId.isValid(cleanBatchId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid batchId",
        });
      }

      filter.batchId = cleanBatchId;
    }

    // -----------------------------------------------------
    // LEVEL FILTER
    // -----------------------------------------------------

    if (level !== undefined) {
      const cleanLevel = Number(level);

      if (Number.isNaN(cleanLevel)) {
        return res.status(400).json({
          success: false,
          message: "Invalid level",
        });
      }

      filter.level = cleanLevel;
    }

    // -----------------------------------------------------
    // GET MODULES
    // -----------------------------------------------------

    const modules = await Module.find(filter)
      .populate("batchId", "name")
      .sort({
        level: 1,
        order: 1,
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      total: modules.length,
      modules,
    });
  } catch (error) {
    console.error("GET MODULES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load modules",
      error: error.message,
    });
  }
};
// =========================================================
// GET SINGLE MODULE
// GET /api/modules/:id
// =========================================================

const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate("batchId", "name");

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    return res.status(200).json({
      success: true,
      module,
    });
  } catch (error) {
    console.error("GET MODULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get module",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE MODULE
// PUT /api/modules/:id
// =========================================================

const updateModule = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update modules",
      });
    }

    const {
      title,
      description,
      level,
      batchId,
      order,
      isActive,
    } = req.body;

    const module = await Module.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && {
            description,
          }),
          ...(level !== undefined && { level }),
          ...(batchId !== undefined && { batchId }),
          ...(order !== undefined && { order }),
          ...(isActive !== undefined && { isActive }),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("batchId", "name");

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      module,
    });
  } catch (error) {
    console.error("UPDATE MODULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update module",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE MODULE
// DELETE /api/modules/:id
// =========================================================

const deleteModule = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete modules",
      });
    }

    const module = await Module.findByIdAndDelete(
      req.params.id
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MODULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete module",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
};