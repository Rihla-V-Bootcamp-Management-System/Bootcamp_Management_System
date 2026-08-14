import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  return (
    <div>
      <AdminHeader />

      <AdminSidebar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;