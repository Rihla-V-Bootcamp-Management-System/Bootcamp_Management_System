const Batch = require("../models/Batch");

const getMyStudents = async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({
        message: "Only mentors can view assigned students",
      });
    }

    const batches = await Batch.find({
      mentorIds: req.user._id,
    }).populate(
      "studentIds",
      "userID name email role"
    );

    const studentsMap = new Map();

    batches.forEach((batch) => {
      batch.studentIds.forEach((student) => {
        if (!student) return;

        const studentId = student._id.toString();

        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            _id: student._id,
            userID: student.userID,
            name: student.name || "Unknown Student",
            email: student.email || "",
            batchId: batch._id,
            batchName: batch.name,
          });
        }
      });
    });

    const students = Array.from(studentsMap.values());

    return res.status(200).json({
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("GET MY STUDENTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load assigned students",
    });
  }
};

module.exports = {
  getMyStudents,
};