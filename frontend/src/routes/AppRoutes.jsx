import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";


import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SetPassword from "../pages/SetPassword";
import FirstLogin from "../pages/FirstLogin";
import PublicApplication from "../pages/PublicApplication";


import MentorDashboard from "../pages/MentorDashboard";
import MentorStudents from "../pages/MentorStudents";
import MentorAttendance from "../pages/MentorAttendance";
import MentorProgress from "../pages/MentorProgress";
import MentorAssignments from "../pages/MentorAssignments";
import MentorSubmissions from "../pages/MentorSubmission";

// Student pages
import StudentDashboard from "../pages/StudentDashboard";
import StudentAttendance from "../pages/StudentAttendance";
import StudentProgress from "../pages/StudentProgress";
import StudentWebProgress from "../pages/StudentWebProgress";
import StudentCPProgress from "../pages/StudentCpProgress";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Applications from "../pages/admin/Applications";
import Batches from "../pages/admin/Batches";
import Registration from "../pages/admin/Registration";
import BatchDetails from "../pages/admin/BatchDetails";
import Attendance from "../pages/admin/Attendance";

// Assignment pages
import StudentSubmission from "../pages/StudentAssignments";
import StudentAssignments from "../pages/StudentAssignments";
import StudentAssignmentDetails from "../pages/StudentAssignmentDetails";
import AdminAssignments from "../pages/AdminAssignments";

function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/set-password" element={<SetPassword />} />

      <Route path="/first-login" element={<FirstLogin />} />

      <Route path="/apply" element={<PublicApplication />} />

      {/* ================= ADMIN ROUTES ================= */}

      <Route
        path="/admin"
        element={<DashboardLayout role="admin" />}
      >
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

        <Route
          path="announcements"
          element={<div>Announcements Page</div>}
        />

        <Route
          path="analytics"
          element={<div>Analytics Page</div>}
        />

        <Route
          path="settings"
          element={<div>Settings Page</div>}
        />

        <Route
          path="assignments"
          element={<AdminAssignments />}
        />
      </Route>

      {/* ================= MENTOR ROUTES ================= */}

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

      {/* ================= STUDENT ROUTES ================= */}

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
          element={<StudentSubmission/>}
        />

        <Route
          path="announcements"
          element={<div>Student Announcements</div>}
        />

        <Route
          path="profile"
          element={<div>Student Profile</div>}
        />
      </Route>

      {/* ================= GENERAL ASSIGNMENT ROUTES ================= */}

      
    </Routes>
  );
}

export default AppRoutes;