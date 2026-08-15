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

function AppRoutes() {
  return (
    <Routes>

      {/* Public pages */}
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
          element={<div>Attendance Page</div>}
        />

        <Route
          path="/student/progress"
          element={<div>Progress Page</div>}
        />

        <Route
          path="/student/assignments"
          element={<div>Assignments Page</div>}
        />

        <Route
          path="/student/grades"
          element={<div>Grades Page</div>}
        />

        <Route
          path="/student/announcements"
          element={<div>Announcements Page</div>}
        />

        <Route
          path="/student/profile"
          element={<div>Profile Page</div>}
        />
      </Route>

    </Routes>
  );
}

export default AppRoutes;