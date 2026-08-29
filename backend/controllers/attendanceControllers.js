const mongoose = require("mongoose");

const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const Batch = require("../models/Batch");
const User = require("../models/User");

// =========================================================
// HELPERS
// =========================================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.userId;
};

const getRole = (req) => {
  return String(
    req.user?.role || ""
  ).toUpperCase();
};

const isAdmin = (req) => {
  const role = getRole(req);

  return (
    role === "ADMIN" ||
    role === "SUPERADMIN"
  );
};

const isMentor = (req) => {
  return getRole(req) === "MENTOR";
};

const isStudent = (req) => {
  return getRole(req) === "STUDENT";
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =========================================================
// BATCH HELPERS
// =========================================================

const getBatchStudentIds = (batch) => {
  if (!batch) {
    return [];
  }

  if (Array.isArray(batch.studentIds)) {
    return batch.studentIds.map((student) => {
      const value =
        typeof student === "object"
          ? student?._id
          : student;

      return String(value);
    });
  }

  if (Array.isArray(batch.students)) {
    return batch.students.map((student) => {
      const value =
        typeof student === "object"
          ? student?._id
          : student;

      return String(value);
    });
  }

  return [];
};

const isStudentInBatch = (
  batch,
  studentId
) => {
  return getBatchStudentIds(batch).includes(
    String(studentId)
  );
};

const isMentorAssigned = (
  batch,
  mentorId
) => {
  if (!batch || !mentorId) {
    return false;
  }

  const mentorIds =
    Array.isArray(batch.mentorIds)
      ? batch.mentorIds
      : [];

  return mentorIds.some((id) => {
    const value =
      typeof id === "object"
        ? id?._id
        : id;

    return (
      String(value) === String(mentorId)
    );
  });
};

// =========================================================
// FIND STUDENT
// =========================================================

const findStudentByEmail = async (
  email
) => {
  if (!email) {
    return null;
  }

  return User.findOne({
    email: email
      .toLowerCase()
      .trim(),
  });
};

// =========================================================
// CALCULATE ATTENDANCE
// =========================================================

const calculateAttendance = ({
  session,
  checkInTime,
  checkOutTime,
}) => {
  if (
    !session ||
    !session.startedAt ||
    !checkInTime ||
    !checkOutTime
  ) {
    return {
      attendedMinutes: 0,
      attendancePercentage: 0,
      status: "Absent",
    };
  }

  const sessionStart =
    new Date(
      session.startedAt
    ).getTime();

  /*
   * If the session is already stopped,
   * use endedAt.
   *
   * If the session is still running,
   * use the student's checkout time.
   */
  const sessionEnd = session.endedAt
    ? new Date(
        session.endedAt
      ).getTime()
    : new Date(
        checkOutTime
      ).getTime();

  const checkIn =
    new Date(
      checkInTime
    ).getTime();

  const checkOut =
    new Date(
      checkOutTime
    ).getTime();

  if (
    Number.isNaN(sessionStart) ||
    Number.isNaN(sessionEnd) ||
    Number.isNaN(checkIn) ||
    Number.isNaN(checkOut)
  ) {
    return {
      attendedMinutes: 0,
      attendancePercentage: 0,
      status: "Absent",
    };
  }

  if (sessionEnd <= sessionStart) {
    return {
      attendedMinutes: 0,
      attendancePercentage: 0,
      status: "Absent",
    };
  }

  // =====================================================
  // TOTAL SESSION TIME
  // =====================================================

  const totalSessionMinutes =
    Math.max(
      0,
      Math.round(
        (sessionEnd -
          sessionStart) /
          60000
      )
    );

  if (
    totalSessionMinutes <= 0
  ) {
    return {
      attendedMinutes: 0,
      attendancePercentage: 0,
      status: "Absent",
    };
  }

  // =====================================================
  // CLAMP STUDENT TIME
  // =====================================================

  const effectiveStart =
    Math.max(
      checkIn,
      sessionStart
    );

  const effectiveEnd =
    Math.min(
      checkOut,
      sessionEnd
    );

  const attendedMinutes =
    Math.max(
      0,
      Math.round(
        (effectiveEnd -
          effectiveStart) /
          60000
      )
    );

  const attendancePercentage =
    Math.min(
      100,
      Math.round(
        (attendedMinutes /
          totalSessionMinutes) *
          100
      )
    );

  // =====================================================
  // STATUS
  // =====================================================

  let status = "Absent";

  if (
    attendancePercentage >= 90
  ) {
    status = "Present";
  } else if (
    attendancePercentage >= 50
  ) {
    status = "Late";
  }

  return {
    attendedMinutes,
    attendancePercentage,
    status,
  };
};

// =========================================================
// CHECK IN
// =========================================================

const checkIn = async (
  req,
  res
) => {
  try {
    const {
      email,
      sessionId,
    } = req.body;

    if (!email || !sessionId) {
      return res.status(400).json({
        message:
          "Email and sessionId are required",
      });
    }

    if (
      !isValidObjectId(sessionId)
    ) {
      return res.status(400).json({
        message:
          "Invalid sessionId",
      });
    }

    // =====================================================
    // FIND STUDENT
    // =====================================================

    const student =
      await findStudentByEmail(
        email
      );

    if (!student) {
      return res.status(404).json({
        message:
          "Student with this email was not found",
      });
    }

    // =====================================================
    // CHECK SESSION
    // =====================================================

    const session =
      await Session.findById(
        sessionId
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    // =====================================================
    // TRACKING MUST BE ACTIVE
    // =====================================================

    if (
      session.status !==
      "Tracking"
    ) {
      return res.status(400).json({
        message:
          "Attendance tracking is not currently active",
      });
    }

    // =====================================================
    // FIND BATCH
    // =====================================================

    const batch =
      await Batch.findById(
        session.batchId
      );

    if (!batch) {
      return res.status(404).json({
        message:
          "Batch not found",
      });
    }

    // =====================================================
    // CHECK STUDENT IN BATCH
    // =====================================================

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

    // =====================================================
    // EXISTING ATTENDANCE
    // =====================================================

    let attendance =
      await Attendance.findOne({
        sessionId:
          session._id,
        studentId:
          student._id,
      });

    if (attendance) {
      if (
        attendance.status ===
        "Excused"
      ) {
        return res.status(400).json({
          message:
            "Excused attendance cannot be checked in",
        });
      }

      if (
        attendance.checkInTime
      ) {
        return res.status(409).json({
          message:
            "Student has already checked in",
          attendance,
        });
      }

      attendance.checkInTime =
        new Date();

      attendance.sessionStartTime =
        session.startedAt;

      attendance.sessionEndTime =
        session.endedAt;

      attendance.markedBy =
        student._id;

      await attendance.save();

      return res.status(200).json({
        message:
          "Student checked in successfully",
        attendance,
      });
    }

    // =====================================================
    // CREATE ATTENDANCE
    // =====================================================

    attendance =
      await Attendance.create({
        sessionId:
          session._id,

        studentId:
          student._id,

        batchId:
          session.batchId,

        week:
          session.week,

        sessionDate:
          session.sessionDate,

        sessionStartTime:
          session.startedAt,

        sessionEndTime:
          session.endedAt,

        checkInTime:
          new Date(),

        checkOutTime:
          null,

        attendedMinutes:
          0,

        attendancePercentage:
          0,

        status:
          "Absent",

        calculatedStatus:
          "Absent",

        manuallyOverridden:
          false,

        markedBy:
          student._id,
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

const checkOut = async (
  req,
  res
) => {
  try {
    const {
      email,
      sessionId,
    } = req.body;

    if (!email || !sessionId) {
      return res.status(400).json({
        message:
          "Email and sessionId are required",
      });
    }

    if (
      !isValidObjectId(sessionId)
    ) {
      return res.status(400).json({
        message:
          "Invalid sessionId",
      });
    }

    // =====================================================
    // FIND STUDENT
    // =====================================================

    const student =
      await findStudentByEmail(
        email
      );

    if (!student) {
      return res.status(404).json({
        message:
          "Student not found",
      });
    }

    // =====================================================
    // FIND SESSION
    // =====================================================

    const session =
      await Session.findById(
        sessionId
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    // =====================================================
    // CHECK ATTENDANCE
    // =====================================================

    const attendance =
      await Attendance.findOne({
        sessionId:
          session._id,

        studentId:
          student._id,
      });

    if (!attendance) {
      return res.status(404).json({
        message:
          "Student has not checked in",
      });
    }

    if (
      !attendance.checkInTime
    ) {
      return res.status(400).json({
        message:
          "Student has not checked in",
      });
    }

    if (
      attendance.checkOutTime
    ) {
      return res.status(409).json({
        message:
          "Student has already checked out",
        attendance,
      });
    }

    // =====================================================
    // EXCUSED
    // =====================================================

    if (
      attendance.status ===
      "Excused"
    ) {
      return res.status(400).json({
        message:
          "Excused attendance cannot be checked out",
      });
    }

    // =====================================================
    // CHECKOUT
    // =====================================================

    const checkOutTime =
      new Date();

    attendance.checkOutTime =
      checkOutTime;

    const result =
      calculateAttendance({
        session,
        checkInTime:
          attendance.checkInTime,
        checkOutTime,
      });

    attendance.attendedMinutes =
      result.attendedMinutes;

    attendance.attendancePercentage =
      result.attendancePercentage;

    attendance.calculatedStatus =
      result.status;

    // =====================================================
    // DON'T OVERWRITE ADMIN OVERRIDE
    // =====================================================

    if (
      !attendance.manuallyOverridden
    ) {
      attendance.status =
        result.status;
    }

    attendance.sessionStartTime =
      session.startedAt;

    attendance.sessionEndTime =
      session.endedAt;

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
// EXCUSE ATTENDANCE
// =========================================================

const excuseAttendance = async (
  req,
  res
) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can excuse attendance",
      });
    }

    const {
      studentId,
      sessionId,
      reason,
    } = req.body;

    if (
      !studentId ||
      !sessionId ||
      !reason
    ) {
      return res.status(400).json({
        message:
          "studentId, sessionId and reason are required",
      });
    }

    if (
      !isValidObjectId(
        studentId
      ) ||
      !isValidObjectId(
        sessionId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid studentId or sessionId",
      });
    }

    const session =
      await Session.findById(
        sessionId
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    const batch =
      await Batch.findById(
        session.batchId
      );

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

    let attendance =
      await Attendance.findOne({
        sessionId:
          session._id,

        studentId:
          studentId,
      });

    if (!attendance) {
      attendance =
        new Attendance({
          sessionId:
            session._id,

          studentId:
            studentId,

          batchId:
            session.batchId,

          week:
            session.week,

          sessionDate:
            session.sessionDate,

          sessionStartTime:
            session.startedAt,

          sessionEndTime:
            session.endedAt,

          markedBy:
            getUserId(req),
        });
    }

    attendance.status =
      "Excused";

    attendance.calculatedStatus =
      "Excused";

    attendance.manuallyOverridden =
      true;

    attendance.excuseReason =
      String(reason).trim();

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
    const userId =
      getUserId(req);

    const {
      batchId,
      studentId,
      sessionId,
      week,
      sessionDate,
    } = req.query;

    const filter = {};

    // =====================================================
    // ADMIN
    // =====================================================

    if (isAdmin(req)) {
      if (batchId) {
        if (
          !isValidObjectId(
            batchId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid batchId",
          });
        }

        filter.batchId =
          batchId;
      }

      if (studentId) {
        if (
          !isValidObjectId(
            studentId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid studentId",
          });
        }

        filter.studentId =
          studentId;
      }

      if (sessionId) {
        if (
          !isValidObjectId(
            sessionId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid sessionId",
          });
        }

        filter.sessionId =
          sessionId;
      }
    }

    // =====================================================
    // MENTOR
    // =====================================================

    else if (isMentor(req)) {
      if (!batchId) {
        return res.status(400).json({
          message:
            "batchId is required",
        });
      }

      if (
        !isValidObjectId(
          batchId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid batchId",
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
          !isValidObjectId(
            studentId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid studentId",
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

        filter.studentId =
          studentId;
      }

      if (sessionId) {
        if (
          !isValidObjectId(
            sessionId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid sessionId",
          });
        }

        filter.sessionId =
          sessionId;
      }
    }

    // =====================================================
    // STUDENT
    // =====================================================

    else if (isStudent(req)) {
      filter.studentId =
        userId;

      if (batchId) {
        if (
          !isValidObjectId(
            batchId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid batchId",
          });
        }

        filter.batchId =
          batchId;
      }

      if (sessionId) {
        if (
          !isValidObjectId(
            sessionId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid sessionId",
          });
        }

        filter.sessionId =
          sessionId;
      }
    }

    else {
      return res.status(403).json({
        message:
          "Access denied",
      });
    }

    // =====================================================
    // WEEK
    // =====================================================

    if (week !== undefined) {
      const weekNumber =
        Number(week);

      if (
        !Number.isInteger(
          weekNumber
        ) ||
        weekNumber < 1
      ) {
        return res.status(400).json({
          message:
            "Invalid week",
        });
      }

      filter.week =
        weekNumber;
    }

    // =====================================================
    // DATE
    // =====================================================

    if (sessionDate) {
      const start =
        new Date(
          sessionDate
        );

      if (
        Number.isNaN(
          start.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid sessionDate",
        });
      }

      const end =
        new Date(start);

      end.setDate(
        end.getDate() + 1
      );

      filter.sessionDate = {
        $gte: start,
        $lt: end,
      };
    }

    // =====================================================
    // QUERY
    // =====================================================

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
          "sessionId",
          "title week sessionDate status startedAt endedAt totalMinutes"
        )
        .populate(
          "markedBy",
          "name email"
        )
        .sort({
          sessionDate: -1,
          createdAt: -1,
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
// ADMIN UPDATE / OVERRIDE
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

    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid attendance ID",
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

    const validStatuses = [
      "Present",
      "Absent",
      "Late",
      "Excused",
    ];

    // =====================================================
    // STATUS
    // =====================================================

    if (
      status !== undefined
    ) {
      if (
        !validStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid attendance status",
        });
      }

      attendance.status =
        status;

      attendance.manuallyOverridden =
        true;
    }

    // =====================================================
    // NOTES
    // =====================================================

    if (
      notes !== undefined
    ) {
      attendance.notes =
        String(notes);
    }

    // =====================================================
    // EXCUSE REASON
    // =====================================================

    if (
      excuseReason !== undefined
    ) {
      attendance.excuseReason =
        String(
          excuseReason
        );
    }

    // =====================================================
    // EXCUSED
    // =====================================================

    if (
      status === "Excused"
    ) {
      attendance.calculatedStatus =
        "Excused";

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

    // =====================================================
    // RETURN UPDATED
    // =====================================================

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
          "sessionId",
          "title week sessionDate status startedAt endedAt totalMinutes"
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

    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid attendance ID",
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

// =========================================================
// GET STUDENT ATTENDANCE SUMMARY (MY ATTENDANCE)
// GET /api/attendance/my
// =========================================================

const getStudentAttendanceSummary = async (req, res) => {
  try {
    let studentId = getUserId(req);

    // If caller is admin or mentor and passed ?studentId=, allow look up
    if ((isAdmin(req) || isMentor(req)) && req.query.studentId) {
      studentId = req.query.studentId;
    }

    if (!studentId || !isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student identifier",
      });
    }

    const records = await Attendance.find({ studentId })
      .populate(
        "sessionId",
        "title week sessionDate status startedAt endedAt totalMinutes"
      )
      .populate("batchId", "name batchName")
      .populate("markedBy", "name email")
      .sort({
        sessionDate: -1,
        createdAt: -1,
      });

    const totalSessions = records.length;
    const totalAttendedMinutes = records.reduce(
      (sum, r) => sum + (r.attendedMinutes || 0),
      0
    );

    const statusBreakdown = {
      Present: records.filter((r) => r.status === "Present").length,
      Late: records.filter((r) => r.status === "Late").length,
      Absent: records.filter((r) => r.status === "Absent").length,
      Excused: records.filter((r) => r.status === "Excused").length,
    };

    const overallAttendancePercentage =
      totalSessions > 0
        ? Math.round(
            records.reduce(
              (sum, r) => sum + (r.attendancePercentage || 0),
              0
            ) / totalSessions
          )
        : 0;

    const formattedSessions = records.map((record) => ({
      _id: record._id,
      sessionId: record.sessionId?._id || record.sessionId,
      sessionTitle:
        record.sessionId?.title || "Daily Session",
      week: record.week || record.sessionId?.week || 1,
      sessionDate:
        record.sessionDate || record.sessionId?.sessionDate,
      sessionStartTime:
        record.sessionStartTime || record.sessionId?.startedAt,
      sessionEndTime:
        record.sessionEndTime || record.sessionId?.endedAt,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      attendedMinutes: record.attendedMinutes || 0,
      attendancePercentage: record.attendancePercentage || 0,
      status: record.status || "Absent",
      calculatedStatus: record.calculatedStatus || "Absent",
      manuallyOverridden: record.manuallyOverridden || false,
      source: record.source || "manual",
      excuseReason: record.excuseReason || "",
      notes: record.notes || "",
      batchName:
        record.batchId?.name || record.batchId?.batchName || "",
    }));

    return res.status(200).json({
      success: true,
      summary: {
        totalSessions,
        totalAttendedMinutes,
        overallAttendancePercentage,
        statusBreakdown,
      },
      attendance: formattedSessions,
      records: formattedSessions, // backward compatibility
    });
  } catch (error) {
    console.error("GET STUDENT ATTENDANCE SUMMARY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load student attendance summary",
    });
  }
};

// =========================================================
// GET BATCH ATTENDANCE SUMMARY (MENTOR / ADMIN)
// GET /api/attendance/batch-summary/:batchId
// =========================================================

const getBatchAttendanceSummary = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId || !isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batchId",
      });
    }

    const batch = await Batch.findById(batchId)
      .populate("studentIds", "name email userID gender role firstName lastName")
      .populate("mentorIds", "name email");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Role check: Admin / Superadmin or assigned mentor
    const userId = getUserId(req);
    if (!isAdmin(req) && !isMentorAssigned(batch, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view attendance for this batch",
      });
    }

    const filter = { batchId };
    if (req.query.week) {
      const weekNum = Number(req.query.week);
      if (!Number.isNaN(weekNum) && weekNum > 0) {
        filter.week = weekNum;
      }
    }

    const allAttendance = await Attendance.find(filter)
      .populate(
        "sessionId",
        "title week sessionDate status startedAt endedAt totalMinutes"
      )
      .populate(
        "studentId",
        "name email userID gender firstName lastName"
      )
      .sort({
        sessionDate: -1,
        createdAt: -1,
      });

    // Students list from batch
    const studentsList = Array.isArray(batch.studentIds) ? batch.studentIds : [];

    const studentSummaries = studentsList.map((student) => {
      const studentIdStr = String(student._id || student);
      const studentRecords = allAttendance.filter(
        (r) =>
          String(r.studentId?._id || r.studentId) === studentIdStr
      );

      const totalMinutes = studentRecords.reduce(
        (sum, r) => sum + (r.attendedMinutes || 0),
        0
      );

      const avgPercentage =
        studentRecords.length > 0
          ? Math.round(
              studentRecords.reduce(
                (sum, r) => sum + (r.attendancePercentage || 0),
                0
              ) / studentRecords.length
            )
          : 0;

      const statusCounts = {
        Present: studentRecords.filter((r) => r.status === "Present").length,
        Late: studentRecords.filter((r) => r.status === "Late").length,
        Absent: studentRecords.filter((r) => r.status === "Absent").length,
        Excused: studentRecords.filter((r) => r.status === "Excused").length,
      };

      let suggestedStatus = "Absent";
      if (avgPercentage >= 90) suggestedStatus = "Present";
      else if (avgPercentage >= 50) suggestedStatus = "Late";

      const studentName =
        student.name ||
        `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        "Student";

      return {
        student: {
          _id: student._id || student,
          name: studentName,
          email: student.email || "",
          userID: student.userID || "",
          gender: student.gender || "",
        },
        // Direct top-level fields for convenience
        _id: student._id || student,
        name: studentName,
        email: student.email || "",
        userID: student.userID || "",
        totalSessions: studentRecords.length,
        totalAttendedMinutes: totalMinutes,
        overallAttendancePercentage: avgPercentage,
        statusCounts,
        suggestedStatus,
        status: suggestedStatus, // fallback
        sessions: studentRecords.map((r) => ({
          _id: r._id,
          sessionId: r.sessionId?._id || r.sessionId,
          sessionTitle:
            r.sessionId?.title || `Week ${r.week} Session`,
          week: r.week,
          sessionDate: r.sessionDate,
          sessionStartTime: r.sessionStartTime,
          sessionEndTime: r.sessionEndTime,
          checkInTime: r.checkInTime,
          checkOutTime: r.checkOutTime,
          attendedMinutes: r.attendedMinutes || 0,
          attendancePercentage: r.attendancePercentage || 0,
          status: r.status,
          calculatedStatus: r.calculatedStatus,
          source: r.source || "manual",
          notes: r.notes || r.excuseReason || "",
        })),
      };
    });

    return res.status(200).json({
      success: true,
      batch: {
        _id: batch._id,
        name: batch.name || batch.batchName,
        startDate: batch.startDate,
        endDate: batch.endDate,
      },
      totalStudents: studentSummaries.length,
      studentSummaries,
      students: studentSummaries, // for backward compat
    });
  } catch (error) {
    console.error("GET BATCH ATTENDANCE SUMMARY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load batch attendance summary",
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  checkIn,
  checkOut,
  excuseAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceSummary,
  getBatchAttendanceSummary,
};