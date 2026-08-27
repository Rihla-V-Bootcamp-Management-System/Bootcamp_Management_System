const mongoose = require("mongoose");

const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");
const User = require("../models/User");

// =========================================================
// HELPERS
// =========================================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.userId;
};

const getRole = (req) => {
  return String(req.user?.role || "").toUpperCase();
};

const isAdmin = (req) => {
  const role = getRole(req);

  return role === "ADMIN" || role === "SUPERADMIN";
};

const isMentor = (req) => {
  return getRole(req) === "MENTOR";
};

const isStudent = (req) => {
  return getRole(req) === "STUDENT";
};

// =========================================================
// VALID OBJECT ID
// =========================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =========================================================
// CALCULATE WEEK FROM BATCH START DATE
// =========================================================

const calculateWeekFromBatch = (batch, sessionDate) => {
  if (!batch?.startDate) {
    return 1;
  }

  const batchStart = new Date(batch.startDate);
  const date = new Date(sessionDate);

  batchStart.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const difference =
    date.getTime() - batchStart.getTime();

  const days = Math.floor(
    difference / 86400000
  );

  if (days < 0) {
    return 1;
  }

  return Math.floor(days / 7) + 1;
};

// =========================================================
// BATCH STUDENTS
// =========================================================

const getBatchStudentIds = (batch) => {
  if (!batch) {
    return [];
  }

  if (Array.isArray(batch.studentIds)) {
    return batch.studentIds
      .map((student) => {
        const id =
          typeof student === "object"
            ? student?._id
            : student;

        return id ? String(id) : null;
      })
      .filter(Boolean);
  }

  if (Array.isArray(batch.students)) {
    return batch.students
      .map((student) => {
        const id =
          typeof student === "object"
            ? student?._id
            : student;

        return id ? String(id) : null;
      })
      .filter(Boolean);
  }

  return [];
};

// =========================================================
// CHECK STUDENT IN BATCH
// =========================================================

const isStudentInBatch = (batch, studentId) => {
  return getBatchStudentIds(batch).includes(
    String(studentId)
  );
};

// =========================================================
// CHECK MENTOR ASSIGNMENT
// =========================================================

const isMentorAssigned = (batch, mentorId) => {
  if (!batch || !mentorId) {
    return false;
  }

  const mentorIds = Array.isArray(batch.mentorIds)
    ? batch.mentorIds
    : [];

  return mentorIds.some((id) => {
    const value =
      typeof id === "object"
        ? id?._id
        : id;

    return String(value) === String(mentorId);
  });
};

// =========================================================
// CREATE SESSION
// =========================================================

const createSession = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message: "Only admins can create sessions",
      });
    }

    const {
      batchId,
      title,
      sessionDate,
      scheduledStartTime,
      scheduledEndTime,
    } = req.body;

    if (!batchId) {
      return res.status(400).json({
        message: "batchId is required",
      });
    }

    if (!sessionDate) {
      return res.status(400).json({
        message: "sessionDate is required",
      });
    }

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        message: "Invalid batchId",
      });
    }

    const parsedSessionDate =
      new Date(sessionDate);

    if (
      Number.isNaN(
        parsedSessionDate.getTime()
      )
    ) {
      return res.status(400).json({
        message: "Invalid session date",
      });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        message: "Batch not found",
      });
    }

    const week = calculateWeekFromBatch(
      batch,
      parsedSessionDate
    );

    const startOfDay =
      new Date(parsedSessionDate);

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay =
      new Date(parsedSessionDate);

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );

    const existing =
      await Session.findOne({
        batchId,
        week,
        sessionDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    if (existing) {
      return res.status(409).json({
        message:
          "A session already exists for this batch, week and date",
        session: existing,
      });
    }

    let startTime = null;
    let endTime = null;

    if (scheduledStartTime) {
      startTime =
        new Date(scheduledStartTime);

      if (
        Number.isNaN(
          startTime.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid scheduled start time",
        });
      }
    }

    if (scheduledEndTime) {
      endTime =
        new Date(scheduledEndTime);

      if (
        Number.isNaN(
          endTime.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid scheduled end time",
        });
      }
    }

    if (
      startTime &&
      endTime &&
      endTime <= startTime
    ) {
      return res.status(400).json({
        message:
          "Scheduled end time must be after scheduled start time",
      });
    }

    const session =
      await Session.create({
        batchId,

        title:
          title?.trim() ||
          "Attendance Session",

        week,

        sessionDate:
          parsedSessionDate,

        scheduledStartTime:
          startTime,

        scheduledEndTime:
          endTime,

        startedAt: null,

        endedAt: null,

        totalMinutes: 0,

        status: "Created",

        createdBy:
          getUserId(req),

        reviewedBy: null,

        reviewedAt: null,

        savedAt: null,
      });

    const populated =
      await Session.findById(
        session._id
      )
        .populate(
          "batchId",
          "name batchName startDate mentorIds studentIds students"
        )
        .populate(
          "createdBy",
          "name email"
        );

    return res.status(201).json({
      success: true,

      message:
        "Session created successfully",

      session: populated,
    });
  } catch (error) {
    console.error(
      "CREATE SESSION ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A session already exists for this batch, week and date",
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create session",
    });
  }
};

// =========================================================
// OPEN SESSION
// =========================================================

const openSession = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can open sessions",
      });
    }

    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    if (session.status !== "Created") {
      return res.status(400).json({
        message:
          `Session cannot be opened because its current status is ${session.status}`,
      });
    }

    session.status = "Open";

    await session.save();

    return res.status(200).json({
      success: true,

      message:
        "Session opened successfully",

      session,
    });
  } catch (error) {
    console.error(
      "OPEN SESSION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to open session",
    });
  }
};

// =========================================================
// START TRACKING
// =========================================================

const startTracking = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can start tracking",
      });
    }

    // -------------------------------------------------------
    // GET SESSION
    // -------------------------------------------------------

    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    // -------------------------------------------------------
    // CHECK SESSION STATUS
    // -------------------------------------------------------

    if (session.status !== "Open") {
      return res.status(400).json({
        message:
          `Session must be Open before tracking. Current status: ${session.status}`,
      });
    }

    // -------------------------------------------------------
    // GET BATCH + STUDENTS
    // -------------------------------------------------------

    const batch =
      await Batch.findById(
        session.batchId
      ).populate(
        "studentIds",
        "name email phone role"
      );

    if (!batch) {
      return res.status(404).json({
        message:
          "Batch not found",
      });
    }

    // -------------------------------------------------------
    // GET STUDENTS
    // -------------------------------------------------------

    const students =
      Array.isArray(batch.studentIds)
        ? batch.studentIds
        : [];

    console.log(
      "================================="
    );

    console.log(
      "START TRACKING"
    );

    console.log(
      "Batch:",
      batch.name
    );

    console.log(
      "Students:",
      students.length
    );

    console.log(
      "Student names:",
      students.map(
        (student) =>
          student.name
      )
    );

    console.log(
      "================================="
    );

    // -------------------------------------------------------
    // DO NOT START EMPTY BATCH
    // -------------------------------------------------------

    if (students.length === 0) {
      return res.status(400).json({
        message:
          "No students are assigned to this batch.",
        studentCount: 0,
      });
    }

    // -------------------------------------------------------
    // START SESSION
    // -------------------------------------------------------

    const now =
      new Date();

    session.startedAt =
      now;

    session.endedAt =
      null;

    session.totalMinutes =
      0;

    session.status =
      "Tracking";

    await session.save();

    // -------------------------------------------------------
    // CREATE ABSENT ATTENDANCE
    // FOR EVERY STUDENT
    // -------------------------------------------------------

    const operations =
      students.map(
        (student) => ({
          updateOne: {
            filter: {
              sessionId:
                session._id,

              studentId:
                student._id,
            },

            update: {
              $setOnInsert: {
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
                  now,

                sessionEndTime:
                  null,

                checkInTime:
                  null,

                checkOutTime:
                  null,

                attendedMinutes:
                  0,

                attendancePercentage:
                  0,

                // IMPORTANT
                // Every student starts absent
                status:
                  "Absent",

                calculatedStatus:
                  "Absent",

                manuallyOverridden:
                  false,

                markedBy:
                  getUserId(req),

                excuseReason:
                  "",

                notes:
                  "",
              },
            },

            upsert:
              true,
          },
        })
      );

    const result =
      await Attendance.bulkWrite(
        operations
      );

    // -------------------------------------------------------
    // GET ATTENDANCE RECORDS
    // -------------------------------------------------------

    const attendanceRecords =
      await Attendance.find({
        sessionId:
          session._id,
      }).populate(
        "studentId",
        "name email phone role"
      );

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Attendance tracking started",

      session,

      studentCount:
        students.length,

      attendanceRecordsCreated:
        result.upsertedCount || 0,

      students,

      attendanceRecords,
    });
  } catch (error) {
    console.error(
      "START TRACKING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to start tracking",
    });
  }
};

// =========================================================
// STOP TRACKING
// =========================================================

const stopTracking = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can stop tracking",
      });
    }

    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    if (session.status !== "Tracking") {
      return res.status(400).json({
        message:
          `Session is not currently tracking. Current status: ${session.status}`,
      });
    }

    const now =
      new Date();

    session.endedAt =
      now;

    if (session.startedAt) {
      session.totalMinutes =
        Math.max(
          0,
          Math.round(
            (
              now.getTime() -
              new Date(
                session.startedAt
              ).getTime()
            ) / 60000
          )
        );
    }

    session.status =
      "Stopped";

    await session.save();

    const attendanceRecords =
      await Attendance.find({
        sessionId:
          session._id,
      });

    for (
      const attendance of
        attendanceRecords
    ) {
      attendance.sessionStartTime =
        session.startedAt;

      attendance.sessionEndTime =
        session.endedAt;

      // -----------------------------------------------------
      // NO CHECK-IN = ABSENT
      // -----------------------------------------------------

      if (
        !attendance.checkInTime
      ) {
        if (
          !attendance.manuallyOverridden &&
          attendance.status !==
            "Excused"
        ) {
          attendance.status =
            "Absent";

          attendance.calculatedStatus =
            "Absent";

          attendance.attendedMinutes =
            0;

          attendance.attendancePercentage =
            0;
        }

        await attendance.save();

        continue;
      }

      // -----------------------------------------------------
      // CHECKED IN BUT NO CHECKOUT
      // -----------------------------------------------------

      if (
        attendance.checkInTime &&
        !attendance.checkOutTime
      ) {
        const result =
          calculateAttendance({
            session,

            checkInTime:
              attendance.checkInTime,

            checkOutTime:
              session.endedAt,
          });

        attendance.attendedMinutes =
          result.attendedMinutes;

        attendance.attendancePercentage =
          result.attendancePercentage;

        attendance.calculatedStatus =
          result.status;

        if (
          !attendance.manuallyOverridden &&
          attendance.status !==
            "Excused"
        ) {
          attendance.status =
            result.status;
        }
      }

      await attendance.save();
    }

    return res.status(200).json({
      success: true,

      message:
        "Attendance tracking stopped",

      session,
    });
  } catch (error) {
    console.error(
      "STOP TRACKING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to stop tracking",
    });
  }
};

// =========================================================
// REVIEW SESSION
// =========================================================

const reviewSession = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can review sessions",
      });
    }

    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    if (session.status !== "Stopped") {
      return res.status(400).json({
        message:
          `Session must be Stopped before review. Current status: ${session.status}`,
      });
    }

    const attendanceRecords =
      await Attendance.find({
        sessionId:
          session._id,
      });

    for (
      const attendance of
        attendanceRecords
    ) {
      attendance.sessionStartTime =
        session.startedAt;

      attendance.sessionEndTime =
        session.endedAt;

      if (
        attendance.checkInTime &&
        !attendance.checkOutTime
      ) {
        const result =
          calculateAttendance({
            session,

            checkInTime:
              attendance.checkInTime,

            checkOutTime:
              session.endedAt,
          });

        attendance.attendedMinutes =
          result.attendedMinutes;

        attendance.attendancePercentage =
          result.attendancePercentage;

        attendance.calculatedStatus =
          result.status;

        if (
          !attendance.manuallyOverridden &&
          attendance.status !==
            "Excused"
        ) {
          attendance.status =
            result.status;
        }
      }

      if (
        !attendance.checkInTime &&
        attendance.status !==
          "Excused"
      ) {
        attendance.attendedMinutes =
          0;

        attendance.attendancePercentage =
          0;

        attendance.calculatedStatus =
          "Absent";

        if (
          !attendance.manuallyOverridden
        ) {
          attendance.status =
            "Absent";
        }
      }

      await attendance.save();
    }

    session.status =
      "Reviewed";

    session.reviewedBy =
      getUserId(req);

    session.reviewedAt =
      new Date();

    await session.save();

    return res.status(200).json({
      success: true,

      message:
        "Session reviewed successfully",

      session,
    });
  } catch (error) {
    console.error(
      "REVIEW SESSION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to review session",
    });
  }
};

// =========================================================
// SAVE SESSION
// =========================================================

const saveSession = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        message:
          "Only admins can save sessions",
      });
    }

    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    if (session.status !== "Reviewed") {
      return res.status(400).json({
        message:
          `Session must be Reviewed before saving. Current status: ${session.status}`,
      });
    }

    session.status =
      "Saved";

    session.savedAt =
      new Date();

    await session.save();

    return res.status(200).json({
      success: true,

      message:
        "Session saved successfully",

      session,
    });
  } catch (error) {
    console.error(
      "SAVE SESSION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to save session",
    });
  }
};

// =========================================================
// GET ALL SESSIONS
// =========================================================

const getSessions = async (req, res) => {
  try {
    const userId =
      getUserId(req);

    const {
      batchId,
      week,
      status,
      sessionDate,
    } = req.query;

    const filter = {};

    // -------------------------------------------------------
    // ADMIN
    // -------------------------------------------------------

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
    }

    // -------------------------------------------------------
    // MENTOR
    // -------------------------------------------------------

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
    }

    // -------------------------------------------------------
    // STUDENT
    // -------------------------------------------------------

    else if (isStudent(req)) {
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
        !isStudentInBatch(
          batch,
          userId
        )
      ) {
        return res.status(403).json({
          message:
            "You are not registered in this batch",
        });
      }

      filter.batchId =
        batchId;
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

    if (
      week !== undefined &&
      week !== ""
    ) {
      const numericWeek =
        Number(week);

      if (
        Number.isNaN(
          numericWeek
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid week",
        });
      }

      filter.week =
        numericWeek;
    }

    // -------------------------------------------------------
    // STATUS
    // -------------------------------------------------------

    if (status) {
      filter.status =
        status;
    }

    // -------------------------------------------------------
    // DATE
    // -------------------------------------------------------

    if (sessionDate) {
      const date =
        new Date(
          sessionDate
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid sessionDate",
        });
      }

      const start =
        new Date(date);

      start.setHours(
        0,
        0,
        0,
        0
      );

      const end =
        new Date(date);

      end.setHours(
        23,
        59,
        59,
        999
      );

      filter.sessionDate = {
        $gte: start,
        $lte: end,
      };
    }

    // -------------------------------------------------------
    // QUERY
    // -------------------------------------------------------

    const sessions =
      await Session.find(
        filter
      )
        .populate(
          "batchId",
          "name batchName startDate mentorIds studentIds students"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "reviewedBy",
          "name email"
        )
        .sort({
          sessionDate: -1,
          week: -1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      totalSessions:
        sessions.length,

      sessions,
    });
  } catch (error) {
    console.error(
      "GET SESSIONS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to get sessions",
    });
  }
};

// =========================================================
// GET SESSION BY ID
// =========================================================

const getSessionById = async (req, res) => {
  try {
    const session =
      await Session.findById(
        req.params.id
      )
        .populate(
          "batchId",
          "name batchName startDate mentorIds studentIds students"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "reviewedBy",
          "name email"
        );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    const userId =
      getUserId(req);

    // ADMIN
    if (isAdmin(req)) {
      return res.status(200).json({
        success: true,
        session,
      });
    }

    // MENTOR
    if (isMentor(req)) {
      const batch =
        await Batch.findById(
          session.batchId?._id ||
            session.batchId
        );

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
        success: true,
        session,
      });
    }

    // STUDENT
    if (isStudent(req)) {
      const batch =
        await Batch.findById(
          session.batchId?._id ||
            session.batchId
        );

      if (
        !isStudentInBatch(
          batch,
          userId
        )
      ) {
        return res.status(403).json({
          message:
            "You are not registered in this batch",
        });
      }

      return res.status(200).json({
        success: true,
        session,
      });
    }

    return res.status(403).json({
      message:
        "Access denied",
    });
  } catch (error) {
    console.error(
      "GET SESSION BY ID ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to get session",
    });
  }
};

// =========================================================
// PARTICIPANT JOIN
// =========================================================

const participantJoin = async (req, res) => {
  try {
    if (!isStudent(req)) {
      return res.status(403).json({
        message:
          "Only students can join attendance sessions",
      });
    }

    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    if (session.status !== "Tracking") {
      return res.status(400).json({
        message:
          "Attendance tracking is not currently active",
      });
    }

    const studentId =
      getUserId(req);

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
          "You are not registered in this batch",
      });
    }

    let attendance =
      await Attendance.findOne({
        sessionId:
          session._id,

        studentId,
      });

    // -------------------------------------------------------
    // CREATE RECORD IF MISSING
    // -------------------------------------------------------

    if (!attendance) {
      attendance =
        await Attendance.create({
          sessionId:
            session._id,

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
            studentId,

          excuseReason:
            "",

          notes:
            "",
        });
    }

    // -------------------------------------------------------
    // ALREADY JOINED
    // -------------------------------------------------------

    else if (
      attendance.checkInTime
    ) {
      return res.status(409).json({
        message:
          "You have already joined this session",

        attendance,
      });
    }

    // -------------------------------------------------------
    // CHECK IN
    // -------------------------------------------------------

    else {
      attendance.checkInTime =
        new Date();

      attendance.sessionStartTime =
        session.startedAt;

      await attendance.save();
    }

    return res.status(200).json({
      success: true,

      message:
        "You joined the session successfully",

      attendance,
    });
  } catch (error) {
    console.error(
      "PARTICIPANT JOIN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to join session",
    });
  }
};

// =========================================================
// PARTICIPANT LEAVE
// =========================================================

const participantLeave = async (req, res) => {
  try {
    if (!isStudent(req)) {
      return res.status(403).json({
        message:
          "Only students can leave attendance sessions",
      });
    }

    const session =
      await Session.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    const studentId =
      getUserId(req);

    const attendance =
      await Attendance.findOne({
        sessionId:
          session._id,

        studentId,
      });

    if (!attendance) {
      return res.status(404).json({
        message:
          "Attendance record not found",
      });
    }

    if (!attendance.checkInTime) {
      return res.status(400).json({
        message:
          "You have not joined this session",
      });
    }

    if (attendance.checkOutTime) {
      return res.status(409).json({
        message:
          "You have already left this session",

        attendance,
      });
    }

    const checkOutTime =
      new Date();

    attendance.checkOutTime =
      checkOutTime;

    const calculationSession = {
      ...session.toObject(),
      endedAt:
        session.endedAt ||
        checkOutTime,
    };

    const result =
      calculateAttendance({
        session:
          calculationSession,

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

    if (
      !attendance.manuallyOverridden &&
      attendance.status !==
        "Excused"
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
      success: true,

      message:
        "You left the session successfully",

      attendance,
    });
  } catch (error) {
    console.error(
      "PARTICIPANT LEAVE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to leave session",
    });
  }
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
    !session?.startedAt ||
    !session?.endedAt ||
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

  const sessionEnd =
    new Date(
      session.endedAt
    ).getTime();

  const checkIn =
    new Date(
      checkInTime
    ).getTime();

  const checkOut =
    new Date(
      checkOutTime
    ).getTime();

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

  let status =
    "Absent";

  if (
    attendancePercentage >=
    90
  ) {
    status =
      "Present";
  } else if (
    attendancePercentage >=
    50
  ) {
    status =
      "Late";
  }

  return {
    attendedMinutes,

    attendancePercentage,

    status,
  };
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createSession,
  openSession,
  startTracking,
  stopTracking,
  reviewSession,
  saveSession,
  getSessions,
  getSessionById,
  participantJoin,
  participantLeave,
};