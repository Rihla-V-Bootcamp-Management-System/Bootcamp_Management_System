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
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRecord = await Attendance.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: `No record found with ID: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
      data: updatedRecord,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update attendance record",
      error: error.message,
    });
  }
};

module.exports = {
  createAttendance,
  getAttendanceByStudent,
  getAttendancePercentage,
  updateAttendance,
};


