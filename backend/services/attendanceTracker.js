// =========================================================
// AI ATTENDANCE TRACKER
// =========================================================

const DAY_MS = 1000 * 60 * 60 * 24;
const MINUTE_MS = 1000 * 60;

// ---------------------------------------------------------
// CALCULATE WEEK
// ---------------------------------------------------------

const calculateWeek = (batchStartDate, currentDate = new Date()) => {
  if (!batchStartDate) {
    throw new Error("Batch start date is required");
  }

  const start = new Date(batchStartDate);
  const current = new Date(currentDate);

  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid batch start date");
  }

  if (Number.isNaN(current.getTime())) {
    throw new Error("Invalid current date");
  }

  // Normalize to dates only
  start.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  const difference = current.getTime() - start.getTime();

  if (difference < 0) {
    return 1;
  }

  return Math.floor(difference / DAY_MS) + 1;
};

// ---------------------------------------------------------
// CALCULATE ATTENDANCE FROM TIME
// ---------------------------------------------------------

const calculateAttendance = ({
  sessionStartTime,
  sessionEndTime,
  checkInTime,
  checkOutTime,
}) => {
  if (!sessionStartTime || !sessionEndTime) {
    throw new Error("Session start and end time are required");
  }

  // No check-in means absent
  if (!checkInTime) {
    return {
      attendedMinutes: 0,
      attendancePercentage: 0,
      status: "Absent",
    };
  }

  // Check-in but no check-out
  if (!checkOutTime) {
    return {
      attendedMinutes: 0,
      attendancePercentage: 0,
      status: "Absent",
    };
  }

  const sessionStart = new Date(sessionStartTime).getTime();
  const sessionEnd = new Date(sessionEndTime).getTime();

  const checkIn = new Date(checkInTime).getTime();
  const checkOut = new Date(checkOutTime).getTime();

  if (
    Number.isNaN(sessionStart) ||
    Number.isNaN(sessionEnd) ||
    Number.isNaN(checkIn) ||
    Number.isNaN(checkOut)
  ) {
    throw new Error("Invalid attendance time");
  }

  if (checkOut <= checkIn) {
    return {
      attendedMinutes: 0,
      attendancePercentage: 0,
      status: "Absent",
    };
  }

  // Don't allow time outside session
  const actualStart = Math.max(checkIn, sessionStart);
  const actualEnd = Math.min(checkOut, sessionEnd);

  if (actualEnd <= actualStart) {
    return {
      attendedMinutes: 0,
      attendancePercentage: 0,
      status: "Absent",
    };
  }

  const sessionMinutes = Math.round(
    (sessionEnd - sessionStart) / MINUTE_MS
  );

  const attendedMinutes = Math.round(
    (actualEnd - actualStart) / MINUTE_MS
  );

  const attendancePercentage =
    sessionMinutes > 0
      ? Number(
          ((attendedMinutes / sessionMinutes) * 100).toFixed(2)
        )
      : 0;

  let status = "Absent";

  // IMPORTANT:
  // Excused is NOT calculated here.
  // Excused is manually approved.

  if (attendancePercentage >= 90) {
    status = "Present";
  } else if (attendancePercentage > 0) {
    status = "Late";
  } else {
    status = "Absent";
  }

  return {
    attendedMinutes,
    attendancePercentage,
    status,
  };
};

// ---------------------------------------------------------
// CREATE SESSION DATE
// ---------------------------------------------------------

const getSessionDate = (date = new Date()) => {
  const sessionDate = new Date(date);

  sessionDate.setHours(0, 0, 0, 0);

  return sessionDate;
};

// ---------------------------------------------------------
// BUILD SESSION TIMES
// ---------------------------------------------------------

const buildSessionTimes = ({
  sessionDate,
  startHour = 9,
  startMinute = 0,
  endHour = 13,
  endMinute = 0,
}) => {
  const start = new Date(sessionDate);
  const end = new Date(sessionDate);

  start.setHours(startHour, startMinute, 0, 0);
  end.setHours(endHour, endMinute, 0, 0);

  return {
    sessionStartTime: start,
    sessionEndTime: end,
  };
};

module.exports = {
  calculateWeek,
  calculateAttendance,
  getSessionDate,
  buildSessionTimes,
};