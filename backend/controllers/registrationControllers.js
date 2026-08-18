const Registration = require("../models/Registration");
const ApplicationForm = require("../models/ApplicationForm");

const createRegistration = async (req, res) => {
  try {
    const {
      seasonId,
      fullName,
      gender,
      email,
      phoneNumber,
      telegramUsername,
      educationLevel,
      educationInstitution,
      fieldOfStudy,
      studentId,
      programmingExperience,
      githubLink,
      codeforcesLink,
      leetcodeLink,
      hoursPerWeek,
      motivation,
      responses,
    } = req.body;

    if (
      !seasonId ||
      !fullName ||
      !gender ||
      !email ||
      !phoneNumber ||
      !telegramUsername ||
      !educationLevel ||
      !educationInstitution ||
      !fieldOfStudy ||
      !studentId ||
      !programmingExperience ||
      !githubLink ||
      !codeforcesLink ||
      !leetcodeLink ||
      hoursPerWeek === undefined ||
      hoursPerWeek === null ||
      !motivation
    ) {
      return res.status(400).json({
        message: "All required registration fields must be provided",
      });
    }

    if (Number(hoursPerWeek) < 35) {
      return res.status(400).json({
        message: "Minimum required commitment is 35 hours per week",
      });
    }

    if (responses !== undefined && typeof responses !== "object") {
      return res.status(400).json({
        message: "responses must be an object",
      });
    }

    const applicationForm = await ApplicationForm.findOne({
      seasonId,
    });

    if (!applicationForm) {
      return res.status(404).json({
        message: "Application form not found",
      });
    }

    const submittedResponses = responses || {};

    for (const field of applicationForm.fields) {
      const value = submittedResponses[field.id];

      if (
        field.required &&
        (value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0))
      ) {
        return res.status(400).json({
          message: `${field.label} is required`,
        });
      }

      if (
        field.type === "select" ||
        field.type === "radio"
      ) {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          field.options.length > 0 &&
          !field.options.includes(value)
        ) {
          return res.status(400).json({
            message: `Invalid option for ${field.label}`,
          });
        }
      }

      if (field.type === "checkbox") {
        if (
          value !== undefined &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return res.status(400).json({
            message: `${field.label} must be an array`,
          });
        }
      }

      if (field.type === "number") {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          typeof value !== "number"
        ) {
          return res.status(400).json({
            message: `${field.label} must be a number`,
          });
        }
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingRegistration = await Registration.findOne({
      email: normalizedEmail,
      seasonId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You have already applied for this season.",
      });
    }

    const registration = await Registration.create({
      seasonId,
      fullName: fullName.trim(),
      gender,
      email: normalizedEmail,
      phoneNumber: phoneNumber.trim(),
      telegramUsername: telegramUsername.trim(),
      educationLevel,
      educationInstitution,
      fieldOfStudy,
      studentId: studentId.trim(),
      programmingExperience,
      githubLink: githubLink.trim(),
      codeforcesLink: codeforcesLink.trim(),
      leetcodeLink: leetcodeLink.trim(),
      hoursPerWeek,
      motivation: motivation.trim(),
      responses: submittedResponses,
      status: "SUBMITTED",
      submittedAt: new Date(),
    });

    return res.status(201).json({
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied for this season.",
      });
    }

    return res.status(500).json({
      message: "Failed to submit registration",
      error: error.message,
    });
  }
};

module.exports = {
  createRegistration,
};