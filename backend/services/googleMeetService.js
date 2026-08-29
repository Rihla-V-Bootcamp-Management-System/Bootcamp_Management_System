const { google } = require("googleapis");
const {
  getAuthenticatedClient,
} = require("./googleOAuth");

// =====================================================
// GET MEET CLIENT
// =====================================================

const getMeetClient = () => {
  const authClient = getAuthenticatedClient();

  return google.meet({
    version: "v2",
    auth: authClient,
  });
};

// =====================================================
// CREATE GOOGLE MEET SPACE
// =====================================================

const createMeetSpace = async () => {
  const meet = getMeetClient();

  const { data } = await meet.spaces.create({
    requestBody: {},
  });

  return {
    meetingCode: data.meetingCode,
    meetingUri: data.meetingUri,
  };
};

// =====================================================
// GET CONFERENCE RECORD
// =====================================================

const getConferenceRecord = async (meetingCode) => {
  const meet = getMeetClient();

  const { data } = await meet.conferenceRecords.list({
    filter: `space.meeting_code="${meetingCode}"`,
  });

  return data.conferenceRecords?.[0] || null;
};

// =====================================================
// GET PARTICIPANTS + DURATION
// =====================================================

const getParticipantsWithDuration = async (
  conferenceRecordName
) => {
  const meet = getMeetClient();

  const { data } =
    await meet.conferenceRecords.participants.list({
      parent: conferenceRecordName,
    });

  const participants = data.participants || [];

  const results = await Promise.all(
    participants.map(async (participant) => {
      console.log(
        "RAW GOOGLE PARTICIPANT:",
        JSON.stringify(participant, null, 2)
      );

      const sessionsResponse =
        await meet.conferenceRecords.participants.participantSessions.list({
          parent: participant.name,
        });

      const participantSessions =
        sessionsResponse.data.participantSessions || [];

      let totalMs = 0;
      let earliestStart = null;
      let latestEnd = null;

      const sessions = [];

      participantSessions.forEach((session) => {
        if (
          session.startTime &&
          session.endTime
        ) {
          const start = new Date(session.startTime);
          const end = new Date(session.endTime);
          const segmentMs = Math.max(0, end - start);
          const segmentMinutes = Math.round(segmentMs / 60000);

          totalMs += segmentMs;

          if (
            !earliestStart ||
            start < earliestStart
          ) {
            earliestStart = start;
          }

          if (
            !latestEnd ||
            end > latestEnd
          ) {
            latestEnd = end;
          }

          sessions.push({
            sessionId: session.name,
            startTime: start,
            endTime: end,
            minutes: segmentMinutes,
          });
        }
      });

      const googleUserId =
        participant.signedinUser?.user
          ?.split("/")
          .pop() || null;

      return {
        name: participant.name,
        displayName:
          participant.signedinUser?.displayName ||
          participant.anonymousUser?.displayName ||
          "Unknown",
        email:
          participant.signedinUser?.user ||
          participant.email ||
          null,
        googleUserId,
        checkInTime: earliestStart,
        checkOutTime: latestEnd,
        totalMinutes: Math.round(
          totalMs / 60000
        ),
        sessions,
      };
    })
  );

  return results;
};

module.exports = {
  createMeetSpace,
  getConferenceRecord,
  getParticipantsWithDuration,
};