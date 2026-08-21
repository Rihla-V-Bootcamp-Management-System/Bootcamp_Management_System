import { Routes, Route } from "react-router-dom";

import FirstLogin from "../pages/FirstLogin";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SetPassword from "../pages/SetPassword";
import PublicApplication from "../pages/PublicApplication";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Applications from "../pages/admin/Applications";
import Batches from "../pages/admin/Batches";
import Registration from "../pages/admin/Registration";
import BatchDetails from "../pages/admin/BatchDetails";

import MentorDashboard from "../pages/MentorDashboard";
import StudentDashboard from "../pages/StudentDashboard";

function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/set-password"
        element={<SetPassword />}
      />

      <Route
        path="/first-login"
        element={<FirstLogin />}
      />

      <Route
        path="/apply"
        element={<PublicApplication />}
      />


      {/* ================= ADMIN ROUTES ================= */}

      <Route element={<DashboardLayout />}>

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<Users />}
        />

        <Route
          path="/admin/applications"
          element={<Applications />}
        />

        <Route
          path="/admin/batches"
          element={<Batches />}
        />

        <Route
          path="/admin/batches/:id"
          element={<BatchDetails />}
        />

        <Route
          path="/admin/registrations"
          element={<Registration />}
        />

        <Route
          path="/admin/announcements"
          element={
            <div>Announcements Page</div>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <div>Analytics Page</div>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <div>Settings Page</div>
          }
        />

      </Route>


      {/* ================= MENTOR ROUTES ================= */}

      <Route path="/mentor">
        <Route
          index
          element={<MentorDashboard />}
        />

        <Route
          path="students"
          element={<div>My Students Page</div>}
        />

        <Route
          path="attendance"
          element={<div>Attendance Page</div>}
        />

        <Route
          path="progress"
          element={<div>Progress Page</div>}
        />

        <Route
          path="assignments"
          element={<div>Assignments Page</div>}
        />

        <Route
          path="submissions"
          element={<div>Submissions Page</div>}
        />

        <Route
          path="announcements"
          element={<div>Announcements Page</div>}
        />
      </Route>


      {/* ================= STUDENT ROUTES ================= */}

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["student"]}>
              <DashboardLayout role="student" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

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