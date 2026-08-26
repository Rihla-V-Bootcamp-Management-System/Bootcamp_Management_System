import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SetPassword from "../pages/SetPassword";
import FirstLogin from "../pages/FirstLogin";
import PublicApplication from "../pages/PublicApplication";

// =========================================================
// MENTOR PAGES
// =========================================================

import MentorDashboard from "../pages/MentorDashboard";
import MentorStudents from "../pages/MentorStudents";
import MentorAttendance from "../pages/MentorAttendance";
import MentorProgress from "../pages/MentorProgress";
import MentorAssignments from "../pages/MentorAssignments";
import MentorSubmissions from "../pages/MentorSubmission";

// =========================================================
// STUDENT PAGES
// =========================================================

import StudentDashboard from "../pages/StudentDashboard";
import StudentAttendance from "../pages/StudentAttendance";
import StudentProgress from "../pages/StudentProgress";
import StudentWebProgress from "../pages/StudentWebProgress";
import StudentCPProgress from "../pages/StudentCpProgress";

// =========================================================
// SHARED PAGES
// =========================================================

import Announcements from "../pages/Announcements";

// =========================================================
// ADMIN PAGES
// =========================================================

import CreateAnnouncement from "../pages/admin/CreateAnnouncement";
import CreateSpecialAnnouncement from "../pages/admin/CreateSpecialAnnouncement";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Applications from "../pages/admin/Applications";
import Batches from "../pages/admin/Batches";
import Registration from "../pages/admin/Registration";
import BatchDetails from "../pages/admin/BatchDetails";
import Attendance from "../pages/admin/Attendance";
import AdminAnnouncements from "../pages/admin/AdminAnnouncements";

// =========================================================
// ASSIGNMENT PAGES
// =========================================================

import StudentSubmission from "../pages/StudentAssignments";
import StudentAssignments from "../pages/StudentAssignments";
import StudentAssignmentDetails from "../pages/StudentAssignmentDetails";
import AdminAssignments from "../pages/AdminAssignments";

// =========================================================
// SUPER ADMIN
// =========================================================

import SuperAdminLayout from "../layouts/SuperAdminLayout";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "../pages/superadmin/SuperAdminUsers";
import SuperAdminRegistrations from "../pages/superadmin/SuperAdminRegistrations";
import SuperAdminAuditLogs from "../pages/superadmin/SuperAdminAuditLogs";
import SuperAdminSettings from "../pages/superadmin/SuperAdminSettings";
import SuperAdminBatches from "../pages/superadmin/SuperAdminBatches";
import SuperAdminBatchDetails from "../pages/superadmin/SuperAdminBatchDetails";

// =========================================================
// APP ROUTES
// =========================================================

function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/set-password" element={<SetPassword />} />

      <Route path="/first-login" element={<FirstLogin />} />

      <Route path="/apply" element={<PublicApplication />} />

      {/* =====================================================
          ADMIN ROUTES
      ===================================================== */}

      <Route path="/admin" element={<AdminLayout />}>

        <Route index element={<AdminDashboard />} />

        <Route
          path="users"
          element={<Users />}
        />

        <Route
          path="applications"
          element={<Applications />}
        />

        <Route
          path="attendance"
          element={<Attendance />}
        />

        <Route
          path="batches"
          element={<Batches />}
        />

        <Route
          path="batches/:id"
          element={<BatchDetails />}
        />

        <Route
          path="registrations"
          element={<Registration />}
        />

        {/* =================================================
            ANNOUNCEMENTS
        ================================================= */}

        <Route
          path="announcements"
          element={<AdminAnnouncements />}
        />

        <Route
          path="announcements/create"
          element={<CreateAnnouncement />}
        />

        <Route
          path="announcements/create-special-event"
          element={<CreateSpecialAnnouncement />}
        />

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <Route
          path="analytics"
          element={<div>Analytics Page</div>}
        />

        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="settings"
          element={<div>Settings Page</div>}
        />

        {/* =================================================
            ASSIGNMENTS
        ================================================= */}

        <Route
          path="assignments"
          element={<AdminAssignments />}
        />

      </Route>

      {/* =====================================================
          MENTOR ROUTES
      ===================================================== */}

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

        {/* ANNOUNCEMENTS */}
        <Route
          path="announcements"
          element={<Announcements />}
        />

      </Route>

      {/* =====================================================
          STUDENT ROUTES
      ===================================================== */}

      <Route
        path="/student"
        element={<DashboardLayout role="student" />}
      >

        <Route
          index
          element={<StudentDashboard />}
        />

        <Route
          path="attendance"
          element={<StudentAttendance />}
        />

        <Route
          path="progress"
          element={<StudentProgress />}
        />

        <Route
          path="progress/web"
          element={<StudentWebProgress />}
        />

        <Route
          path="progress/cp"
          element={<StudentCPProgress />}
        />

        <Route
          path="assignments"
          element={<StudentAssignments />}
        />

        <Route
          path="assignments/:id"
          element={<StudentAssignmentDetails />}
        />

        <Route
          path="grades"
          element={<div>Student Grades</div>}
        />

        <Route
          path="submissions"
          element={<StudentSubmission />}
        />

        {/* ANNOUNCEMENTS */}
        <Route
          path="announcements"
          element={<Announcements />}
        />

        <Route
          path="profile"
          element={<div>Student Profile</div>}
        />

      </Route>

      {/* =====================================================
          SUPER ADMIN ROUTES
      ===================================================== */}

      <Route
        path="/superadmin"
        element={<SuperAdminLayout />}
      >

        <Route
          index
          element={<SuperAdminDashboard />}
        />

        <Route
          path="users"
          element={<SuperAdminUsers />}
        />

        <Route
          path="batches"
          element={<SuperAdminBatches />}
        />

        <Route
          path="batches/:id"
          element={<SuperAdminBatchDetails />}
        />

        <Route
          path="batches/:id/dashboard"
          element={<SuperAdminBatchDetails />}
        />

        <Route
          path="registrations"
          element={<SuperAdminRegistrations />}
        />

        <Route
          path="audit-logs"
          element={<SuperAdminAuditLogs />}
        />

        <Route
          path="settings"
          element={<SuperAdminSettings />}
        />

      </Route>

    </Routes>
  );
}

export default AppRoutes;
