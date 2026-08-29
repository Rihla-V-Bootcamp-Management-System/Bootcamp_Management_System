import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] text-white-900">
      <AdminSidebar />

      <div className="ml-64">
        <AdminHeader />

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;