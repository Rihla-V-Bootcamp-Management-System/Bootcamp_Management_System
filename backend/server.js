const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const progressRoutes = require("./routes/progressRoutes");
const applicationFormRoutes = require("./routes/ApplicationFormRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/application-forms", applicationFormRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });