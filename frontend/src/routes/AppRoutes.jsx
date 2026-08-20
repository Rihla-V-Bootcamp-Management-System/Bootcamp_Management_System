import { Routes, Route } from "react-router-dom";

// Public pages
import FirstLogin from "../pages/FirstLogin";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SetPassword from "../pages/SetPassword";
import PublicApplication from "../pages/PublicApplication";

// Authentication
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout";

// Admin
import AdminDashboard from "../pages/AdminDashboard";
import Users from "../pages/admin/Users";
import Applications from "../pages/admin/Applications";
import Batches from "../pages/admin/Batches";
import Registration from "../pages/admin/Registration";
import BatchDetails from "../pages/admin/BatchDetails";

// Mentor
import MentorDashboard from "../pages/MentorDashboard";
import MentorAttendance from "../pages/MentorAttendance";
import MentorProgress from "../pages/MentorProgress"
import MentorStudents from "../pages/MentorStudents";
import MentorAssignments from "../pages/MentorAssignments";
import MentorSubmissions from "../pages/MentorSubmission";
// Student
import StudentDashboard from "../pages/StudentDashboard";



function AppRoutes() {
  return (
    <Routes>

      {/* ========================= */}
      {/* PUBLIC ROUTES */}
      {/* ========================= */}

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


      {/* ========================= */}
      {/* ADMIN ROUTES */}
      {/* ========================= */}

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin" />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
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

     {/* ========================= */}
{/* MENTOR ROUTES */}
{/* ========================= */}

{/* <Route
  element={
    <ProtectedRoute>
      <RoleRoute allowedRoles={["mentor"]}>
        <DashboardLayout role="mentor" />
      </RoleRoute>
    </ProtectedRoute>
  }
> */}

<Route element={<DashboardLayout role="mentor" />}>
  <Route
    path="/mentor"
    element={<MentorDashboard />}
  />

  <Route
    path="/mentor"
    element={<MentorDashboard />}
  />

  <Route
    path="/mentor/students"
    element={<MentorStudents/>}
  />

  <Route
    path="/mentor/attendance"
    element={<MentorAttendance />}
  />

  <Route
    path="/mentor/progress"
    element={<MentorProgress/>}
  />

  <Route
    path="/mentor/assignments"
    element={<MentorAssignments/>}
  />

  <Route
    path="/mentor/submissions"
    element={<MentorSubmissions/>}
  />

  <Route
    path="/mentor/announcements"
    element={<div>Announcements Page</div>}
  />
</Route>

      
      {/* ========================= */}
      {/* STUDENT ROUTES */}
      {/* ========================= */}

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