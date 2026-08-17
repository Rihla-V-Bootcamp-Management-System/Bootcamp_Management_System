const Registration = require("../models/Registration");

const createRegistration = async (req, res) => {
  try {
    const {
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
      seasonId,
    } = req.body;

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
      seasonId,
    });

    return res.status(201).json({
      message: "Registration submitted successfully.",
      registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied for this season.",
      });
    }

    return res.status(500).json({
      message: "Failed to submit registration.",
      error: error.message,
    });
  }
};

module.exports = {
  createRegistration,
};