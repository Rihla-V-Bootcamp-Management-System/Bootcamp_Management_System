const User = require("../models/User");
const Batch = require("../models/Batch");

const getAnalyticsOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      students,
      mentors,
      admins,
      batches,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "mentor" }),
      User.countDocuments({
        role: { $in: ["admin", "superadmin"] },
      }),
      Batch.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        students,
        mentors,
        admins,
        batches,
      },
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getAnalyticsOverview,
};