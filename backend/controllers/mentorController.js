const Batch = require("../models/Batch");

// Get students assigned to the logged-in mentor's batch
const getMyStudents = async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({
        message: "Only mentors can view assigned students",
      });
    }

    // Find batches assigned to this mentor
    const batches = await Batch.find({
      mentorIds: req.user._id,
    }).populate("studentIds", "userID name email role");

    // Extract all students from those batches
    const students = batches.flatMap((batch) => batch.studentIds);

    return res.status(200).json({
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("Get mentor students error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


// Get batch assigned to the logged-in mentor
const getMyBatch = async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({
        message: "Only mentors can view assigned batches",
      });
    }

    const batches = await Batch.find({
      mentorIds: req.user._id,
    })
      .populate("studentIds", "userID name email role")
      .populate("mentorIds", "userID name email role");

    return res.status(200).json({
      total: batches.length,
      batches,
    });
  } catch (error) {
    console.error("Get mentor batches error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  getMyStudents,
  getMyBatch,
};