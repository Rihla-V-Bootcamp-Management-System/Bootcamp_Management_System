import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

       <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />
     
       <Route
  path="/dashboard"
  element={<DashboardLayout/>} />
     
    </Routes>
  );
}

export default AppRoutes;