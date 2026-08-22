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
// REGISTRATION ROUTES
// TEMPORARILY DISABLED
// Registration routes currently depend on
// RegistrationSettings model which is missing.
// ==========================================

// const registrationRoutes = require("./routes/registrationRoutes");
// const formQuestionRoutes = require("./routes/formQuestionRoutes");
// const registrationSettingsRoutes = require("./routes/registrationSettingsRoutes");

// ==========================================
// MAIN SYSTEM ROUTES
// ==========================================

const mentorRoutes = require("./routes/mentorRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const batchRoutes = require("./routes/batchRoutes");

// ==========================================
// ASSIGNMENT & SUBMISSION ROUTES
// ==========================================

const assignmentRoutes = require("./routes/AssignmentRoutes");
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

// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(express.json());

// ==========================================
// TEST / HEALTH ROUTES
// ==========================================

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
// API ROUTES
// ==========================================

// Users & authentication
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Seasons
app.use("/api/seasons", seasonRoutes);

// Mentor
app.use("/api/mentor", mentorRoutes);

// Batches
app.use("/api/batches", batchRoutes);

// Assignments
app.use("/api/assignments", assignmentRoutes);

// Submissions
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