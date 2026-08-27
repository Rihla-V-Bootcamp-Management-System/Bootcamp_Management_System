const mongoose = require("mongoose");
const ApplicationForm = require("../models/ApplicationForm");
const Season = require("../models/Season");

// =====================================================
// GET CURRENT APPLICATION FORM
// GET /api/application-forms
// =====================================================

const getCurrentApplicationForm = async (req, res) => {
  try {
    const season = await Season.findOne({
      isOpen: true,
    }).sort({
      createdAt: -1,
    });

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "No application season is currently open",
      });
    }

    const applicationForm = await ApplicationForm.findOne({
      seasonId: season._id,
    });

    if (!applicationForm) {
      return res.status(404).json({
        success: false,
        message: "Application form not found for current season",
        seasonId: season._id,
      });
    }

    return res.status(200).json({
      success: true,
      season,
      applicationForm,
    });
  } catch (error) {
    console.error("Get application form error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get application form",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE APPLICATION FORM
// POST /api/application-forms/:seasonId
// =====================================================

const createApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { fields } = req.body;

    if (!mongoose.Types.ObjectId.isValid(seasonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seasonId",
      });
    }

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "fields must be an array",
      });
    }

    const season = await Season.findById(seasonId);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found",
      });
    }

    const existingForm = await ApplicationForm.findOne({
      seasonId,
    });

    if (existingForm) {
      return res.status(409).json({
        success: false,
        message: "Application form already exists for this season",
        applicationForm: existingForm,
      });
    }

    const applicationForm = await ApplicationForm.create({
      seasonId,
      fields,
    });

    return res.status(201).json({
      success: true,
      message: "Application form created successfully",
      applicationForm,
    });
  } catch (error) {
    console.error("Create application form error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create application form",
      error: error.message,
    });
  }
};

// =====================================================
// GET APPLICATION FORM BY SEASON
// GET /api/application-forms/:seasonId
// =====================================================

const getApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(seasonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seasonId",
      });
    }

    const applicationForm = await ApplicationForm.findOne({
      seasonId,
    });

    if (!applicationForm) {
      return res.status(404).json({
        success: false,
        message: "Application form not found",
      });
    }

    const season = await Season.findById(seasonId);

    return res.status(200).json({
      success: true,
      season,
      applicationForm,
    });
  } catch (error) {
    console.error("Get application form error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get application form",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE APPLICATION FORM
// PATCH /api/application-forms/:seasonId
// =====================================================

const updateApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { fields } = req.body;

    if (!mongoose.Types.ObjectId.isValid(seasonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seasonId",
      });
    }

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "fields must be an array",
      });
    }

    const applicationForm =
      await ApplicationForm.findOneAndUpdate(
        { seasonId },
        {
          $set: {
            fields,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!applicationForm) {
      return res.status(404).json({
        success: false,
        message: "Application form not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application form updated successfully",
      applicationForm,
    });
  } catch (error) {
    console.error("Update application form error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application form",
      error: error.message,
    });
  }
};

module.exports = {
  createApplicationForm,
  getApplicationForm,
  updateApplicationForm,
  getCurrentApplicationForm,
};