const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const moduleResourceRoutes = require("./routes/moduleResourceRoutes");
// ==========================================
// ROUTES
// ==========================================
const moduleRoutes = require("./routes/moduleRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const batchRoutes = require("./routes/batchRoutes");
const levelRoutes = require("./routes/levelRoutes");
// =======================ii===================
// ATTENDANCE & PROGRESS
// ==========================================
const dailyTaskRoutes = require("./routes/dailyTaskRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const progressRoutes = require("./routes/progressRoutes");

// ==========================================
// ASSIGNMENT & SUBMISSION ROUTES
// ==========================================
const analyticsRoutes = require("./routes/analyticsRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/SubmissionRoutes");

// ==========================================
// SUPER ADMIN
// ==========================================

const superAdminRoutes = require("./routes/superAdminRoutes");

// ==========================================
// APP CONFIG
// ==========================================

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ==========================================
// TEST / HEALTH ROUTES
// ==========================================
app.use("/api/daily-tasks", dailyTaskRoutes);
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
// API ROUTES
// ==========================================

// ------------------------------------------
// Users & Authentication
// ------------------------------------------
app.use("/api/levels", levelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/auth", authRoutes);
app.use(
  "/api/module-resources",
  moduleResourceRoutes
);
// ------------------------------------------
// Seasons
// ------------------------------------------

app.use("/api/seasons", seasonRoutes);

// ------------------------------------------
// Mentors
// ------------------------------------------

app.use("/api/mentors", mentorRoutes);
app.use("/api/analytics", analyticsRoutes);
// ------------------------------------------
// Batches
// ------------------------------------------

app.use("/api/batches", batchRoutes);

// ------------------------------------------
// Attendance
// ------------------------------------------

app.use("/api/attendance", attendanceRoutes);

// ------------------------------------------
// Progress
// ------------------------------------------

app.use("/api/progress", progressRoutes);

// ------------------------------------------
// Assignments
// ------------------------------------------

app.use("/api/assignments", assignmentRoutes);

// ------------------------------------------
// Submissions
// ------------------------------------------

app.use("/api/submissions", submissionRoutes);

// ==========================================
// REGISTRATION ROUTES
// TEMPORARILY DISABLED
// ==========================================

// app.use("/api/registrations", registrationRoutes);

// app.use("/api/form-questions", formQuestionRoutes);

// app.use(
//   "/api/registration-settings",
//   registrationSettingsRoutes
// );

// ==========================================
// SUPER ADMIN
// ==========================================

app.use("/api/superadmin", superAdminRoutes);

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
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
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
      console.log("Bootcamp Management System Backend");
      console.log("==========================================");
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(
        `Health check: http://localhost:${PORT}/api/health`
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
    console.error("Server startup failed:");
    console.error(error.message);
    console.error("==========================================");

    process.exit(1);
  }
};

startServer();