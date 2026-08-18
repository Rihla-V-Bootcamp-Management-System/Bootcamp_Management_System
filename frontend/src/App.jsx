import { Routes, Route } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Applications from "./pages/admin/Applications";
import Batches from "./pages/admin/Batches";
import Registration from "./pages/admin/Registration";
import BatchDetails from "./pages/admin/BatchDetails";

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>

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
          path="/admin/batches"
          element={<Batches />}
        />
        <Route
          path="/admin/registrations"
          element={<Registration />}
        />

        <Route
          path="/admin/analytics"
          element={<div>Analytics Page</div>}
        />

        <Route
          path="/admin/settings"
          element={<div>Settings Page</div>}
        />

      </Route>
    </Routes>
  );
}

export default App;