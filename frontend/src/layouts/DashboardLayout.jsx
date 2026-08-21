import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import MentorSidebar from "../components/MentorSidebar";
import StudentSidebar from "../components/StudentSidebar";
import Header from "../components/Header";

function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getSidebar = () => {
    if (role === "admin") return <AdminSidebar />;
    if (role === "mentor") return <MentorSidebar />;
    if (role === "student") return <StudentSidebar />;

    return null;
  };

  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/mentor") {
      return {
        title: "Mentor Dashboard",
        description:
          "Monitor your students and stay up to date with their progress.",
      };
    }

    if (path.includes("/mentor/students")) {
      return {
        title: "My Students",
        description: "View and manage your assigned students.",
      };
    }

    if (path.includes("/mentor/attendance")) {
      return {
        title: "Attendance",
        description: "Monitor and manage student attendance.",
      };
    }

    if (path.includes("/mentor/progress")) {
      return {
        title: "Progress",
        description: "Track your students' learning progress.",
      };
    }

    if (path.includes("/mentor/assignments")) {
      return {
        title: "Assignments",
        description: "Create and manage student assignments.",
      };
    }

    if (path.includes("/mentor/submissions")) {
      return {
        title: "Submissions",
        description: "Review student submissions.",
      };
    }

    if (path.includes("/mentor/announcements")) {
      return {
        title: "Announcements",
        description: "View important bootcamp announcements.",
      };
    }

    return {
      title: "Dashboard",
      description: "",
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* =========================
          DESKTOP SIDEBAR
      ========================== */}
      <aside className="hidden h-screen shrink-0 md:block">
        {getSidebar()}
      </aside>

      {/* =========================
          MOBILE SIDEBAR
      ========================== */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="fixed left-0 top-0 z-50 h-screen md:hidden">
            {getSidebar()}
          </aside>
        </>
      )}

      {/* =========================
          MAIN AREA
      ========================== */}
      <div className="flex h-screen min-w-0 flex-1 flex-col">

        {/* MOBILE MENU */}
        <div className="flex h-12 shrink-0 items-center bg-gray-50 px-4 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-200"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* =========================
            FIXED HEADER
        ========================== */}
        <div className="shrink-0">
          <Header
            title={pageInfo.title}
            description={pageInfo.description}
          />
        </div>

        {/* =========================
            ONLY THIS AREA SCROLLS
        ========================== */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;