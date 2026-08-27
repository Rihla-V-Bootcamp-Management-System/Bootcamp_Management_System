const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const applicationFormRoutes = require("./routes/ApplicationFormRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const registrationSettingsRoutes = require("./routes/registrationSettingsRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const batchRoutes = require("./routes/batchRoutes");
const attendanceRoutes = require("./routes/AttendanceRoutes");
const progressRoutes = require("./routes/progressRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/SubmissionRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const formQuestionRoutes = require("./routes/formQuestionRoutes");
const faqRoutes = require("./routes/faqRoutes");
const aboutRoutes = require("./routes/aboutRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/application-forms", applicationFormRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/registration-settings", registrationSettingsRoutes);
app.use("/api/email-templates", emailTemplateRoutes);
app.use("/api/form-questions", formQuestionRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/about", aboutRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("==========================================");
      console.log("Bootcamp Management System Backend");
      console.log("==========================================");
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `Application Forms: http://localhost:${PORT}/api/application-forms`
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
        `Form Questions API: http://localhost:${PORT}/api/form-questions`
      );
      console.log(
        `FAQ API: http://localhost:${PORT}/api/faqs`
      );
      console.log(
        `About API: http://localhost:${PORT}/api/about`
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