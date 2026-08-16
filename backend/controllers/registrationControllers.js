const Registration = require("../models/Registration");
const ApplicationForm = require("../models/ApplicationForm");

const createRegistration = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      batchId,
      seasonId,
      responses
    } = req.body;

    if (!fullName || !email || !phone || !batchId || !seasonId || !responses) {
      return res.status(400).json({
        message: "Required fields are missing"
      });
    }

    const applicationForm = await ApplicationForm.findOne({ seasonId });

    if (!applicationForm) {
      return res.status(404).json({
        message: "Application form not found"
      });
    }

    for (const field of applicationForm.fields) {
      const value = responses[field.id];

      if (
        field.required &&
        (value === undefined || value === null || value === "")
      ) {
        return res.status(400).json({
          message: `${field.label} is required`
        });
      }

      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (field.type === "number" && typeof value !== "number") {
        return res.status(400).json({
          message: `${field.label} must be a number`
        });
      }

      if (
        ["select", "radio"].includes(field.type) &&
        field.options.length > 0 &&
        !field.options.includes(value)
      ) {
        return res.status(400).json({
          message: `${field.label} has an invalid option`
        });
      }
    }

    const registration = await Registration.create({
      fullName,
      email,
      phone,
      batchId,
      responses
    });

    res.status(201).json({
      message: "Registration submitted successfully",
      registration
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createRegistration
};