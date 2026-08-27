require("dotenv").config();

const {
  getConferenceRecord,
  getParticipantsWithDuration,
} = require("./services/googleMeetService");

const test = async () => {
  try {
    const meetingCode = "avh-jarn-ths";

    console.log("Finding conference...");
    console.log("Meeting:", meetingCode);

    const conference =
      await getConferenceRecord(meetingCode);

    if (!conference) {
      console.log("❌ No conference record found.");
      console.log(
        "Google may need a little time to process the meeting."
      );
      return;
    }

    console.log("Conference found:");
    console.log(conference.name);

    const participants =
      await getParticipantsWithDuration(
        conference.name
      );

    console.log("");
    console.log("=================================");
    console.log("PARTICIPANTS");
    console.log("=================================");

    console.dir(participants, {
      depth: null,
    });

    console.log("=================================");
  } catch (error) {
    console.error("");
    console.error("❌ PARTICIPANT TEST FAILED");
    console.error(error.message);

    if (error.response?.data) {
      console.error(error.response.data);
    }
  }
};

test();