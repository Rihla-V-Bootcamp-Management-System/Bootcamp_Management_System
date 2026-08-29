const Certificate = require("../models/Certificate");

// =========================================================
// GET MY CERTIFICATES
// Student can only see certificates belonging to themselves
// =========================================================

const getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;

    const certificates = await Certificate.find({
      studentId,
    })
      .populate("batchId", "name year season startDate endDate")
      .populate("studentId", "name email userID gender")
      .populate("issuedBy", "name email")
      .sort({ issuedAt: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Get my certificates error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load your certificates.",
    });
  }
};

// =========================================================
// GET MY SINGLE CERTIFICATE
// =========================================================

const getMyCertificateById = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;
    const { id } = req.params;

    const certificate = await Certificate.findOne({
      _id: id,
      studentId,
    })
      .populate("batchId", "name year season startDate endDate")
      .populate("studentId", "name email userID gender")
      .populate("issuedBy", "name email");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Get my certificate error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load certificate.",
    });
  }
};

module.exports = {
  getMyCertificates,
  getMyCertificateById,
};
