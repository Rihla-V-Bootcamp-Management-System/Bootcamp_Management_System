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

function AppRoutes() {
  return (
    <Routes>

     
     

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


      

      <Route
        path="/student"
        element={<DashboardLayout role="student" />}
      >

       
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