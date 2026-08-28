const mongoose = require("mongoose");

const ApplicationForm = require("../models/ApplicationForm");
const Season = require("../models/Season");

// =====================================================
// GET CURRENT APPLICATION FORM
// GET /api/application-forms
//
// IMPORTANT:
// This does NOT check isOpen.
// The application form is independent from
// registration open/closed control.
// =====================================================

const getCurrentApplicationForm = async (req, res) => {
  try {
    // -------------------------------------------------
    // Get the latest season
    // -------------------------------------------------

    const season = await Season.findOne()
      .sort({
        createdAt: -1,
      });

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "No application season has been created yet",
      });
    }

    console.log(
      "Application Form Season:",
      season._id.toString()
    );

    console.log(
      "Application Form Season Name:",
      season.name
    );

    // -------------------------------------------------
    // Find application form for this season
    // -------------------------------------------------

    let applicationForm =
      await ApplicationForm.findOne({
        seasonId: season._id,
      });

    // -------------------------------------------------
    // If form doesn't exist, create empty form
    // -------------------------------------------------

    if (!applicationForm) {
      applicationForm =
        await ApplicationForm.create({
          seasonId: season._id,
          fields: [],
        });

      console.log(
        "Created empty application form:",
        applicationForm._id.toString()
      );
    }

    // -------------------------------------------------
    // Return
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      season,
      applicationForm,
    });
  } catch (error) {
    console.error(
      "Get current application form error:",
      error
    );

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

    // -------------------------------------------------
    // Validate season ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        seasonId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid seasonId",
      });
    }

    // -------------------------------------------------
    // Validate fields
    // -------------------------------------------------

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "fields must be an array",
      });
    }

    // -------------------------------------------------
    // Check season
    // -------------------------------------------------

    const season =
      await Season.findById(seasonId);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found",
      });
    }

    // -------------------------------------------------
    // Check existing form
    // -------------------------------------------------

    const existingForm =
      await ApplicationForm.findOne({
        seasonId,
      });

    if (existingForm) {
      return res.status(409).json({
        success: false,
        message:
          "Application form already exists for this season",
        applicationForm: existingForm,
      });
    }

    // -------------------------------------------------
    // Create
    // -------------------------------------------------

    const applicationForm =
      await ApplicationForm.create({
        seasonId,
        fields,
      });

    return res.status(201).json({
      success: true,
      message:
        "Application form created successfully",
      applicationForm,
    });
  } catch (error) {
    console.error(
      "Create application form error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create application form",
      error: error.message,
    });
  }
};

// =====================================================
// GET APPLICATION FORM BY SEASON
// GET /api/application-forms/:seasonId
// =====================================================

const getApplicationForm = async (
  req,
  res
) => {
  try {
    const { seasonId } = req.params;

    // -------------------------------------------------
    // Validate season ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        seasonId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid seasonId",
      });
    }

    // -------------------------------------------------
    // Find season
    // -------------------------------------------------

    const season =
      await Season.findById(seasonId);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found",
      });
    }

    // -------------------------------------------------
    // Find form
    // -------------------------------------------------

    let applicationForm =
      await ApplicationForm.findOne({
        seasonId,
      });

    // -------------------------------------------------
    // Automatically create empty form
    // -------------------------------------------------

    if (!applicationForm) {
      applicationForm =
        await ApplicationForm.create({
          seasonId,
          fields: [],
        });
    }

    // -------------------------------------------------
    // Return
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      season,
      applicationForm,
    });
  } catch (error) {
    console.error(
      "Get application form error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get application form",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE APPLICATION FORM
// PATCH /api/application-forms/:seasonId
// =====================================================

const updateApplicationForm = async (
  req,
  res
) => {
  try {
    const { seasonId } = req.params;
    const { fields } = req.body;

    // -------------------------------------------------
    // Validate season ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        seasonId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid seasonId",
      });
    }

    // -------------------------------------------------
    // Validate fields
    // -------------------------------------------------

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "fields must be an array",
      });
    }

    // -------------------------------------------------
    // Check season
    // -------------------------------------------------

    const season =
      await Season.findById(seasonId);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: "Season not found",
      });
    }

    // -------------------------------------------------
    // Update
    // -------------------------------------------------

    let applicationForm =
      await ApplicationForm.findOneAndUpdate(
        {
          seasonId,
        },
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

    // -------------------------------------------------
    // If form doesn't exist, create it
    // -------------------------------------------------

    if (!applicationForm) {
      applicationForm =
        await ApplicationForm.create({
          seasonId,
          fields,
        });
    }

    // -------------------------------------------------
    // Return
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Application form saved successfully",
      applicationForm,
    });
  } catch (error) {
    console.error(
      "Update application form error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save application form",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createApplicationForm,
  getApplicationForm,
  updateApplicationForm,
  getCurrentApplicationForm,
};