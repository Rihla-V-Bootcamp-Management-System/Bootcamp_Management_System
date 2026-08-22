import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import Login from "./pages/Login";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import SuperAdminRegistrations from "./pages/superadmin/SuperAdminRegistrations";
import SuperAdminAuditLogs from "./pages/superadmin/SuperAdminAuditLogs";
import SuperAdminSettings from "./pages/superadmin/SuperAdminSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/superadmin" element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="users" element={<SuperAdminUsers />} />
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
    </BrowserRouter>
  );
}

export default App;