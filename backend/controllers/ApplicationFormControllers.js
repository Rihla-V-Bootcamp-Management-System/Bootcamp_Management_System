const ApplicationForm = require("../models/ApplicationForm");

const createApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { fields } = req.body;

    if (!seasonId) {
      return res.status(400).json({
        message: "seasonId is required",
      });
    }

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        message: "fields must be an array",
      });
    }

    const existingForm = await ApplicationForm.findOne({
      seasonId,
    });

    if (existingForm) {
      return res.status(409).json({
        message: "Application form already exists for this season",
      });
    }

    const applicationForm = await ApplicationForm.create({
      seasonId,
      fields,
    });

    return res.status(201).json({
      message: "Application form created successfully",
      applicationForm,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create application form",
      error: error.message,
    });
  }
};

const updateApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { fields } = req.body;

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        message: "fields must be an array",
      });
    }

    const applicationForm =
      await ApplicationForm.findOneAndUpdate(
        { seasonId },
        { fields },
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
    return res.status(500).json({
      message: "Failed to update application form",
      error: error.message,
    });
  }
};

const getApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const applicationForm = await ApplicationForm.findOne({
      seasonId,
    });

    if (!applicationForm) {
      return res.status(404).json({
        message: "Application form not found",
      });
    }

    return res.status(200).json(applicationForm);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get application form",
      error: error.message,
    });
  }
};

module.exports = {
  createApplicationForm,
  updateApplicationForm,
  getApplicationForm,
};