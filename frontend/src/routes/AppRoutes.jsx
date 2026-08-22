import { Routes, Route } from "react-router-dom";
import AssignmentDashboard from "../pages/AssignmentDashboard";
import SubmissionDashboard from "../pages/SubmissionDashboard";
import StudentAssignments from "../pages/StudentAssignments";
import StudentAssignmentDetails from "../pages/StudentAssignmentDetails";
import AdminAssignments from "../pages/AdminAssignments";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/assignments"
        element={<AssignmentDashboard />}
      />

      <Route
        path="/submissions"
        element={<SubmissionDashboard />}
      />

      <Route
        path="/student/assignments"
        element={<StudentAssignments />}
      />

      <Route
        path="/student/assignments/:id"
        element={<StudentAssignmentDetails />}
      />

      <Route
        path="/admin/assignments"
        element={<AdminAssignments />}
      />
    </Routes>
  );
}

export default AppRoutes;