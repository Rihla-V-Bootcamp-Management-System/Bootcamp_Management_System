import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-white-900">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 w-full md:ml-64 overflow-x-hidden">
        
        {/* Mobile Header Row for Hamburger */}
        <div className="flex items-center gap-3 bg-white px-6 py-3 border-b border-slate-200 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-slate-900">Menu</span>
        </div>

        <AdminHeader />

        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;