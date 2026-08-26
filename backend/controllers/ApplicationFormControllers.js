const mongoose = require("mongoose");
const ApplicationForm = require("../models/ApplicationForm");
const Season = require("../models/Season");

// =====================================================
// GET APPLICATION FORM FOR CURRENT OPEN SEASON
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
        message: "No application season is currently open",
      });
    }

    const applicationForm = await ApplicationForm.findOne({
      seasonId: season._id,
    });

    if (!applicationForm) {
      return res.status(404).json({
        message:
          "Application form not found for the current season",
        seasonId: season._id,
      });
    }

    return res.status(200).json({
      season,
      applicationForm,
    });
  } catch (error) {
    console.error(
      "Get current application form error:",
      error
    );

    return res.status(500).json({
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
        message: "Invalid seasonId",
      });
    }

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        message: "fields must be an array",
      });
    }

    const season = await Season.findById(seasonId);

    if (!season) {
      return res.status(404).json({
        message: "Season not found",
      });
    }

    const existingForm = await ApplicationForm.findOne({
      seasonId,
    });

    if (existingForm) {
      return res.status(409).json({
        message:
          "Application form already exists for this season",
        applicationForm: existingForm,
      });
    }

    const applicationForm =
      await ApplicationForm.create({
        seasonId,
        fields,
      });

    return res.status(201).json({
      message: "Application form created successfully",
      applicationForm,
    });
  } catch (error) {
    console.error(
      "Create application form error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create application form",
      error: error.message,
    });
  }
};

// =====================================================
// GET FORM BY SEASON
// GET /api/application-forms/:seasonId
// =====================================================

const getApplicationForm = async (req, res) => {
  try {
    const season = await Season.findOne({
      isOpen: true,
    }).sort({
      createdAt: -1,
    });

    if (!season) {
      return res.status(404).json({
        message: "No application season is currently open",
      });
    }

    // First try to find the form belonging to the current season
    let applicationForm = await ApplicationForm.findOne({
      seasonId: season._id,
    });

    // If there is no form for the current season,
    // use the most recently created application form.
    if (!applicationForm) {
      applicationForm = await ApplicationForm.findOne().sort({
        createdAt: -1,
      });
    }

    if (!applicationForm) {
      return res.status(404).json({
        message: "No application form exists",
      });
    }

    return res.status(200).json({
      season,
      applicationForm,
    });
  } catch (error) {
    console.error(
      "Get current application form error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get application form",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE FORM FIELDS
// PATCH /api/application-forms/:seasonId
//
// This updates ONLY the fields.
// =====================================================

const updateApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { fields } = req.body;

    if (!mongoose.Types.ObjectId.isValid(seasonId)) {
      return res.status(400).json({
        message: "Invalid seasonId",
      });
    }

    if (!Array.isArray(fields)) {
      return res.status(400).json({
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
        message: "Application form not found",
      });
    }

    return res.status(200).json({
      message: "Application form updated successfully",
      applicationForm,
    });
  } catch (error) {
    console.error(
      "Update application form error:",
      error
    );

    return res.status(500).json({
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