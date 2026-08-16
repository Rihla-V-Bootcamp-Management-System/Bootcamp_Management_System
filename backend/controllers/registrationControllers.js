const Registration = require("../models/Registration");
const ApplicationForm = require("../models/ApplicationForm");

const createRegistration = async (req, res) => {
  try {
    const {
      seasonId,
      batchId,
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
      canCommitFiveHoursPerDay,
      motivation,
    } = req.body;

    if (
      !seasonId ||
      !batchId ||
      !fullName ||
      !gender ||
      !email ||
      !phoneNumber ||
      !telegramUsername ||
      educationLevel === undefined ||
      !educationInstitution ||
      !fieldOfStudy ||
      !studentId ||
      !programmingExperience ||
      hoursPerWeek === undefined ||
      canCommitFiveHoursPerDay === undefined ||
      !motivation
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const applicationForm = await ApplicationForm.findOne({ seasonId });

    if (!applicationForm) {
      return res.status(404).json({
        message: "Application form not found",
      });
    }

    if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({
        message: "Gender must be Male or Female",
      });
    }

    if (educationLevel < 1 || educationLevel > 5) {
      return res.status(400).json({
        message: "Education level must be between 1 and 5",
      });
    }

    if (hoursPerWeek < 25) {
      return res.status(400).json({
        message: "Hours per week must be at least 25",
      });
    }

    if (canCommitFiveHoursPerDay !== true) {
      return res.status(400).json({
        message: "Applicant must be able to commit at least 5 hours per day",
      });
    }

    if (motivation.length < 20 || motivation.length > 1000) {
      return res.status(400).json({
        message: "Motivation must be between 20 and 1000 characters",
      });
    }

    const registration = await Registration.create({
      seasonId,
      batchId,
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
      canCommitFiveHoursPerDay,
      motivation,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      registration,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRegistration,
};