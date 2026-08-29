const mongoose = require("mongoose");
const CapstoneProject = require("../models/CapstoneProject");
const Batch = require("../models/Batch");
const User = require("../models/User");

// =========================================================
// GET ALL CAPSTONE PROJECTS
// =========================================================

const getCapstoneProjects = async (req, res) => {
  try {
    const { batchId, level } = req.query;
    const query = { isActive: true };

    if (batchId && mongoose.Types.ObjectId.isValid(batchId)) {
      query.batchId = batchId;
    } else if (req.user?.batchId) {
      query.batchId = req.user.batchId;
    }

    if (level) {
      query.level = Number(level);
    }

    const projects = await CapstoneProject.find(query)
      .populate("batchId", "name startDate")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("GET CAPSTONE PROJECTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch capstone projects",
      error: error.message,
    });
  }
};

// =========================================================
// GET SINGLE CAPSTONE PROJECT BY ID
// =========================================================

const getCapstoneProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid capstone project ID",
      });
    }

    const project = await CapstoneProject.findById(id)
      .populate("batchId", "name startDate")
      .populate("createdBy", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Capstone project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("GET CAPSTONE PROJECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch capstone project",
      error: error.message,
    });
  }
};

// =========================================================
// CREATE CAPSTONE PROJECT (Admin / Superadmin / Mentor)
// =========================================================

const createCapstoneProject = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      level,
      batchId,
      dueDate,
      maxScore,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (level === undefined || level === null) {
      return res.status(400).json({
        success: false,
        message: "Level is required",
      });
    }

    const targetBatchId = batchId || req.user.batchId;
    if (!targetBatchId || !mongoose.Types.ObjectId.isValid(targetBatchId)) {
      return res.status(400).json({
        success: false,
        message: "A valid batchId is required",
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: "Due date is required",
      });
    }

    const project = await CapstoneProject.create({
      title: title.trim(),
      description: description.trim(),
      requirements: requirements?.trim() || "",
      level: Number(level),
      batchId: targetBatchId,
      dueDate: new Date(dueDate),
      maxScore: maxScore ? Number(maxScore) : 100,
      createdBy: req.user._id,
      isActive: true,
    });

    const populated = await CapstoneProject.findById(project._id)
      .populate("batchId", "name")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Capstone project created successfully",
      project: populated,
    });
  } catch (error) {
    console.error("CREATE CAPSTONE PROJECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create capstone project",
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE CAPSTONE PROJECT
// =========================================================

const updateCapstoneProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await CapstoneProject.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Capstone project not found",
      });
    }

    const {
      title,
      description,
      requirements,
      level,
      batchId,
      dueDate,
      maxScore,
      isActive,
    } = req.body;

    if (title !== undefined) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (requirements !== undefined) project.requirements = requirements.trim();
    if (level !== undefined) project.level = Number(level);
    if (batchId !== undefined && mongoose.Types.ObjectId.isValid(batchId)) {
      project.batchId = batchId;
    }
    if (dueDate !== undefined) project.dueDate = new Date(dueDate);
    if (maxScore !== undefined) project.maxScore = Number(maxScore);
    if (isActive !== undefined) project.isActive = Boolean(isActive);

    await project.save();

    const updated = await CapstoneProject.findById(project._id)
      .populate("batchId", "name")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Capstone project updated successfully",
      project: updated,
    });
  } catch (error) {
    console.error("UPDATE CAPSTONE PROJECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update capstone project",
      error: error.message,
    });
  }
};

// =========================================================
// DELETE / DEACTIVATE CAPSTONE PROJECT
// =========================================================

const deleteCapstoneProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await CapstoneProject.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Capstone project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Capstone project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CAPSTONE PROJECT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete capstone project",
    });
  }
};

module.exports = {
  getCapstoneProjects,
  getCapstoneProjectById,
  createCapstoneProject,
  updateCapstoneProject,
  deleteCapstoneProject,
};
