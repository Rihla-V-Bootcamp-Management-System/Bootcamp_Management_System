const dns = require("dns");

// Use Google DNS to help with MongoDB Atlas SRV resolution
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// ==========================================
// DATABASE
// ==========================================

const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const moduleResourceRoutes = require("./routes/moduleResourceRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const batchRoutes = require("./routes/batchRoutes");
const levelRoutes = require("./routes/levelRoutes");

const dailyTaskRoutes = require("./routes/dailyTaskRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const progressRoutes = require("./routes/progressRoutes");
const googleMeetRoutes = require("./routes/googleMeetRoutes");
const googleMeetAttendanceRoutes = require(
  "./routes/googleMeetAttendanceRoutes"
);
const analyticsRoutes = require("./routes/analyticsRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/SubmissionRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const superAdminRoutes = require("./routes/superAdminRoutes");

// ==========================================
// APP CONFIG
// ==========================================

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// HEALTH / TEST ROUTES
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bootcamp Management System API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Server is healthy",
  });
});

// ==========================================
// DAILY TASKS
// ==========================================

app.use(
  "/api/daily-tasks",
  dailyTaskRoutes
);

// ==========================================
// USERS & AUTHENTICATION
// ==========================================

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/auth",
  authRoutes
);
// ==========================================
// GOOGLE MEET ATTENDANCE
// ==========================================

app.use(
  "/api/google-meet",
  googleMeetRoutes
);
// ==========================================
// LEVELS
// ==========================================
app.use(
  "/api/google-meet-attendance",
  googleMeetAttendanceRoutes
);
app.use(
  "/api/levels",
  levelRoutes
);

// ==========================================
// MODULES
// ==========================================

app.use(
  "/api/modules",
  moduleRoutes
);

app.use(
  "/api/module-resources",
  moduleResourceRoutes
);

// ==========================================
// SEASONS
// ==========================================

app.use(
  "/api/seasons",
  seasonRoutes
);

// ==========================================
// MENTORS
// ==========================================

app.use(
  "/api/mentors",
  mentorRoutes
);

// ==========================================
// ANALYTICS
// ==========================================

app.use(
  "/api/analytics",
  analyticsRoutes
);

// ==========================================
// BATCHES
// ==========================================

app.use(
  "/api/batches",
  batchRoutes
);

// ==========================================
// ATTENDANCE
// ==========================================

app.use(
  "/api/attendance",
  attendanceRoutes
);

// ==========================================
// SESSIONS
// ==========================================

app.use(
  "/api/sessions",
  sessionRoutes
);

// ==========================================
// PROGRESS
// ==========================================

app.use(
  "/api/progress",
  progressRoutes
);

// ==========================================
// ASSIGNMENTS
// ==========================================

app.use(
  "/api/assignments",
  assignmentRoutes
);

// ==========================================
// SUBMISSIONS
// ==========================================

app.use(
  "/api/submissions",
  submissionRoutes
);

// ==========================================
// SUPER ADMIN
// ==========================================

app.use(
  "/api/superadmin",
  superAdminRoutes
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("==========================================");
  console.error("SERVER ERROR");
  console.error("==========================================");
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message ||
      "Internal server error",
  });
});

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("==========================================");
      console.log(
        "Bootcamp Management System Backend"
      );
      console.log("==========================================");
      console.log(
        `Server running on http://localhost:${PORT}`
      );
      console.log(
        `Health check: http://localhost:${PORT}/api/health`
      );
      console.log(
        `Sessions API: http://localhost:${PORT}/api/sessions`
      );
      console.log(
        `Attendance API: http://localhost:${PORT}/api/attendance`
      );
      console.log(
        `Progress API: http://localhost:${PORT}/api/progress`
      );
      console.log(
        `Mentor API: http://localhost:${PORT}/api/mentors`
      );
      console.log("==========================================");
    });
  } catch (error) {
    console.error("==========================================");
    console.error("SERVER STARTUP FAILED");
    console.error("==========================================");
    console.error(error);
    console.error("==========================================");

    process.exit(1);
  }
};

startServer();