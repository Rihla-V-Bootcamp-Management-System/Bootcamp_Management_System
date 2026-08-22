const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// ==========================================
// OLD ROUTES - TEMPORARILY DISABLED
// ==========================================

// const registrationRoutes = require("./routes/registrationRoutes");
// const formQuestionRoutes = require("./routes/formQuestionRoutes");
// const registrationSettingsRoutes = require("./routes/registrationSettingsRoutes");
// const attendanceRoutes = require("./routes/attendanceRoutes");
// const progressRoutes = require("./routes/progressRoutes");
// const applicationFormRoutes = require("./routes/ApplicationFormRoutes");
// const studentDirectoryRoutes = require("./routes/studentDirectoryRoutes");
// const gradingRoutes = require("./routes/gradingRoutes");

// ==========================================
// ACTIVE ROUTES
// ==========================================

const mentorRoutes = require("./routes/mentorRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const batchRoutes = require("./routes/batchRoutes");

const assignmentRoutes = require("./routes/AssignmentRoutes");
const submissionRoutes = require("./routes/SubmissionRoutes");

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

// ==========================================
// TEST / HEALTH ROUTES
// ==========================================

// OLD APPLICATION FORM TEST ROUTE - TEMPORARILY DISABLED

// app.get("/api/test-application-form", (req, res) => {
//   res.json({
//     message: "APPLICATION FORM ROUTE IS WORKING",
//   });
// });

app.get("/", (req, res) => {
  res.json({
    message: "Bootcamp Management System API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
  });
});

// ==========================================
// ACTIVE API ROUTES
// ==========================================

app.use("/api/seasons", seasonRoutes);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/mentor", mentorRoutes);

app.use("/api/assignments", assignmentRoutes);

app.use("/api/submissions", submissionRoutes);

app.use("/api/batches", batchRoutes);

app.use("/api/super-admin", superAdminRoutes);

// ==========================================
// OLD API ROUTES - TEMPORARILY DISABLED
// ==========================================

// app.use("/api/registrations", registrationRoutes);

// app.use("/api/form-questions", formQuestionRoutes);

// app.use(
//   "/api/registration-settings",
//   registrationSettingsRoutes
// );

// app.use("/api/attendance", attendanceRoutes);

// app.use("/api/progress", progressRoutes);

// app.use(
//   "/api/application-forms",
//   applicationFormRoutes
// );

// app.use(
//   "/api/student-directory",
//   studentDirectoryRoutes
// );

// app.use("/api/grading", gradingRoutes);

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();