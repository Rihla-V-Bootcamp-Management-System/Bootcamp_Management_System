const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const formQuestionRoutes = require("./routes/formQuestionRoutes");
const registrationSettingsRoutes = require("./routes/registrationSettingsRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const progressRoutes = require("./routes/progressRoutes");
const applicationFormRoutes = require("./routes/ApplicationFormRoutes");

dotenv.config();
const studentDirectoryRoutes = require("./routes/studentDirectoryRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const gradingRoutes = require("./routes/gradingRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

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

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/form-questions", formQuestionRoutes);
app.use("/api/registration-settings", registrationSettingsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/application-forms", applicationFormRoutes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
app.use("/api/students", studentDirectoryRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/grading", gradingRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/superadmin", superAdminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Bootcamp Management System API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
