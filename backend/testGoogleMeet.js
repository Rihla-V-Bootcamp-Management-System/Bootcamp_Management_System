require("dotenv").config();

const {
  createMeetSpace,
} = require("./services/googleMeetService");

const test = async () => {
  try {
    console.log("Testing Google Meet API...");
    console.log("=================================");

    const result = await createMeetSpace();

    console.log("GOOGLE MEET SUCCESS");
    console.log("=================================");
    console.log("Meeting Code:", result.meetingCode);
    console.log("Meeting URL:", result.meetingUri);
    console.log("=================================");
  } catch (error) {
    console.error("=================================");
    console.error("GOOGLE MEET TEST FAILED");
    console.error("=================================");
    console.error(error.message);

    if (error.response?.data) {
      console.error(
        JSON.stringify(error.response.data, null, 2)
      );
    }

    console.error("=================================");
  }
};

test();