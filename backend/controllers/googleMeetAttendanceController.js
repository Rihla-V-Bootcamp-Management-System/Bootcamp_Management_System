const MeetingSession = require("../models/MeetingSession");
const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");
const User = require("../models/User");

const {
  createMeetSpace,
  getConferenceRecord,
  getParticipantsWithDuration,
} = require("../services/googleMeetService");

const {
  calculateAttendance,
  calculateWeek,
} = require("../services/attendanceTracker");

// =====================================================
// SCHEDULE GOOGLE MEET SESSION
// =====================================================

const scheduleSession = async (req, res) => {
  try {
    // =============================================
    // ADMIN / SUPERADMIN ONLY
    // =============================================

    if (
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only admins can create Google Meet sessions",
      });
    }

    // =============================================
    // GET DATA FROM REQUEST
    // =============================================

    const {
      batchId,
      scheduledStart,
      scheduledEnd,
    } = req.body;

    if (
      !batchId ||
      !scheduledStart ||
      !scheduledEnd
    ) {
      return res.status(400).json({
        success: false,
        message:
          "batchId, scheduledStart and scheduledEnd are required",
      });
    }

    // =============================================
    // FIND BATCH
    // =============================================

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // =============================================
    // VALIDATE DATES
    // =============================================

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid scheduledStart or scheduledEnd",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message:
          "scheduledEnd must be after scheduledStart",
      });
    }

    // =============================================
    // CREATE GOOGLE MEET
    // =============================================

    const {
      meetingCode,
      meetingUri,
    } = await createMeetSpace();

    // =============================================
    // SAVE SESSION
    // =============================================

    const session =
      await MeetingSession.create({
        batchId: batch._id,

        createdBy: req.user._id,

        meetingCode,

        meetingUri,

        scheduledStart: start,

        scheduledEnd: end,

        syncStatus: "pending",
      });

    // =============================================
    // RESPONSE
    // =============================================

    return res.status(201).json({
      success: true,

      message:
        "Google Meet session scheduled",

      session,

      joinUrl: meetingUri,
    });
  } catch (error) {
    console.error(
      "SCHEDULE GOOGLE MEET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =====================================================
// SYNC ONE SESSION
// =====================================================

const syncSessionAttendance = async (session) => {
  const batch = await Batch.findById(session.batchId);

  if (!batch) {
    throw new Error(
      `Batch not found for session ${session._id}`
    );
  }

  const conferenceRecord =
    await getConferenceRecord(
      session.meetingCode
    );

  if (!conferenceRecord) {
    session.syncStatus = "failed";
    await session.save();

    return {
      synced: 0,
      unmatched: 0,
      message:
        "Conference record not available yet",
    };
  }

  const participants =
    await getParticipantsWithDuration(
      conferenceRecord.name
    );

  // -----------------------------------------------
  // GET STUDENTS IN THIS BATCH
  // -----------------------------------------------

  const students = await User.find({
    _id: {
      $in: batch.studentIds || [],
    },
    role: "student",
  });

  const week = calculateWeek(
    batch.startDate,
    session.scheduledStart
  );

  let syncedCount = 0;

  const unmatched = [];

  // -----------------------------------------------
  // MATCH PARTICIPANTS
  // -----------------------------------------------

  for (const participant of participants) {
    let student = null;

    // First: Google ID
    if (participant.googleUserId) {
      student = students.find(
        (s) =>
          s.googleUserId &&
          s.googleUserId ===
            participant.googleUserId
      );
    }

    // Second: email fallback if available
    if (!student && participant.email) {
      student = students.find(
        (s) =>
          s.email &&
          s.email.toLowerCase() ===
            participant.email.toLowerCase()
      );
    }

    // ---------------------------------------------
    // NO MATCH
    // ---------------------------------------------

    if (!student) {
      unmatched.push({
        displayName:
          participant.displayName,

        googleUserId:
          participant.googleUserId || null,

        attendedMinutes:
          participant.totalMinutes,
      });

      continue;
    }

    // ---------------------------------------------
    // CALCULATE ATTENDANCE
    // ---------------------------------------------

    const result = calculateAttendance({
      sessionStartTime:
        session.scheduledStart,

      sessionEndTime:
        session.scheduledEnd,

      checkInTime:
        participant.checkInTime,

      checkOutTime:
        participant.checkOutTime,
    });

    // ---------------------------------------------
    // UPSERT ATTENDANCE
    // ---------------------------------------------

    await Attendance.findOneAndUpdate(
      {
        sessionId: session._id,
        studentId: student._id,
      },
      {
        sessionId: session._id,
        studentId: student._id,
        batchId: batch._id,

        week,

        sessionDate:
          session.scheduledStart,

        sessionStartTime:
          session.scheduledStart,

        sessionEndTime:
          session.scheduledEnd,

        checkInTime:
          participant.checkInTime,

        checkOutTime:
          participant.checkOutTime,

        attendedMinutes:
          result.attendedMinutes,

        attendancePercentage:
          result.attendancePercentage,

        calculatedStatus:
          result.status,

        status:
          result.status,

        manuallyOverridden: false,

        markedBy:
          session.createdBy,

        source: "google_meet_auto",

        notes:
          `Auto-marked via Google Meet (${result.attendancePercentage}% of session)`,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    syncedCount++;
  }

  // -----------------------------------------------
  // STUDENTS WHO DID NOT JOIN
  // -----------------------------------------------

  for (const student of students) {
    const joined = participants.some(
      (participant) =>
        participant.googleUserId &&
        student.googleUserId &&
        participant.googleUserId ===
          student.googleUserId
    );

    if (!joined) {
      const result = calculateAttendance({
        sessionStartTime:
          session.scheduledStart,

        sessionEndTime:
          session.scheduledEnd,

        checkInTime: null,

        checkOutTime: null,
      });

      await Attendance.findOneAndUpdate(
        {
          sessionId: session._id,
          studentId: student._id,
        },
        {
          sessionId: session._id,
          studentId: student._id,
          batchId: batch._id,

          week,

          sessionDate:
            session.scheduledStart,

          sessionStartTime:
            session.scheduledStart,

          sessionEndTime:
            session.scheduledEnd,

          checkInTime: null,

          checkOutTime: null,

          attendedMinutes: 0,

          attendancePercentage: 0,

          calculatedStatus:
            result.status,

          status:
            result.status,

          manuallyOverridden: false,

          markedBy:
            session.createdBy,

          source: "google_meet_auto",

          notes:
            "Auto-marked via Google Meet (did not join)",
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      syncedCount++;
    }
  }

  session.unmatchedParticipants =
    unmatched;

  session.syncStatus = "synced";

  await session.save();

  return {
    synced: syncedCount,
    unmatched: unmatched.length,
  };
};

// =====================================================
// MANUAL SYNC
// =====================================================

const syncSessionNow = async (req, res) => {
  try {
    // =============================================
    // ADMIN / SUPERADMIN ONLY
    // =============================================

    if (
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins can sync attendance",
      });
    }

    // =============================================
    // FIND SESSION
    // =============================================

    const session =
      await MeetingSession.findById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Meeting session not found",
      });
    }

    // =============================================
    // SYNC ATTENDANCE
    // =============================================

    const result =
      await syncSessionAttendance(session);

    return res.status(200).json({
      success: true,
      message: "Google Meet attendance synced",
      ...result,
    });
  } catch (error) {
    console.error(
      "SYNC GOOGLE MEET ATTENDANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  scheduleSession,
  syncSessionAttendance,
  syncSessionNow,
};