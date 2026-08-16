const ApplicationForm = require("../models/ApplicationForm");

const createApplicationForm = async (req, res) => {
  try {
    const { seasonId, fields } = req.body;

    const form = await ApplicationForm.create({
      seasonId,
      fields
    });

    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateApplicationForm = async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { fields } = req.body;

    const form = await ApplicationForm.findOneAndUpdate(
      { seasonId },
      { fields },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({
        message: "Application form not found"
      });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createApplicationForm,
  updateApplicationForm
};