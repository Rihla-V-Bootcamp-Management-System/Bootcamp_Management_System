const Registration = require("../models/Registration");

const createRegistration = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      batchId,
      responses,
      department,
      experience,
    } = req.body;

    if (!fullName || !email || !phone || !gender || !batchId) {
      return res.status(400).json({
        message: "Full name, email, phone, gender, and batch ID are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedBatchId = batchId.trim();

    const existingRegistration = await Registration.findOne({
      email: normalizedEmail,
      batchId: normalizedBatchId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You have already registered for this batch",
      });
    }

    const registrationResponses =
      responses && typeof responses === "object"
        ? responses
        : {
            department: department || "",
            experience: experience || "",
          };

    const registration = await Registration.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      gender,
      batchId: normalizedBatchId,
      responses: registrationResponses,
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