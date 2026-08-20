import { useState } from "react";
import { Menu, X } from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import MentorSidebar from "../components/MentorSidebar";
import StudentSidebar from "../components/StudentSidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let sidebar;

  if (role === "admin") {
    sidebar = <AdminSidebar />;
  } else if (role === "mentor") {
    sidebar = <MentorSidebar />;
  } else if (role === "student") {
    sidebar = <StudentSidebar />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">

      {/* =========================
          DESKTOP SIDEBAR
      ========================== */}
      <div className="hidden h-screen shrink-0 md:block">
        {sidebar}
      </div>

      
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Mobile sidebar */}
          <div className="fixed left-0 top-0 z-50 h-screen md:hidden">
            {sidebar}
          </div>
        </>
      )}

     
      <div className="flex min-w-0 flex-1 flex-col">

       
        <div className="flex h-12 shrink-0 items-center bg-gray-50 px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-200"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>

       
        <Header />

       
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;