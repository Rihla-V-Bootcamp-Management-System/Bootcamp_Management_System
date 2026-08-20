const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");

const isMentorAssigned = (batch, mentorId) => {
  return batch.mentorIds.some(
    (id) => id.toString() === mentorId.toString()
  );
};

const isStudentInBatch = (batch, studentId) => {
  return batch.studentIds.some(
    (id) => id.toString() === studentId.toString()
  );
};

const calculatePercentage = (records) => {
  const applicableSessions = records.filter(
    (record) => record.status !== "Excused"
  );

  const presentSessions = applicableSessions.filter(
    (record) => record.status === "Present"
  );

  if (applicableSessions.length === 0) {
    return 0;
  }

  return Number(
    ((presentSessions.length / applicableSessions.length) * 100).toFixed(2)
  );
};

const createAttendance = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can create attendance",
      });
    }

    const {
      studentId,
      batchId,
      sessionDate,
      status,
      notes,
    } = req.body;

    if (!studentId || !batchId || !sessionDate || !status) {
      return res.status(400).json({
        message:
          "studentId, batchId, sessionDate and status are required",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    if (!isStudentInBatch(batch, studentId)) {
      return res.status(403).json({
        message: "Student is not in this batch",
      });
    }

    const attendance = await Attendance.create({
      studentId,
      batchId,
      sessionDate,
      status,
      notes,
      markedBy: req.user.id,
    });

    return res.status(201).json({
      message: "Attendance created successfully",
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance already exists for this session",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("batchId", "name")
      .populate("markedBy", "name");

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    if (req.user.role === "ADMIN") {
      return res.status(200).json({
        attendance,
      });
    }

    if (req.user.role === "MENTOR") {
      const batch = await Batch.findById(attendance.batchId._id);

      if (!batch) {
        return res.status(404).json({
          message: "Batch not found",
        });
      }

      if (!isMentorAssigned(batch, req.user.id)) {
        return res.status(403).json({
          message: "You are not assigned to this batch",
        });
      }

      return res.status(200).json({
        attendance,
      });
    }

    if (req.user.role === "STUDENT") {
      if (
        attendance.studentId._id.toString() !==
        req.user.id.toString()
      ) {
        return res.status(403).json({
          message: "You can only view your own attendance",
        });
      }

      return res.status(200).json({
        attendance,
      });
    }

    return res.status(403).json({
      message: "Access denied",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getAttendance = async (req, res) => {
  try {
    const { studentId, batchId, from, to } = req.query;

    const filter = {};

    if (req.user.role === "ADMIN") {
      if (studentId) {
        filter.studentId = studentId;
      }

      if (batchId) {
        filter.batchId = batchId;
      }
    } else if (req.user.role === "MENTOR") {
      if (!batchId) {
        return res.status(400).json({
          message: "batchId is required",
        });
      }

      const batch = await Batch.findById(batchId);

      if (!batch) {
        return res.status(404).json({
          message: "Batch not found",
        });
      }

      if (!isMentorAssigned(batch, req.user.id)) {
        return res.status(403).json({
          message: "You are not assigned to this batch",
        });
      }

      filter.batchId = batchId;

      if (studentId) {
        if (!isStudentInBatch(batch, studentId)) {
          return res.status(403).json({
            message: "Student is not in this batch",
          });
        }

        filter.studentId = studentId;
      }
    } else if (req.user.role === "STUDENT") {
      filter.studentId = req.user.id;

      if (batchId) {
        filter.batchId = batchId;
      }
    } else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (from || to) {
      filter.sessionDate = {};

      if (from) {
        filter.sessionDate.$gte = new Date(from);
      }

      if (to) {
        filter.sessionDate.$lte = new Date(to);
      }
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "name email")
      .populate("batchId", "name")
      .populate("markedBy", "name")
      .sort({ sessionDate: -1 });

    const attendancePercentage = calculatePercentage(records);

    return res.status(200).json({
      attendancePercentage,
      totalRecords: records.length,
      attendance: records,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can update attendance",
      });
    }

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    const { status, notes, sessionDate } = req.body;

    if (status !== undefined) {
      attendance.status = status;
    }

    if (notes !== undefined) {
      attendance.notes = notes;
    }

    if (sessionDate !== undefined) {
      attendance.sessionDate = sessionDate;
    }

    attendance.markedBy = req.user.id;

    await attendance.save();

    return res.status(200).json({
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance already exists for this session",
      });
    }

    return res.status(500).json({
      message: error.message,
    });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can delete attendance",
      });
    }

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getAttendanceStats = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only admins can view attendance statistics",
      });
    }

    const { batchId, from, to } = req.query;

    const filter = {};

    if (batchId) {
      filter.batchId = batchId;
    }

    if (from || to) {
      filter.sessionDate = {};

      if (from) {
        filter.sessionDate.$gte = new Date(from);
      }

      if (to) {
        filter.sessionDate.$lte = new Date(to);
      }
    }

    const records = await Attendance.find(filter);

    const totalApplicableSessions = records.filter(
      (record) => record.status !== "Excused"
    ).length;

    const presentSessions = records.filter(
      (record) => record.status === "Present"
    ).length;

    const absentSessions = records.filter(
      (record) => record.status === "Absent"
    ).length;

    const lateSessions = records.filter(
      (record) => record.status === "Late"
    ).length;

    const attendancePercentage =
      totalApplicableSessions === 0
        ? 0
        : Number(
            (
              (presentSessions / totalApplicableSessions) *
              100
            ).toFixed(2)
          );

    return res.status(200).json({
      totalApplicableSessions,
      presentSessions,
      absentSessions,
      lateSessions,
      attendancePercentage,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAttendance,
  getAttendanceById,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
};