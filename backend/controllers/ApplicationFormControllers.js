const Registration = require("../models/Registration");

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

    if (!["Male", "Female"].includes(gender)) {
      return res.status(400).json({
        message: "Gender must be Male or Female",
      });
    }

    if (educationLevel < 1 || educationLevel > 3) {
      return res.status(400).json({
        message: "Education level must be between 1 and 3",
      });
    }

    if (hoursPerWeek < 5) {
      return res.status(400).json({
        message: "Hours per week must be at least 5",
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
      email: normalizedEmail,
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

    return res.status(201).json({
      message: "Application submitted successfully",
      registration,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRegistration,
};