const EmailTemplate = require("../models/EmailTemplate");

const getEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find()
      .sort({ type: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("GET EMAIL TEMPLATES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get email templates",
      error: error.message,
    });
  }
};

const getEmailTemplate = async (req, res) => {
  try {
    const { type } = req.params;

    const validTypes = [
      "SHORTLISTED",
      "ACCEPTED",
      "REJECTED",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email template type",
      });
    }

    const template = await EmailTemplate.findOne({
      type,
    }).lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("GET EMAIL TEMPLATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get email template",
      error: error.message,
    });
  }
};

const updateEmailTemplate = async (req, res) => {
  try {
    const { type } = req.params;
    const { subject, text, html } = req.body;

    const validTypes = [
      "SHORTLISTED",
      "ACCEPTED",
      "REJECTED",
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email template type",
      });
    }

    if (
      subject === undefined ||
      text === undefined ||
      html === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "subject, text, and html are required",
      });
    }

    const template = await EmailTemplate.findOneAndUpdate(
      { type },
      {
        $set: {
          subject,
          text,
          html,
          updatedBy: req.user._id,
        },
      },
      {
        new: true,
        runValidators: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: `${type} email template updated successfully`,
      template,
    });
  } catch (error) {
    console.error("UPDATE EMAIL TEMPLATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update email template",
      error: error.message,
    });
  }
};

module.exports = {
  getEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
};