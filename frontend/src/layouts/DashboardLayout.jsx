import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#F7F5EF]">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Right side */}
      <div className="ml-64 min-h-screen">

        {/* Header */}
        <AdminHeader />

        {/* Page content */}
        <main className="p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;