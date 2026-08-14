
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/AdminDashboard";
import MentorDashboard from "../pages/MentorDashboard";
import StudentDashboard from "../pages/StudentDashboard";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

       <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      im
     
      <Route path="/dashboard"element={ <DashboardLayout>
              <Dashboard />
     </DashboardLayout>}
     />
        </Routes>
  );
}

export default AppRoutes;