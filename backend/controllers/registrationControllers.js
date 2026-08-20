const Registration = require("../models/Registration");

const createRegistration = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      batchId,
      department,
      experience,
    } = req.body;

    if (!fullName || !email || !phone || !batchId) {
      return res.status(400).json({
        message: "Full name, email, phone, and batch ID are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingRegistration = await Registration.findOne({
      email: normalizedEmail,
      batchId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You have already registered for this batch",
      });
    }

    const registration = await Registration.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      batchId: batchId.trim(),
      responses: {
        department: department || "",
        experience: experience || "",
      },
      status: "Submitted",
    });

    return res.status(201).json({
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email has already been registered for this batch",
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createRegistration,
};