import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SetPassword from "../pages/SetPassword";
import FirstLogin from "../pages/FirstLogin";
import PublicApplication from "../pages/PublicApplication";
import Analytics from "../pages/admin/Analytics";
// =========================================================
// MENTOR PAGES
// =========================================================

import MentorDashboard from "../pages/MentorDashboard";
import MentorStudents from "../pages/MentorStudents";
import MentorAttendance from "../pages/MentorAttendance";
import MentorProgress from "../pages/MentorProgress";
import MentorAssignments from "../pages/MentorAssignments";
import MentorSubmissions from "../pages/MentorSubmission";
import MyStudents from "../pages/MyStudents";
// =========================================================
// STUDENT PAGES
// =========================================================

import StudentDashboard from "../pages/StudentDashboard";
import StudentAttendance from "../pages/StudentAttendance";
import StudentProgress from "../pages/StudentProgress";
import StudentWebProgress from "../pages/StudentWebProgress";
import StudentCPProgress from "../pages/StudentCpProgress";
import MyMentor from "../pages/MyMentor";

// =========================================================
// ADMIN PAGES
// =========================================================
import Modules from "../pages/admin/modules/Modules";
import ModuleResources from "../pages/admin/modules/ModuleResources";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Applications from "../pages/admin/Applications";
import Batches from "../pages/admin/Batches";
import Registration from "../pages/admin/Registration";
import BatchDetails from "../pages/admin/BatchDetails";
import Attendance from "../pages/admin/Attendance";
import MentorAssignment from "../pages/admin/MentorAssignment";
import DailyTasks from "../pages/admin/DailyTasks";
// =========================================================
// ASSIGNMENT PAGES
// =========================================================
import StudentDailyTasks from "../pages/StudentDailyTasks";
import StudentSubmission from "../pages/StudentAssignments";
import StudentAssignments from "../pages/StudentAssignments";
import StudentAssignmentDetails from "../pages/StudentAssignmentDetails";
import AdminAssignments from "../pages/AdminAssignments";

// =========================================================
// SUPER ADMIN
// =========================================================
import BatchLayout from "../layouts/BatchLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "../pages/superadmin/SuperAdminUsers";
import SuperAdminRegistrations from "../pages/superadmin/SuperAdminRegistrations";
import SuperAdminAuditLogs from "../pages/superadmin/SuperAdminAuditLogs";
import SuperAdminSettings from "../pages/superadmin/SuperAdminSettings";
import RegisterMentor from "../pages/admin/RegisterMentor";
import Levels from "../pages/admin/levels/Levels";

function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

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

      {/* =====================================================
          ADMIN ROUTES
      ===================================================== */}

     <Route
  path="/admin"
  element={<DashboardLayout role="admin" />}
>
  <Route
    index
    element={<AdminDashboard />}
  />

  <Route
    path="users"
    element={<Users />}
  />
  <Route
  path="register-mentor"
  element={<RegisterMentor />}
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

  {/* =====================================================
      SHARED BATCH NAVIGATION
  ===================================================== */}

  <Route element={<BatchLayout />}>

    {/* OVERVIEW */}

    <Route
      path="batches/:id"
      element={<BatchDetails />}
    />

    {/* MODULES */}

    <Route
      path="modules"
      element={<Modules />}
    />

    {/* LEVELS */}

    <Route
      path="levels"
      element={<Levels />}
    />

    {/* DAILY TASKS */}

    <Route
      path="daily-tasks"
      element={<DailyTasks />}
    />

  </Route>

  <Route
    path="registrations"
    element={<Registration />}
  />

  <Route
    path="mentor-assignment"
    element={<MentorAssignment />}
  />

  <Route
    path="assignments"
    element={<AdminAssignments />}
  />

  <Route
    path="announcements"
    element={<div>Announcements Page</div>}
  />

 <Route
  path="analytics"
  element={<Analytics />}
/>

  <Route
    path="settings"
    element={<div>Settings Page</div>}
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
          element={<MyStudents/>}
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
          path="my-mentor"
          element={<MyMentor />}
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

        <Route
          path="announcements"
          element={<div>Student Announcements</div>}
        />
        <Route
        path="daily-tasks"
        element={<StudentDailyTasks />}
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