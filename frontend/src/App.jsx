import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Batches from "./pages/admin/Batches";
function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="batches" element={<Batches />} />
      </Route>
    </Routes>
  );
}

export default App;