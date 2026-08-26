import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";

// ============================================================
// PUBLIC
// ============================================================

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SetPassword from "../pages/SetPassword";
import FirstLogin from "../pages/FirstLogin";
import PublicApplication from "../pages/PublicApplication";

// ============================================================
// MENTOR
// ============================================================

import MentorDashboard from "../pages/MentorDashboard";
import MentorStudents from "../pages/MentorStudents";
import MentorAttendance from "../pages/MentorAttendance";
import MentorProgress from "../pages/MentorProgress";
import MentorAssignments from "../pages/MentorAssignments";

import MentorCourseAssignments from "../pages/mentor/MentorCourseAssignments";
import MentorAssignmentDetails from "../pages/mentor/MentorAssignmentDetails";
import MentorTopicDetails from "../pages/mentor/MentorTopicDetails";
import MentorSubmission from "../pages/mentor/MentorSubmission";
import MentorAssignmentSubmissions from "../pages/MentorAssignmentSubmissions";
import MentorSubmissionReview from "../pages/MentorSubmissionReview";
import MentorAnnouncements from "../pages/MentorAnnouncements";

// ============================================================
// STUDENT
// ============================================================

import StudentDashboard from "../pages/StudentDashboard";
import StudentAttendance from "../pages/StudentAttendance";
import StudentProgress from "../pages/StudentProgress";
import StudentWebProgress from "../pages/StudentWebProgress";
import StudentCPProgress from "../pages/StudentCpProgress";

import StudentAssignments from "../pages/StudentAssignments";
import StudentCourseAssignments from "../pages/StudentCourseAssignments";
import StudentAssignmentDetails from "../pages/StudentAssignmentDetails";
import StudentSubmission from "../pages/StudentSubmission";
import StudentSubmissions from "../pages/StudentSubmissions";
import StudentGrades from "../pages/StudentGrades";
import StudentAnnouncements from "../pages/StudentAnnouncements";
import AnnouncementNotification from "../pages/AnnouncementNotification";

// ============================================================
// SHARED
// ============================================================

import Announcements from "../pages/Announcements";

// ============================================================
// ADMIN
// ============================================================

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Applications from "../pages/admin/Applications";
import Batches from "../pages/admin/Batches";
import Registration from "../pages/admin/Registration";
import BatchDetails from "../pages/admin/BatchDetails";
import Attendance from "../pages/admin/Attendance";
import AdminAssignments from "../pages/admin/AdminAssignments";
import AdminAnnouncements from "../pages/admin/AdminAnnouncements";
import CreateAnnouncement from "../pages/admin/CreateAnnouncement";
import CreateSpecialAnnouncement from "../pages/admin/CreateSpecialAnnouncement";

// ============================================================
// SUPER ADMIN
// ============================================================

import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "../pages/superadmin/SuperAdminUsers";
import SuperAdminRegistrations from "../pages/superadmin/SuperAdminRegistrations";
import SuperAdminAuditLogs from "../pages/superadmin/SuperAdminAuditLogs";
import SuperAdminSettings from "../pages/superadmin/SuperAdminSettings";
import SuperAdminBatches from "../pages/superadmin/SuperAdminBatches";
import SuperAdminBatchDetails from "../pages/superadmin/SuperAdminBatchDetails";

// ============================================================
// APP ROUTES
// ============================================================

function AppRoutes() {
  return (
    <Routes>

      {/* ======================================================
          PUBLIC
      ====================================================== */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/set-password" element={<SetPassword />} />

      <Route path="/first-login" element={<FirstLogin />} />

      <Route path="/apply" element={<PublicApplication />} />

      {/* ======================================================
          ADMIN
      ====================================================== */}

      <Route
        path="/admin"
        element={<AdminLayout />}
      >
        <Route
          index
          element={<AdminDashboard />}
        />

        {/* Users */}
        <Route
          path="users"
          element={<Users />}
        />

        {/* Applications */}
        <Route
          path="applications"
          element={<Applications />}
        />

        {/* Attendance */}
        <Route
          path="attendance"
          element={<Attendance />}
        />

        {/* Batches */}
        <Route
          path="batches"
          element={<Batches />}
        />

        {/* Batch Details */}
        <Route
          path="batches/:id"
          element={<BatchDetails />}
        />

        {/* Registration */}
        <Route
          path="registrations"
          element={<Registration />}
        />

        {/* Assignments */}
        <Route
          path="assignments"
          element={<AdminAssignments />}
        />

        {/* Announcements */}
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

        {/* Analytics */}
        <Route
          path="analytics"
          element={<div>Analytics Page</div>}
        />

        {/* Settings */}
        <Route
          path="settings"
          element={<div>Settings Page</div>}
        />
      </Route>

      {/* ======================================================
          MENTOR
      ====================================================== */}

      <Route
        path="/mentor"
        element={<DashboardLayout role="mentor" />}
      >
        {/* Dashboard */}
        <Route
          index
          element={<MentorDashboard />}
        />

        {/* Students */}
        <Route
          path="students"
          element={<MentorStudents />}
        />

        {/* Attendance */}
        <Route
          path="attendance"
          element={<MentorAttendance />}
        />

        {/* Progress */}
        <Route
          path="progress"
          element={<MentorProgress />}
        />

        {/* ====================================================
            ASSIGNMENTS
        ==================================================== */}

        <Route
          path="assignments"
          element={<MentorAssignments />}
        />

        <Route
          path="assignments/course/:courseName"
          element={<MentorCourseAssignments />}
        />

        <Route
          path="assignments/:assignmentId"
          element={<MentorAssignmentDetails />}
        />

        <Route
          path="assignments/:assignmentId/topics/:topicId"
          element={<MentorTopicDetails />}
        />

        <Route
          path="assignments/:assignmentId/submissions"
          element={<MentorAssignmentSubmissions />}
        />

        {/* ====================================================
            SUBMISSIONS
        ==================================================== */}

        <Route
          path="submissions"
          element={<MentorSubmission />}
        />

        <Route
          path="submissions/:submissionId"
          element={<MentorSubmissionReview />}
        />

        {/* ====================================================
            ANNOUNCEMENTS
        ==================================================== */}

        <Route
          path="announcements"
          element={<MentorAnnouncements />}
        />

        {/* ====================================================
            PROFILE
        ==================================================== */}

        <Route
          path="profile"
          element={
            <div className="min-h-full bg-slate-50 p-6">
              <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-bold text-slate-900">
                  Mentor Profile
                </h1>
              </div>
            </div>
          }
        />
      </Route>

      {/* ======================================================
          STUDENT
      ====================================================== */}

      <Route
        path="/student"
        element={<DashboardLayout role="student" />}
      >
        {/* Dashboard */}
        <Route
          index
          element={<StudentDashboard />}
        />

        {/* Attendance */}
        <Route
          path="attendance"
          element={<StudentAttendance />}
        />

        {/* Progress */}
        <Route
          path="progress"
          element={<StudentProgress />}
        />

        {/* Web Development Progress */}
        <Route
          path="progress/web"
          element={<StudentWebProgress />}
        />

        {/* Competitive Programming Progress */}
        <Route
          path="progress/cp"
          element={<StudentCPProgress />}
        />

        {/* ====================================================
            ASSIGNMENTS
        ==================================================== */}

        <Route
          path="assignments"
          element={<StudentAssignments />}
        />

        <Route
          path="assignments/course/:courseName"
          element={<StudentCourseAssignments />}
        />

        <Route
          path="assignments/:assignmentId"
          element={<StudentAssignmentDetails />}
        />

        <Route
          path="assignments/:assignmentId/submit"
          element={<StudentSubmission />}
        />

        {/* ====================================================
            SUBMISSIONS
        ==================================================== */}

        <Route
          path="submissions"
          element={<StudentSubmissions />}
        />

        {/* ====================================================
            GRADES
        ==================================================== */}

        <Route
          path="grades"
          element={<StudentGrades />}
        />

        {/* ====================================================
            ANNOUNCEMENTS
        ==================================================== */}

        <Route
          path="announcements"
          element={<StudentAnnouncements />}
        />

        <Route
          path="announcements/:announcementId"
          element={<AnnouncementNotification />}
        />

        {/* ====================================================
            PROFILE
        ==================================================== */}

        <Route
          path="profile"
          element={
            <div className="min-h-full bg-slate-50 p-6">
              <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-bold text-slate-900">
                  Student Profile
                </h1>
              </div>
            </div>
          }
        />
      </Route>

      {/* ======================================================
          SUPER ADMIN
      ====================================================== */}

      <Route
        path="/superadmin"
        element={<SuperAdminLayout />}
      >
        {/* Dashboard */}
        <Route
          index
          element={<SuperAdminDashboard />}
        />

        {/* Users */}
        <Route
          path="users"
          element={<SuperAdminUsers />}
        />

        {/* Batches */}
        <Route
          path="batches"
          element={<SuperAdminBatches />}
        />

        {/* Batch Details */}
        <Route
          path="batches/:id"
          element={<SuperAdminBatchDetails />}
        />

        {/* Batch Dashboard */}
        <Route
          path="batches/:id/dashboard"
          element={<SuperAdminBatchDetails />}
        />

        {/* Registrations */}
        <Route
          path="registrations"
          element={<SuperAdminRegistrations />}
        />

        {/* Audit Logs */}
        <Route
          path="audit-logs"
          element={<SuperAdminAuditLogs />}
        />

        {/* Settings */}
        <Route
          path="settings"
          element={<SuperAdminSettings />}
        />
      </Route>

      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default AppRoutes;