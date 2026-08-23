const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");

// =========================================================
// HELPERS
// =========================================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id;
};

// =========================================================
// CHECK MENTOR ASSIGNMENT
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

    return (
      String(value) === String(mentorId)
    );
  });
};

// =========================================================
// GET BATCH STUDENT IDS
// =========================================================

const getBatchStudentIds = (batch) => {
  if (!batch) {
    return [];
  }

  // Most likely structure
  if (
    Array.isArray(batch.studentIds)
  ) {
    return batch.studentIds.map((student) => {
      return String(
        typeof student === "object"
          ? student._id
          : student
      );
    });
  }

  // Fallback if batch uses students
  if (
    Array.isArray(batch.students)
  ) {
    return batch.students.map((student) => {
      return String(
        typeof student === "object"
          ? student._id
          : student
      );
    });
  }

  return [];
};

// =========================================================
// CHECK STUDENT IN BATCH
// =========================================================

const isStudentInBatch = (
  batch,
  studentId
) => {
  if (!batch || !studentId) {
    return false;
  }

  const studentIds =
    getBatchStudentIds(batch);

  return studentIds.includes(
    String(studentId)
  );
};

// =========================================================
// CALCULATE ATTENDANCE PERCENTAGE
// =========================================================

const calculatePercentage = (
  records
) => {
  if (
    !Array.isArray(records) ||
    records.length === 0
  ) {
    return 0;
  }

  const applicableSessions =
    records.filter(
      (record) =>
        record.status !== "Excused"
    );

  if (
    applicableSessions.length === 0
  ) {
    return 0;
  }

  const attendedSessions =
    applicableSessions.filter(
      (record) =>
        record.status === "Present" ||
        record.status === "Late"
    );

  return Number(
    (
      (attendedSessions.length /
        applicableSessions.length) *
      100
    ).toFixed(2)
  );
};

// =========================================================
// CREATE ATTENDANCE
// ADMIN ONLY
// =========================================================

const createAttendance = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    // -----------------------------------------------------
    // ROLE CHECK
    // -----------------------------------------------------

    if (
      String(req.user?.role).toUpperCase() !==
      "ADMIN"
    ) {
      return res.status(403).json({
        message:
          "Only admins can create attendance",
      });
    }

    // -----------------------------------------------------
    // BODY
    // -----------------------------------------------------

    const {
      studentId,
      batchId,
      week,
      sessionDate,
      status,
      notes,
    } = req.body;

    // -----------------------------------------------------
    // REQUIRED FIELDS
    // -----------------------------------------------------

    if (
      !studentId ||
      !batchId ||
      !week ||
      !sessionDate ||
      !status
    ) {
      return res.status(400).json({
        message:
          "studentId, batchId, week, sessionDate and status are required",
      });
    }

    // -----------------------------------------------------
    // VALID WEEK
    // -----------------------------------------------------

    const weekNumber = Number(week);

    if (
      !Number.isInteger(weekNumber) ||
      weekNumber < 1
    ) {
      return res.status(400).json({
        message:
          "Week must be a valid positive number",
      });
    }

    // -----------------------------------------------------
    // VALID STATUS
    // -----------------------------------------------------

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

    // -----------------------------------------------------
    // FIND BATCH
    // -----------------------------------------------------

    const batch =
      await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    // -----------------------------------------------------
    // CHECK STUDENT
    // -----------------------------------------------------

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

    // -----------------------------------------------------
    // CHECK EXISTING RECORD
    //
    // This prevents the annoying situation where
    // one request succeeds and another gets 409.
    // -----------------------------------------------------

    const existing =
      await Attendance.findOne({
        studentId,
        batchId,
        sessionDate,
      });

    if (existing) {
      return res.status(409).json({
        message:
          "Attendance already exists for this student for this session",
        attendanceId: existing._id,
      });
    }

    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------

    const attendance =
      await Attendance.create({
        studentId,
        batchId,
        week: weekNumber,
        sessionDate,
        status,
        notes: notes || "",
        markedBy: userId,
      });

    // -----------------------------------------------------
    // POPULATE
    // -----------------------------------------------------

    const populatedAttendance =
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

    return res.status(201).json({
      message:
        "Attendance created successfully",

      attendance:
        populatedAttendance,
    });
  } catch (error) {
    // -----------------------------------------------------
    // DUPLICATE
    // -----------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Attendance already exists for this student for this session",
      });
    }

    console.error(
      "CREATE ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create attendance",
    });
  }
};

// =========================================================
// GET ATTENDANCE BY ID
// =========================================================

const getAttendanceById = async (
  req,
  res
) => {
  try {
    const attendance =
      await Attendance.findById(
        req.params.id
      )
        .populate(
          "studentId",
          "name email userID studentId firstName lastName"
        )
        .populate(
          "batchId",
          "name batchName mentorIds studentIds"
        )
        .populate(
          "markedBy",
          "name email"
        );

    if (!attendance) {
      return res.status(404).json({
        message:
          "Attendance not found",
      });
    }

    const role =
      String(req.user?.role).toUpperCase();

    const userId = getUserId(req);

    // =====================================================
    // ADMIN
    // =====================================================

    if (role === "ADMIN") {
      return res.status(200).json({
        attendance,
      });
    }

    // =====================================================
    // MENTOR
    // =====================================================

    if (role === "MENTOR") {
      const batch =
        await Batch.findById(
          attendance.batchId._id
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

      return res.status(200).json({
        attendance,
      });
    }

    // =====================================================
    // STUDENT
    // =====================================================

    if (role === "STUDENT") {
      if (
        String(
          attendance.studentId._id
        ) !== String(userId)
      ) {
        return res.status(403).json({
          message:
            "You can only view your own attendance",
        });
      }

      return res.status(200).json({
        attendance,
      });
    }

    return res.status(403).json({
      message:
        "Access denied",
    });
  } catch (error) {
    console.error(
      "GET ATTENDANCE BY ID ERROR:",
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
// GET ATTENDANCE
// ADMIN / MENTOR / STUDENT
// =========================================================

const getAttendance = async (
  req,
  res
) => {
  try {
    const {
      studentId,
      batchId,
      from,
      to,
      sessionDate,
      week,
    } = req.query;

    const filter = {};

    const role =
      String(req.user?.role).toUpperCase();

    const userId = getUserId(req);

    // =====================================================
    // ADMIN
    // =====================================================

    if (role === "ADMIN") {
      if (studentId) {
        filter.studentId =
          studentId;
      }

      if (batchId) {
        filter.batchId =
          batchId;
      }
    }

    // =====================================================
    // MENTOR
    // =====================================================

    else if (role === "MENTOR") {
      if (!batchId) {
        return res.status(400).json({
          message:
            "batchId is required for mentors",
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

    // =====================================================
    // STUDENT
    // =====================================================

    else if (role === "STUDENT") {
      // Very important:
      // Student cannot request another student's attendance.
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

    // =====================================================
    // WEEK FILTER
    // =====================================================

    if (week) {
      const weekNumber =
        Number(week);

      if (
        Number.isInteger(
          weekNumber
        )
      ) {
        filter.week =
          weekNumber;
      }
    }

    // =====================================================
    // DATE FILTER
    // =====================================================

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
    } else if (from || to) {
      filter.sessionDate = {};

      if (from) {
        filter.sessionDate.$gte =
          new Date(from);
      }

      if (to) {
        const endDate =
          new Date(to);

        endDate.setDate(
          endDate.getDate() + 1
        );

        filter.sessionDate.$lt =
          endDate;
      }
    }

    // =====================================================
    // DATABASE QUERY
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
          "name batchName"
        )
        .populate(
          "markedBy",
          "name email"
        )
        .sort({
          sessionDate: -1,
        });

    // =====================================================
    // PERCENTAGE
    // =====================================================

    const attendancePercentage =
      calculatePercentage(
        records
      );

    return res.status(200).json({
      attendancePercentage,

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
// ADMIN ONLY
// =========================================================

const updateAttendance = async (
  req,
  res
) => {
  try {
    const role =
      String(req.user?.role).toUpperCase();

    const userId = getUserId(req);

    if (role !== "ADMIN") {
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
      sessionDate,
      week,
    } = req.body;

    // =====================================================
    // STATUS
    // =====================================================

    if (
      status !== undefined
    ) {
      const validStatuses = [
        "Present",
        "Absent",
        "Late",
        "Excused",
      ];

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
    }

    // =====================================================
    // NOTES
    // =====================================================

    if (
      notes !== undefined
    ) {
      attendance.notes =
        notes;
    }

    // =====================================================
    // WEEK
    // =====================================================

    if (
      week !== undefined
    ) {
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
            "Week must be a valid positive number",
        });
      }

      attendance.week =
        weekNumber;
    }

    // =====================================================
    // DATE
    // =====================================================

    if (
      sessionDate !== undefined
    ) {
      attendance.sessionDate =
        sessionDate;
    }

    // =====================================================
    // MARKED BY
    // =====================================================

    attendance.markedBy =
      userId;

    await attendance.save();

    // =====================================================
    // POPULATE
    // =====================================================

    const updatedAttendance =
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
        updatedAttendance,
    });
  } catch (error) {
    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        message:
          "Attendance already exists for this student for this session",
      });
    }

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
// DELETE ATTENDANCE
// ADMIN ONLY
// =========================================================

const deleteAttendance = async (
  req,
  res
) => {
  try {
    const role =
      String(req.user?.role).toUpperCase();

    if (role !== "ADMIN") {
      return res.status(403).json({
        message:
          "Only admins can delete attendance",
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

    await Attendance.findByIdAndDelete(
      req.params.id
    );

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
// ATTENDANCE STATISTICS
// ADMIN ONLY
// =========================================================

const getAttendanceStats = async (
  req,
  res
) => {
  try {
    const role =
      String(req.user?.role).toUpperCase();

    if (role !== "ADMIN") {
      return res.status(403).json({
        message:
          "Only admins can view attendance statistics",
      });
    }

    const {
      batchId,
      from,
      to,
      week,
    } = req.query;

    const filter = {};

    // =====================================================
    // BATCH
    // =====================================================

    if (batchId) {
      filter.batchId =
        batchId;
    }

    // =====================================================
    // WEEK
    // =====================================================

    if (week) {
      filter.week =
        Number(week);
    }

    // =====================================================
    // DATE
    // =====================================================

    if (from || to) {
      filter.sessionDate = {};

      if (from) {
        filter.sessionDate.$gte =
          new Date(from);
      }

      if (to) {
        const endDate =
          new Date(to);

        endDate.setDate(
          endDate.getDate() + 1
        );

        filter.sessionDate.$lt =
          endDate;
      }
    }

    // =====================================================
    // RECORDS
    // =====================================================

    const records =
      await Attendance.find(
        filter
      );

    // =====================================================
    // COUNTS
    // =====================================================

    const totalApplicableSessions =
      records.filter(
        (record) =>
          record.status !==
          "Excused"
      ).length;

    const presentSessions =
      records.filter(
        (record) =>
          record.status ===
          "Present"
      ).length;

    const lateSessions =
      records.filter(
        (record) =>
          record.status ===
          "Late"
      ).length;

    const absentSessions =
      records.filter(
        (record) =>
          record.status ===
          "Absent"
      ).length;

    const attendedSessions =
      presentSessions +
      lateSessions;

    const attendancePercentage =
      totalApplicableSessions ===
      0
        ? 0
        : Number(
            (
              (attendedSessions /
                totalApplicableSessions) *
              100
            ).toFixed(2)
          );

    return res.status(200).json({
      totalApplicableSessions,

      presentSessions,

      lateSessions,

      absentSessions,

      attendedSessions,

      attendancePercentage,
    });
  } catch (error) {
    console.error(
      "ATTENDANCE STATS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to calculate attendance statistics",
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createAttendance,
  getAttendanceById,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
};