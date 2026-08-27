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

// Users & Authentication
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// Application Forms
const applicationFormRoutes = require("./routes/ApplicationFormRoutes");
const courseRoutes = require("./routes/courseRoutes");

// Registration
const registrationRoutes = require("./routes/registrationRoutes");
const registrationSettingsRoutes = require("./routes/registrationSettingsRoutes");

// Email Templates & Form Questions
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");
const formQuestionRoutes = require("./routes/formQuestionRoutes");

// Main System
const mentorRoutes = require("./routes/mentorRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const batchRoutes = require("./routes/batchRoutes");

// Attendance & Progress
const attendanceRoutes = require("./routes/AttendanceRoutes");
const progressRoutes = require("./routes/progressRoutes");

// Assignment & Submission
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/SubmissionRoutes");

// Announcements & Notifications
const announcementRoutes = require("./routes/AnnouncementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Super Admin
const superAdminRoutes = require("./routes/superAdminRoutes");

// FAQ & About
const faqRoutes = require("./routes/faqRoutes");
const aboutRoutes = require("./routes/aboutRoutes");

// =========================================================
// APP CONFIG
// =========================================================

const app = express();

const PORT = process.env.PORT || 5000;

// =========================================================
// MIDDLEWARE
// =========================================================

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

// =========================================================
// BASIC / HEALTH ROUTES
// =========================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Bootcamp Management System API is running",
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

// ---------------------------------------------------------
// Users
// ---------------------------------------------------------

app.use("/api/users", userRoutes);

// ---------------------------------------------------------
// Authentication
// ---------------------------------------------------------

app.use("/api/auth", authRoutes);

// ---------------------------------------------------------
// Courses
// ---------------------------------------------------------

app.use("/api/courses", courseRoutes);

// ---------------------------------------------------------
// Application Forms
// ---------------------------------------------------------

app.use(
  "/api/application-forms",
  applicationFormRoutes
);

// ---------------------------------------------------------
// Seasons
// ---------------------------------------------------------

app.use("/api/seasons", seasonRoutes);

// ---------------------------------------------------------
// Mentors
// ---------------------------------------------------------

app.use("/api/mentor", mentorRoutes);

// ---------------------------------------------------------
// Batches
// ---------------------------------------------------------

app.use("/api/batches", batchRoutes);

// ---------------------------------------------------------
// Attendance
// ---------------------------------------------------------

app.use("/api/attendance", attendanceRoutes);

// ---------------------------------------------------------
// Progress
// ---------------------------------------------------------

app.use("/api/progress", progressRoutes);

// ---------------------------------------------------------
// Assignments
// ---------------------------------------------------------

app.use(
  "/api/assignments",
  assignmentRoutes
);

// ---------------------------------------------------------
// Submissions
// ---------------------------------------------------------

app.use(
  "/api/submissions",
  submissionRoutes
);

// ---------------------------------------------------------
// Announcements
// ---------------------------------------------------------

app.use(
  "/api/announcements",
  announcementRoutes
);

// ---------------------------------------------------------
// Notifications
// ---------------------------------------------------------

app.use(
  "/api/notifications",
  notificationRoutes
);

// ---------------------------------------------------------
// Registrations
// ---------------------------------------------------------

app.use(
  "/api/registrations",
  registrationRoutes
);

// ---------------------------------------------------------
// Registration Settings
// ---------------------------------------------------------

app.use(
  "/api/registration-settings",
  registrationSettingsRoutes
);

// ---------------------------------------------------------
// Email Templates
// ---------------------------------------------------------

app.use(
  "/api/email-templates",
  emailTemplateRoutes
);

// ---------------------------------------------------------
// Form Questions
// ---------------------------------------------------------

app.use(
  "/api/form-questions",
  formQuestionRoutes
);

// ---------------------------------------------------------
// Super Admin
// ---------------------------------------------------------

app.use(
  "/api/superadmin",
  superAdminRoutes
);

// ---------------------------------------------------------
// FAQ
// ---------------------------------------------------------

app.use("/api/faqs", faqRoutes);

// ---------------------------------------------------------
// About
// ---------------------------------------------------------

app.use("/api/about", aboutRoutes);

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
// GLOBAL ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message || "Internal server error",
  });
});

// =========================================================
// START SERVER
// =========================================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        "=========================================="
      );

      console.log(
        "Bootcamp Management System Backend"
      );

      console.log(
        "=========================================="
      );

      console.log(
        `Server running on http://localhost:${PORT}`
      );

      console.log(
        `Health check: http://localhost:${PORT}/api/health`
      );

      console.log(
        `Application Forms: http://localhost:${PORT}/api/application-forms`
      );

      console.log(
        `Courses: http://localhost:${PORT}/api/courses`
      );

      console.log(
        `Registration API: http://localhost:${PORT}/api/registrations`
      );

      console.log(
        `Registration Settings: http://localhost:${PORT}/api/registration-settings`
      );

      console.log(
        `Email Templates: http://localhost:${PORT}/api/email-templates`
      );

      console.log(
        `Form Questions API: http://localhost:${PORT}/api/form-questions`
      );

      console.log(
        `Attendance API: http://localhost:${PORT}/api/attendance`
      );

      console.log(
        `Progress API: http://localhost:${PORT}/api/progress`
      );

      console.log(
        `Assignments API: http://localhost:${PORT}/api/assignments`
      );

      console.log(
        `Submissions API: http://localhost:${PORT}/api/submissions`
      );

      console.log(
        `Announcements API: http://localhost:${PORT}/api/announcements`
      );

      console.log(
        `Notifications API: http://localhost:${PORT}/api/notifications`
      );

      console.log(
        `FAQ API: http://localhost:${PORT}/api/faqs`
      );

      console.log(
        `About API: http://localhost:${PORT}/api/about`
      );

      console.log(
        `Super Admin API: http://localhost:${PORT}/api/superadmin`
      );

      console.log(
        "=========================================="
      );
    });
  } catch (error) {
    console.error(
      "=========================================="
    );

    console.error("Server startup failed:");

    console.error(error.message);

    console.error(
      "=========================================="
    );

    process.exit(1);
  }
};

startServer();