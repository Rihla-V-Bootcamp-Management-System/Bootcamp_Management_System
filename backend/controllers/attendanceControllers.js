const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");
const User = require("../models/User");

const {
  calculateWeek,
  calculateAttendance,
  getSessionDate,
  buildSessionTimes,
} = require("../services/attendanceTracker");

// =========================================================
// HELPERS
// =========================================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id;
};

const getRole = (req) => {
  return String(req.user?.role || "").toUpperCase();
};

const isAdmin = (req) => {
  const role = getRole(req);

  return (
    role === "ADMIN" ||
    role === "SUPERADMIN"
  );
};

// =========================================================
// BATCH STUDENTS
// =========================================================

const getBatchStudentIds = (batch) => {
  if (!batch) {
    return [];
  }

  if (Array.isArray(batch.studentIds)) {
    return batch.studentIds.map((student) =>
      String(
        typeof student === "object"
          ? student._id
          : student
      )
    );
  }

  if (Array.isArray(batch.students)) {
    return batch.students.map((student) =>
      String(
        typeof student === "object"
          ? student._id
          : student
      )
    );
  }

  return [];
};

const isStudentInBatch = (batch, studentId) => {
  return getBatchStudentIds(batch).includes(
    String(studentId)
  );
};

// =========================================================
// MENTOR
// =========================================================

const isMentorAssigned = (batch, mentorId) => {
  if (!batch || !mentorId) {
    return false;
  }

  const mentorIds = batch.mentorIds || [];

  return mentorIds.some((id) => {
    const value =
      typeof id === "object"
        ? id._id
        : id;

    return String(value) === String(mentorId);
  });
};

// =========================================================
// FIND STUDENT BY EMAIL
// =========================================================

const findStudentByEmail = async (email) => {
  if (!email) {
    return null;
  }

  return User.findOne({
    email: email.toLowerCase().trim(),
  });
};

// =========================================================
// GET SESSION INFORMATION
// =========================================================

const getSessionInfo = (batch) => {
  const now = new Date();

  const sessionDate = getSessionDate(now);

  const week = calculateWeek(
    batch.startDate,
    now
  );

  // If your Batch has these fields, use them.
  const startTime =
    batch.sessionStartTime || "09:00";

  const endTime =
    batch.sessionEndTime || "13:00";

  const [startHour, startMinute] =
    String(startTime)
      .split(":")
      .map(Number);

  const [endHour, endMinute] =
    String(endTime)
      .split(":")
      .map(Number);

  const {
    sessionStartTime,
    sessionEndTime,
  } = buildSessionTimes({
    sessionDate,
    startHour,
    startMinute,
    endHour,
    endMinute,
  });

  return {
    week,
    sessionDate,
    sessionStartTime,
    sessionEndTime,
  };
};

// =========================================================
// CHECK IN
// =========================================================

const checkIn = async (req, res) => {
  try {
    const {
      email,
      batchId,
    } = req.body;

    if (!email || !batchId) {
      return res.status(400).json({
        message:
          "Email and batchId are required",
      });
    }

    const student =
      await findStudentByEmail(email);

    if (!student) {
      return res.status(404).json({
        message:
          "Student with this email was not found",
      });
    }

    const batch =
      await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    if (
      !isStudentInBatch(
        batch,
        student._id
      )
    ) {
      return res.status(403).json({
        message:
          "Student is not registered in this batch",
      });
    }

    const session =
      getSessionInfo(batch);

    let attendance =
      await Attendance.findOne({
        studentId: student._id,
        batchId,
        sessionDate:
          session.sessionDate,
      });

    if (attendance) {
      if (attendance.checkInTime) {
        return res.status(409).json({
          message:
            "Student has already checked in",
          attendance,
        });
      }

      attendance.checkInTime =
        new Date();

      attendance.markedBy =
        student._id;

      await attendance.save();

      return res.status(200).json({
        message:
          "Student checked in successfully",
        attendance,
      });
    }

    attendance =
      await Attendance.create({
        studentId: student._id,
        batchId,
        week: session.week,
        sessionDate:
          session.sessionDate,
        sessionStartTime:
          session.sessionStartTime,
        sessionEndTime:
          session.sessionEndTime,
        checkInTime: new Date(),
        checkOutTime: null,
        attendedMinutes: 0,
        attendancePercentage: 0,
        status: "Absent",
        markedBy: student._id,
      });

    return res.status(201).json({
      message:
        "Student checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error(
      "CHECK IN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to check in",
    });
  }
};

// =========================================================
// CHECK OUT
// =========================================================

const checkOut = async (req, res) => {
  try {
    const {
      email,
      batchId,
    } = req.body;

    if (!email || !batchId) {
      return res.status(400).json({
        message:
          "Email and batchId are required",
      });
    }

    const student =
      await findStudentByEmail(email);

    if (!student) {
      return res.status(404).json({
        message:
          "Student not found",
      });
    }

    const batch =
      await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message:
          "Batch not found",
      });
    }

    const session =
      getSessionInfo(batch);

    const attendance =
      await Attendance.findOne({
        studentId: student._id,
        batchId,
        sessionDate:
          session.sessionDate,
      });

    if (!attendance) {
      return res.status(404).json({
        message:
          "Student has not checked in",
      });
    }

    if (!attendance.checkInTime) {
      return res.status(400).json({
        message:
          "Student has not checked in",
      });
    }

    if (attendance.checkOutTime) {
      return res.status(409).json({
        message:
          "Student has already checked out",
        attendance,
      });
    }

    const checkOutTime =
      new Date();

    const result =
      calculateAttendance({
        sessionStartTime:
          attendance.sessionStartTime,

        sessionEndTime:
          attendance.sessionEndTime,

        checkInTime:
          attendance.checkInTime,

        checkOutTime,
      });

    attendance.checkOutTime =
      checkOutTime;

    attendance.attendedMinutes =
      result.attendedMinutes;

    attendance.attendancePercentage =
      result.attendancePercentage;

    attendance.status =
      result.status;

    attendance.markedBy =
      student._id;

    await attendance.save();

    return res.status(200).json({
      message:
        "Student checked out successfully",

      attendance,
    });
  } catch (error) {
    console.error(
      "CHECK OUT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to check out",
    });
  }
};

// =========================================================
// EXCUSE
// =========================================================

const excuseAttendance = async (
  req,
  res
) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can approve excuses",
      });
    }

    const {
      studentId,
      batchId,
      reason,
    } = req.body;

    if (
      !studentId ||
      !batchId ||
      !reason
    ) {
      return res.status(400).json({
        message:
          "studentId, batchId and reason are required",
      });
    }

    const batch =
      await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message:
          "Batch not found",
      });
    }

    if (
      !isStudentInBatch(
        batch,
        studentId
      )
    ) {
      return res.status(403).json({
        message:
          "Student is not in this batch",
      });
    }

    const session =
      getSessionInfo(batch);

    let attendance =
      await Attendance.findOne({
        studentId,
        batchId,
        sessionDate:
          session.sessionDate,
      });

    if (!attendance) {
      attendance =
        new Attendance({
          studentId,
          batchId,
          week: session.week,
          sessionDate:
            session.sessionDate,
          sessionStartTime:
            session.sessionStartTime,
          sessionEndTime:
            session.sessionEndTime,
          markedBy:
            getUserId(req),
        });
    }

    attendance.status =
      "Excused";

    attendance.excuseReason =
      reason;

    // Excused has NO time requirement
    attendance.checkInTime =
      null;

    attendance.checkOutTime =
      null;

    attendance.attendedMinutes =
      0;

    attendance.attendancePercentage =
      0;

    attendance.markedBy =
      getUserId(req);

    await attendance.save();

    return res.status(200).json({
      message:
        "Attendance marked as excused",
      attendance,
    });
  } catch (error) {
    console.error(
      "EXCUSE ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to excuse attendance",
    });
  }
};

// =========================================================
// GET ATTENDANCE
// =========================================================

const getAttendance = async (
  req,
  res
) => {
  try {
    const role =
      getRole(req);

    const userId =
      getUserId(req);

    const {
      batchId,
      studentId,
      week,
      sessionDate,
    } = req.query;

    const filter = {};

    // -------------------------------------------------------
    // ADMIN
    // -------------------------------------------------------

    if (isAdmin(req)) {
      if (batchId) {
        filter.batchId =
          batchId;
      }

      if (studentId) {
        filter.studentId =
          studentId;
      }
    }

    // -------------------------------------------------------
    // MENTOR
    // -------------------------------------------------------

    else if (
      role === "MENTOR"
    ) {
      if (!batchId) {
        return res.status(400).json({
          message:
            "batchId is required",
        });
      }

      const batch =
        await Batch.findById(
          batchId
        );

      if (!batch) {
        return res.status(404).json({
          message:
            "Batch not found",
        });
      }

      if (
        !isMentorAssigned(
          batch,
          userId
        )
      ) {
        return res.status(403).json({
          message:
            "You are not assigned to this batch",
        });
      }

      filter.batchId =
        batchId;

      if (studentId) {
        if (
          !isStudentInBatch(
            batch,
            studentId
          )
        ) {
          return res.status(403).json({
            message:
              "Student is not in this batch",
          });
        }

        filter.studentId =
          studentId;
      }
    }

    // -------------------------------------------------------
    // STUDENT
    // -------------------------------------------------------

    else if (
      role === "STUDENT"
    ) {
      filter.studentId =
        userId;

      if (batchId) {
        filter.batchId =
          batchId;
      }
    }

    else {
      return res.status(403).json({
        message:
          "Access denied",
      });
    }

    // -------------------------------------------------------
    // WEEK
    // -------------------------------------------------------

    if (week) {
      filter.week =
        Number(week);
    }

    // -------------------------------------------------------
    // DATE
    // -------------------------------------------------------

    if (sessionDate) {
      const start =
        new Date(sessionDate);

      const end =
        new Date(sessionDate);

      end.setDate(
        end.getDate() + 1
      );

      filter.sessionDate = {
        $gte: start,
        $lt: end,
      };
    }

    // -------------------------------------------------------
    // QUERY
    // -------------------------------------------------------

    const records =
      await Attendance.find(
        filter
      )
        .populate(
          "studentId",
          "name email userID studentId firstName lastName"
        )
        .populate(
          "batchId",
          "name batchName startDate mentorIds studentIds"
        )
        .populate(
          "markedBy",
          "name email"
        )
        .sort({
          sessionDate: -1,
        });

    return res.status(200).json({
      totalRecords:
        records.length,

      attendance:
        records,
    });
  } catch (error) {
    console.error(
      "GET ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to get attendance",
    });
  }
};

// =========================================================
// UPDATE ATTENDANCE
// =========================================================

const updateAttendance = async (
  req,
  res
) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can update attendance",
      });
    }

    const attendance =
      await Attendance.findById(
        req.params.id
      );

    if (!attendance) {
      return res.status(404).json({
        message:
          "Attendance not found",
      });
    }

    const {
      status,
      notes,
      excuseReason,
    } = req.body;

    if (status) {
      const validStatuses = [
        "Present",
        "Absent",
        "Late",
        "Excused",
      ];

      if (
        !validStatuses.includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid attendance status",
        });
      }

      attendance.status =
        status;
    }

    if (notes !== undefined) {
      attendance.notes =
        notes;
    }

    if (
      excuseReason !== undefined
    ) {
      attendance.excuseReason =
        excuseReason;
    }

    // Excused does not use time
    if (
      attendance.status ===
      "Excused"
    ) {
      attendance.checkInTime =
        null;

      attendance.checkOutTime =
        null;

      attendance.attendedMinutes =
        0;

      attendance.attendancePercentage =
        0;
    }

    attendance.markedBy =
      getUserId(req);

    await attendance.save();

    const updated =
      await Attendance.findById(
        attendance._id
      )
        .populate(
          "studentId",
          "name email userID studentId firstName lastName"
        )
        .populate(
          "batchId",
          "name batchName"
        )
        .populate(
          "markedBy",
          "name email"
        );

    return res.status(200).json({
      message:
        "Attendance updated successfully",

      attendance:
        updated,
    });
  } catch (error) {
    console.error(
      "UPDATE ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to update attendance",
    });
  }
};

// =========================================================
// DELETE
// =========================================================

const deleteAttendance = async (
  req,
  res
) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can delete attendance",
      });
    }

    const attendance =
      await Attendance.findByIdAndDelete(
        req.params.id
      );

    if (!attendance) {
      return res.status(404).json({
        message:
          "Attendance not found",
      });
    }

    return res.status(200).json({
      message:
        "Attendance deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to delete attendance",
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  excuseAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
};