import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import AdminDashboard from "../pages/AdminDashboard";
import MentorDashboard from "../pages/MentorDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import PublicApplication from "../pages/PublicApplication";
import StudentAttendance from "../pages/StudentAttendance";
import StudentProgress from "../pages/StudentProgress";
import StudentGrades from "../pages/StudentGrades";
import StudentAnnouncements from "../pages/StudentAnnouncements";
import StudentProfile from "../pages/StudentProfile";

function AppRoutes() {
  return (
    <Routes>

      <Route path="/apply" element={<PublicApplication />} />
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />


      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />

        <Route
          path="/admin/users"
          element={<div>Users Page</div>}
        />

        <Route
          path="/admin/batches"
          element={<div>Batches Page</div>}
        />

        <Route
          path="/admin/announcements"
          element={<div>Announcements Page</div>}
        />

        <Route
          path="/admin/analytics"
          element={<div>Analytics Page</div>}
        />

        <Route
          path="/admin/settings"
          element={<div>Settings Page</div>}
        />
      </Route>


     

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["mentor"]}>
              <DashboardLayout role="mentor" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/mentor" element={<MentorDashboard />} />

        <Route
          path="/mentor/students"
          element={<div>My Students Page</div>}
        />

        <Route
          path="/mentor/attendance"
          element={<div>Attendance Page</div>}
        />

        <Route
          path="/mentor/progress"
          element={<div>Progress Page</div>}
        />

        <Route
          path="/mentor/assignments"
          element={<div>Assignments Page</div>}
        />

        <Route
          path="/mentor/submissions"
          element={<div>Submissions Page</div>}
        />

        <Route
          path="/mentor/announcements"
          element={<div>Announcements Page</div>}
        />
      </Route>


     {/* TEMPORARY: Attendance UI testing */}
<Route
  path="/test-student-attendance"
  element={<StudentAttendance />}
/>
     <Route
  path="/test-progress"
  element={<StudentProgress />}
/>
<Route
  path="/test-dashboard"
  element={<StudentDashboard />}
/>
<Route
  path="/test-grades"
  element={<StudentGrades />}
/>
<Route
  path="/test-announcements"
  element={<StudentAnnouncements />}
/>
<Route
  path="/test-profile"
  element={<StudentProfile />}
/>
     <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["student"]}>
              <DashboardLayout role="student" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/student" element={<StudentDashboard />} />

        <Route
          path="/student/attendance"
          element={<StudentAttendance />}
        />

        <Route
          path="/student/progress"
          element={<StudentProgress />}
        />

        <Route
          path="/student/assignments"
          element={<div>Assignments Page</div>}
        />

        <Route
          path="/student/grades"
          element={<StudentGrades />}
        />

        <Route
          path="/student/announcements"
          element={<StudentAnnouncements />}
        />

        <Route
          path="/student/profile"
          element={<StudentProfile />}
        />
      </Route>

    </Routes>
  );
}

export default AppRoutes;