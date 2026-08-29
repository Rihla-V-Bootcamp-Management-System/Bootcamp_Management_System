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
// PREVIEW SESSION PARTICIPANTS (WITHOUT SAVING)
// =====================================================

const previewSessionParticipants = async (req, res) => {
  try {
    const userRole = String(req.user?.role || "").toLowerCase();
    if (
      userRole !== "admin" &&
      userRole !== "superadmin" &&
      userRole !== "mentor"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only admins and mentors can preview session participants",
      });
    }

    const { id } = req.params;
    const Session = require("../models/Session");
    let session = await MeetingSession.findById(id);
    let regularSession = null;

    if (!session) {
      regularSession = await Session.findById(id);
    }

    const meetingCode =
      session?.meetingCode || req.query.meetingCode;
    const batchId =
      session?.batchId ||
      regularSession?.batchId ||
      req.query.batchId;

    if (!meetingCode && !session && !regularSession) {
      return res.status(404).json({
        success: false,
        message: "Session or MeetingSession not found",
      });
    }

    const targetBatch = batchId
      ? await Batch.findById(batchId)
      : null;
    const students = targetBatch?.studentIds?.length
      ? await User.find({
          _id: { $in: targetBatch.studentIds },
          role: "student",
        }).select(
          "name email userID googleUserId firstName lastName"
        )
      : await User.find({ role: "student" }).select(
          "name email userID googleUserId firstName lastName"
        );

    // If meeting code is available, look up Google Meet conference records
    const codeToSearch = meetingCode || "";
    let conferenceRecord = null;
    let participants = [];

    if (codeToSearch) {
      try {
        conferenceRecord =
          await getConferenceRecord(codeToSearch);
        if (conferenceRecord) {
          participants =
            await getParticipantsWithDuration(
              conferenceRecord.name
            );
        }
      } catch (err) {
        console.warn(
          "Google Meet API preview warning:",
          err.message
        );
      }
    }

    const participantPreviews = participants.map(
      (participant) => {
        let matchedStudent = null;

        // 1. Google User ID match
        if (participant.googleUserId) {
          matchedStudent = students.find(
            (s) =>
              s.googleUserId &&
              s.googleUserId ===
                participant.googleUserId
          );
        }

        // 2. Email match
        if (!matchedStudent && participant.email) {
          const participantEmail = String(
            participant.email
          )
            .toLowerCase()
            .trim();
          matchedStudent = students.find(
            (s) =>
              s.email &&
              s.email.toLowerCase().trim() ===
                participantEmail
          );
        }

        // 3. Name fallback match
        if (
          !matchedStudent &&
          participant.displayName &&
          participant.displayName !== "Unknown"
        ) {
          const pName = participant.displayName
            .toLowerCase()
            .trim();
          matchedStudent = students.find((s) => {
            const sName = (
              s.name ||
              `${s.firstName || ""} ${
                s.lastName || ""
              }`
            )
              .toLowerCase()
              .trim();
            return (
              sName &&
              (pName.includes(sName) ||
                sName.includes(pName))
            );
          });
        }

        return {
          displayName: participant.displayName,
          email:
            participant.email ||
            (matchedStudent
              ? matchedStudent.email
              : null),
          googleUserId:
            participant.googleUserId || null,
          checkInTime: participant.checkInTime,
          checkOutTime: participant.checkOutTime,
          totalMinutes:
            participant.totalMinutes || 0,
          sessions: participant.sessions || [],
          isMatched: !!matchedStudent,
          matchedStudent: matchedStudent
            ? {
                _id: matchedStudent._id,
                name:
                  matchedStudent.name ||
                  `${matchedStudent.firstName || ""} ${
                    matchedStudent.lastName || ""
                  }`,
                email: matchedStudent.email,
                userID: matchedStudent.userID,
              }
            : null,
        };
      }
    );

    const matchedCount =
      participantPreviews.filter(
        (p) => p.isMatched
      ).length;
    const unmatchedCount =
      participantPreviews.filter(
        (p) => !p.isMatched
      ).length;
    const unmatchedParticipants =
      participantPreviews.filter(
        (p) => !p.isMatched
      );

    return res.status(200).json({
      success: true,
      conferenceRecordAvailable:
        !!conferenceRecord,
      session: {
        _id:
          session?._id ||
          regularSession?._id ||
          id,
        meetingCode: codeToSearch,
        scheduledStart:
          session?.scheduledStart ||
          regularSession?.startedAt ||
          null,
        scheduledEnd:
          session?.scheduledEnd ||
          regularSession?.endedAt ||
          null,
        syncStatus:
          session?.syncStatus || "pending",
      },
      totalParticipants:
        participantPreviews.length,
      matchedCount,
      unmatchedCount,
      participants: participantPreviews,
      unmatchedParticipants,
    });
  } catch (error) {
    console.error(
      "PREVIEW SESSION PARTICIPANTS ERROR:",
      error
    );
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to preview session participants",
    });
  }
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

    const Session = require("../models/Session");
    let session =
      await MeetingSession.findById(
        req.params.id
      );

    if (!session) {
      const regSession =
        await Session.findById(req.params.id);
      if (regSession) {
        session = {
          _id: regSession._id,
          batchId: regSession.batchId,
          createdBy: req.user._id,
          meetingCode:
            req.body.meetingCode ||
            req.query.meetingCode,
          scheduledStart:
            regSession.startedAt ||
            regSession.scheduledStartTime ||
            regSession.sessionDate,
          scheduledEnd:
            regSession.endedAt ||
            regSession.scheduledEndTime ||
            new Date(),
          save: async () => {},
        };
      }
    }

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
  previewSessionParticipants,
};