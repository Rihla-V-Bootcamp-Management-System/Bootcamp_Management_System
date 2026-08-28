import { Routes, Route, Navigate } from "react-router-dom";

// ============================================================
// LAYOUTS
// ============================================================

import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import BatchLayout from "../layouts/BatchLayout";

// ============================================================
// PUBLIC PAGES
// ============================================================

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SetPassword from "../pages/SetPassword";
import FirstLogin from "../pages/FirstLogin";
import PublicApplication from "../pages/PublicApplication";

// ============================================================
// MENTOR PAGES
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

import MyStudents from "../pages/MyStudents";

// ============================================================
// STUDENT PAGES
// ============================================================

import StudentDashboard from "../pages/StudentDashboard";
import StudentAttendance from "../pages/StudentAttendance";
import StudentProgress from "../pages/StudentProgress";
import StudentWebProgress from "../pages/StudentWebProgress";
import StudentCPProgress from "../pages/StudentCpProgress";
import MyMentor from "../pages/MyMentor";

import StudentAssignments from "../pages/StudentAssignments";
import StudentCourseAssignments from "../pages/StudentCourseAssignments";
import StudentAssignmentDetails from "../pages/StudentAssignmentDetails";
import StudentSubmission from "../pages/StudentSubmission";
import StudentSubmissions from "../pages/StudentSubmissions";
import StudentGrades from "../pages/StudentGrades";
import StudentAnnouncements from "../pages/StudentAnnouncements";
import AnnouncementNotification from "../pages/AnnouncementNotification";
import StudentDailyTasks from "../pages/StudentDailyTasks";

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Applications from "../pages/admin/Applications";
import Batches from "../pages/admin/Batches";
import Registration from "../pages/admin/Registration";
import FormBuilder from "../pages/admin/FormBuilder";
import BatchDetails from "../pages/admin/BatchDetails";
import Attendance from "../pages/admin/Attendance";
import SessionManagement from "../pages/admin/SessionManagement";
import MentorAssignment from "../pages/admin/MentorAssignment";
import DailyTasks from "../pages/admin/DailyTasks";

import Analytics from "../pages/admin/Analytics";

import Modules from "../pages/admin/modules/Modules";
import ModuleResources from "../pages/admin/modules/ModuleResources";

import AdminSettings from "../pages/admin/AdminSettings";
import FAQs from "../pages/admin/FAQs";
import About from "../pages/admin/About";

import AdminAssignments from "../pages/admin/AdminAssignments";
import AdminAnnouncements from "../pages/admin/AdminAnnouncements";
import CreateAnnouncement from "../pages/admin/CreateAnnouncement";
import CreateSpecialAnnouncement from "../pages/admin/CreateSpecialAnnouncement";

import RegisterMentor from "../pages/admin/RegisterMentor";
import Levels from "../pages/admin/levels/Levels";

// ============================================================
// SUPER ADMIN PAGES
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
          PUBLIC ROUTES
      ====================================================== */}

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

      {/* ======================================================
          ADMIN ROUTES
      ====================================================== */}

      <Route
        path="/admin"
        element={<DashboardLayout role="admin" />}
      >

        {/* Dashboard */}

        {/* /admin */}
        <Route
          index
          element={<AdminDashboard />}
        />

        {/* /admin/dashboard */}
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        {/* Users */}

        <Route
          path="users"
          element={<Users />}
        />

        {/* Register Mentor */}

        <Route
          path="register-mentor"
          element={<RegisterMentor />}
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

        {/* Session Management */}

        <Route
          path="sessions"
          element={<SessionManagement />}
        />

        {/* Batches */}

        <Route
          path="batches"
          element={<Batches />}
        />

        {/* ==================================================
            SHARED BATCH NAVIGATION
        ================================================== */}

        <Route element={<BatchLayout />}>

          {/* Batch Overview */}

          <Route
            path="batches/:id"
            element={<BatchDetails />}
          />

          {/* Modules */}

          <Route
            path="modules"
            element={<Modules />}
          />

          {/* Module Resources */}

          <Route
            path="module-resources"
            element={<ModuleResources />}
          />

          {/* Levels */}

          <Route
            path="levels"
            element={<Levels />}
          />

          {/* Daily Tasks */}

          <Route
            path="daily-tasks"
            element={<DailyTasks />}
          />

        </Route>

        {/* Registration */}

        <Route
          path="registrations"
          element={<Registration />}
        />

        {/* Mentor Assignment */}

        <Route
          path="mentor-assignment"
          element={<MentorAssignment />}
        />

        {/* Assignments */}

        <Route
          path="assignments"
          element={<AdminAssignments />}
        />

        {/* Form Builder */}

        <Route
          path="form-builder"
          element={<FormBuilder />}
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
          element={<Analytics />}
        />

        {/* Settings */}

        <Route
          path="settings"
          element={<AdminSettings />}
        />

        {/* FAQs */}

        <Route
          path="faqs"
          element={<FAQs />}
        />

        {/* About */}

        <Route
          path="about"
          element={<About />}
        />

      </Route>

      {/* ======================================================
          MENTOR ROUTES
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
          element={<MyStudents />}
        />

        {/* Alternative Mentor Students Page */}

        <Route
          path="my-students"
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

        {/* Assignments */}

        <Route
          path="assignments"
          element={<MentorAssignments />}
        />

        {/* Course Assignments */}

        <Route
          path="assignments/course/:courseName"
          element={<MentorCourseAssignments />}
        />

        {/* Assignment Details */}

        <Route
          path="assignments/:assignmentId"
          element={<MentorAssignmentDetails />}
        />

        {/* Topic Details */}

        <Route
          path="assignments/:assignmentId/topics/:topicId"
          element={<MentorTopicDetails />}
        />

        {/* Assignment Submissions */}

        <Route
          path="assignments/:assignmentId/submissions"
          element={<MentorAssignmentSubmissions />}
        />

        {/* Submissions */}

        <Route
          path="submissions"
          element={<MentorSubmission />}
        />

        {/* Submission Review */}

        <Route
          path="submissions/:submissionId"
          element={<MentorSubmissionReview />}
        />

        {/* Announcements */}

        <Route
          path="announcements"
          element={<MentorAnnouncements />}
        />

        {/* Profile */}

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
          STUDENT ROUTES
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

        {/* My Mentor */}

        <Route
          path="my-mentor"
          element={<MyMentor />}
        />

        {/* Assignments */}

        <Route
          path="assignments"
          element={<StudentAssignments />}
        />

        {/* Course Assignments */}

        <Route
          path="assignments/course/:courseName"
          element={<StudentCourseAssignments />}
        />

        {/* Assignment Details */}

        <Route
          path="assignments/:assignmentId"
          element={<StudentAssignmentDetails />}
        />

        {/* Submit Assignment */}

        <Route
          path="assignments/:assignmentId/submit"
          element={<StudentSubmission />}
        />

        {/* Submissions */}

        <Route
          path="submissions"
          element={<StudentSubmissions />}
        />

        {/* Grades */}

        <Route
          path="grades"
          element={<StudentGrades />}
        />

        {/* Announcements */}

        <Route
          path="announcements"
          element={<StudentAnnouncements />}
        />

        {/* Announcement Details */}

        <Route
          path="announcements/:announcementId"
          element={<AnnouncementNotification />}
        />

        {/* Daily Tasks */}

        <Route
          path="daily-tasks"
          element={<StudentDailyTasks />}
        />

        {/* Profile */}

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
          SUPER ADMIN ROUTES
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