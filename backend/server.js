const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

// =========================================================
// ROUTES
// =========================================================

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const mentorRoutes = require("./routes/mentorRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const batchRoutes = require("./routes/batchRoutes");

const attendanceRoutes = require("./routes/attendanceRoutes");
const progressRoutes = require("./routes/progressRoutes");

const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/SubmissionRoutes");

const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const superAdminRoutes = require("./routes/superAdminRoutes");

// =========================================================
// APP
// =========================================================

const app = express();

const PORT = process.env.PORT || 5000;

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// =========================================================
// BASIC ROUTES
// =========================================================

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

// =========================================================
// API ROUTES
// =========================================================

// Users
app.use("/api/users", userRoutes);

// Authentication
app.use("/api/auth", authRoutes);

// Seasons
app.use("/api/seasons", seasonRoutes);

// Mentor
app.use("/api/mentor", mentorRoutes);

// Batches
app.use("/api/batches", batchRoutes);

// Attendance
app.use("/api/attendance", attendanceRoutes);

// Progress
app.use("/api/progress", progressRoutes);

// Assignments
app.use("/api/assignments", assignmentRoutes);

// Submissions
app.use("/api/submissions", submissionRoutes);

// Announcements
app.use("/api/announcements", announcementRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Super Admin
app.use("/api/superadmin", superAdminRoutes);

// =========================================================
// REGISTRATION
// =========================================================
//
// Temporarily disabled because the registration system
// belongs to your teammate and its RegistrationSettings
// model is currently missing.
//
// We will reconnect these routes after your teammate's
// registration backend is ready.
//
// app.use("/api/registrations", registrationRoutes);
//
// app.use(
//   "/api/registration-settings",
//   registrationSettingsRoutes
// );

// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =========================================================
// ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =========================================================
// START SERVER
// =========================================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("========================================");
      console.log("Bootcamp Management System Backend");
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(
        `Health check: http://localhost:${PORT}/api/health`
      );
      console.log("========================================");
    });
  } catch (error) {
    console.error("Server startup failed:");
    console.error(error.message);

    process.exit(1);
  }
};

startServer();