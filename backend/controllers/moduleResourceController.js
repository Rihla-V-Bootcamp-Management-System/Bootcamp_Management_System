const mongoose = require("mongoose");
const ModuleResource = require("../models/ModuleResource");
const Module = require("../models/Module");

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
// ADMIN - CREATE MODULE RESOURCE
// POST /api/module-resources
// =========================================================

const createModuleResource = async (req, res) => {
  try {
    console.log("\n========== CREATE MODULE RESOURCE ==========");

    console.log("Logged in user:", {
      id: req.user?._id,
      name: req.user?.name,
      role: req.user?.role,
    });

    console.log("Request body:", req.body);

    // -----------------------------------------------------
    // CHECK ADMIN
    // -----------------------------------------------------

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can create module resources",
      });
    }

    // -----------------------------------------------------
    // GET DATA
    // -----------------------------------------------------

    const {
      moduleId,
      title,
      description,
      type,
      url,
      fileUrl,
      order,
    } = req.body;

    // -----------------------------------------------------
    // REQUIRED
    // -----------------------------------------------------

    if (!moduleId || !title) {
      return res.status(400).json({
        success: false,
        message: "moduleId and title are required",
      });
    }

    // -----------------------------------------------------
    // VALIDATE MODULE ID
    // -----------------------------------------------------

    const cleanModuleId = String(moduleId).trim();

    if (!mongoose.Types.ObjectId.isValid(cleanModuleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid moduleId",
      });
    }

    // -----------------------------------------------------
    // CHECK MODULE
    // -----------------------------------------------------

    const module = await Module.findById(cleanModuleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // -----------------------------------------------------
    // CREATE RESOURCE
    // -----------------------------------------------------

    const resource = await ModuleResource.create({
      moduleId: cleanModuleId,
      title: title.trim(),
      description: description?.trim() || "",
      type: type || "link",
      url: url?.trim() || "",
      fileUrl: fileUrl?.trim() || "",
      order: Number(order) || 0,
    });

    // -----------------------------------------------------
    // POPULATE
    // -----------------------------------------------------

    const populatedResource = await ModuleResource.findById(
      resource._id
    ).populate("moduleId", "name");

    console.log("✅ RESOURCE CREATED");

    return res.status(201).json({
      success: true,
      message: "Module resource created successfully",
      resource: populatedResource,
    });
  } catch (error) {
    console.error("CREATE MODULE RESOURCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create module resource",
      error: error.message,
    });
  }
};

// =========================================================
// GET RESOURCES FOR A MODULE
// GET /api/module-resources/module/:moduleId
// =========================================================

const getModuleResources = async (req, res) => {
  try {
    console.log("\n========== GET MODULE RESOURCES ==========");

    const moduleId = String(
      req.params.moduleId || ""
    ).trim();

    // -----------------------------------------------------
    // VALIDATE ID
    // -----------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID",
      });
    }

    // -----------------------------------------------------
    // CHECK MODULE
    // -----------------------------------------------------

    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // -----------------------------------------------------
    // GET RESOURCES
    // -----------------------------------------------------

    const resources = await ModuleResource.find({
      moduleId,
    })
      .populate("moduleId", "name")
      .sort({
        order: 1,
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      total: resources.length,
      resources,
    });
  } catch (error) {
    console.error("GET MODULE RESOURCES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load module resources",
      error: error.message,
    });
  }
};

// =========================================================
// GET SINGLE RESOURCE
// GET /api/module-resources/:id
// =========================================================

const getModuleResource = async (req, res) => {
  try {
    const resourceId = String(
      req.params.id || ""
    ).trim();

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    const resource = await ModuleResource.findById(
      resourceId
    ).populate("moduleId", "name");

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Module resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    console.error("GET MODULE RESOURCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load module resource",
      error: error.message,
    });
  }
};

// =========================================================
// ADMIN - UPDATE RESOURCE
// PUT /api/module-resources/:id
// =========================================================

const updateModuleResource = async (req, res) => {
  try {
    console.log("\n========== UPDATE MODULE RESOURCE ==========");

    // -----------------------------------------------------
    // CHECK ADMIN
    // -----------------------------------------------------

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update module resources",
      });
    }

    const resourceId = String(
      req.params.id || ""
    ).trim();

    // -----------------------------------------------------
    // VALIDATE ID
    // -----------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    // -----------------------------------------------------
    // GET DATA
    // -----------------------------------------------------

    const {
      title,
      description,
      type,
      url,
      fileUrl,
      order,
    } = req.body;

    // -----------------------------------------------------
    // BUILD UPDATE
    // -----------------------------------------------------

    const updateData = {};

    if (title !== undefined) {
      updateData.title = String(title).trim();
    }

    if (description !== undefined) {
      updateData.description = String(description).trim();
    }

    if (type !== undefined) {
      updateData.type = type;
    }

    if (url !== undefined) {
      updateData.url = String(url).trim();
    }

    if (fileUrl !== undefined) {
      updateData.fileUrl = String(fileUrl).trim();
    }

    if (order !== undefined) {
      updateData.order = Number(order) || 0;
    }

    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

    const resource =
      await ModuleResource.findByIdAndUpdate(
        resourceId,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("moduleId", "name");

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Module resource not found",
      });
    }

    console.log("✅ RESOURCE UPDATED");

    return res.status(200).json({
      success: true,
      message: "Module resource updated successfully",
      resource,
    });
  } catch (error) {
    console.error("UPDATE MODULE RESOURCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update module resource",
      error: error.message,
    });
  }
};

// =========================================================
// ADMIN - DELETE RESOURCE
// DELETE /api/module-resources/:id
// =========================================================

const deleteModuleResource = async (req, res) => {
  try {
    console.log("\n========== DELETE MODULE RESOURCE ==========");

    // -----------------------------------------------------
    // CHECK ADMIN
    // -----------------------------------------------------

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete module resources",
      });
    }

    const resourceId = String(
      req.params.id || ""
    ).trim();

    // -----------------------------------------------------
    // VALIDATE ID
    // -----------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    // -----------------------------------------------------
    // DELETE
    // -----------------------------------------------------

    const resource =
      await ModuleResource.findByIdAndDelete(
        resourceId
      );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Module resource not found",
      });
    }

    console.log("✅ RESOURCE DELETED");

    return res.status(200).json({
      success: true,
      message: "Module resource deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MODULE RESOURCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete module resource",
      error: error.message,
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  createModuleResource,
  getModuleResources,
  getModuleResource,
  updateModuleResource,
  deleteModuleResource,
};