import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
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