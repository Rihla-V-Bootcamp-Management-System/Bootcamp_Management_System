import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";



import MentorDashboard from "../pages/MentorDashboard";
import MentorStudents from "../pages/MentorStudents";
import MentorAttendance from "../pages/MentorAttendance";
import MentorProgress from "../pages/MentorProgress";
import MentorAssignments from "../pages/MentorAssignments";
import MentorSubmissions from "../pages/MentorSubmission";


import PublicApplication from "../pages/PublicApplication";

import StudentAttendance from "../pages/StudentAttendance";
import StudentProgress from "../pages/StudentProgress";
import StudentWebProgress from "../pages/StudentWebProgress";
import StudentCPProgress from "../pages/StudentCpProgress";


import FirstLogin from "../pages/FirstLogin";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SetPassword from "../pages/SetPassword";


import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";



import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Applications from "../pages/admin/Applications";
import Batches from "../pages/admin/Batches";
import Registration from "../pages/admin/Registration";
import BatchDetails from "../pages/admin/BatchDetails";

import StudentDashboard from "../pages/StudentDashboard";

import Attendance from "../pages/admin/Attendance";
function AppRoutes() {
  return (
    <Routes>

     
     

      <Route
        path="/mentor"
        element={<DashboardLayout role="mentor" />}
      >
      

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
      path="/admin/attendance"
      element={<Attendance />}
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
          path="/student"
          element={<StudentDashboard />}
        />

       
        <Route
          index
          element={<div>Student Dashboard</div>}
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
          element={<div>Student Assignments</div>}
        />

       
        <Route
          path="grades"
          element={<div>Student Grades</div>}
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

      <Route
  path="/apply"
  element={<PublicApplication />}
/>

    </Routes>
  );
}

export default AppRoutes;