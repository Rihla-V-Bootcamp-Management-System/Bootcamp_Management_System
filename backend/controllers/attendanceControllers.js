const Attendance = require("../models/Attendance");

const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);

    res.status(201).json({
      message: "Attendance created successfully",
      attendance,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getAttendanceByStudent = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      student: req.params.studentId,
    }).populate("student", "name email");

    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getAttendancePercentage = async (req, res) => {
  try {
    const records = await Attendance.find({
      student: req.params.studentId,
    });

    if (records.length === 0) {
      return res.status(200).json({
        percentage: 0,
      });
    }

    const presentCount = records.filter(
      (record) =>
        record.status === "Present" || record.status === "Late"
    ).length;

    const percentage = (presentCount / records.length) * 100;

    res.status(200).json({
      percentage: Number(percentage.toFixed(2)),
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAttendance,
  getAttendanceByStudent,
  getAttendancePercentage,
};