import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

// ==========================================
// MENTOR PAGES
// ==========================================

import MentorDashboard from "../pages/MentorDashboard";
import MentorStudents from "../pages/MentorStudents";
import MentorAttendance from "../pages/MentorAttendance";
import MentorProgress from "../pages/MentorProgress";
import MentorAssignments from "../pages/MentorAssignments";
import MentorSubmissions from "../pages/MentorSubmission";

// ==========================================
// STUDENT PAGES
// ==========================================

import StudentAttendance from "../pages/StudentAttendance";

function AppRoutes() {
  return (
    <Routes>

      {/* ====================================== */}
      {/* MENTOR */}
      {/* ====================================== */}

      <Route
        path="/mentor"
        element={<DashboardLayout role="mentor" />}
      >

        <Route
          index
          element={<MentorDashboard />}
        />

        <Route
          path="students"
          element={<MentorStudents />}
        />

        <Route
          path="attendance"
          element={<MentorAttendance />}
        />

        <Route
          path="progress"
          element={<MentorProgress />}
        />

        <Route
          path="assignments"
          element={<MentorAssignments />}
        />

        <Route
          path="submissions"
          element={<MentorSubmissions />}
        />

        <Route
          path="announcements"
          element={<div>Announcements</div>}
        />

      </Route>


      {/* ====================================== */}
      {/* STUDENT */}
      {/* ====================================== */}

      <Route
        path="/student"
        element={<DashboardLayout role="student" />}
      >

        {/* /student */}

        <Route
          index
          element={<div>Student Dashboard</div>}
        />

        {/* /student/attendance */}

        <Route
          path="attendance"
          element={<StudentAttendance />}
        />

        {/* /student/progress */}

        <Route
          path="progress"
          element={<div>Student Progress</div>}
        />

        {/* /student/assignments */}

        <Route
          path="assignments"
          element={<div>Student Assignments</div>}
        />

        {/* /student/grades */}

        <Route
          path="grades"
          element={<div>Student Grades</div>}
        />

        {/* /student/announcements */}

        <Route
          path="announcements"
          element={<div>Student Announcements</div>}
        />

        {/* /student/profile */}

        <Route
          path="profile"
          element={<div>Student Profile</div>}
        />

      </Route>

    </Routes>
  );
}

export default AppRoutes;