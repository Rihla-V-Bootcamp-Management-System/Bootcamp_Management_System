import { useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import MentorSidebar from "../components/MentorSidebar";
import StudentSidebar from "../components/StudentSidebar";
import Header from "../components/Header";

import { useTheme } from "../context/ThemeContext";

function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { darkMode, toggleDarkMode } = useTheme();

  const getSidebar = () => {
    if (role === "admin") {
      return <AdminSidebar />;
    }

    if (role === "mentor") {
      return <MentorSidebar />;
    }

    if (role === "student") {
      return <StudentSidebar />;
    }

    return null;
  };

  const getPageInfo = () => {
    if (role === "mentor") {
      if (location.pathname.includes("/students")) {
        return {
          title: "Students",
          description: "View and manage your assigned students.",
        };
      }

      if (location.pathname.includes("/attendance")) {
        return {
          title: "Attendance",
          description: "Track student attendance.",
        };
      }

      if (location.pathname.includes("/progress")) {
        return {
          title: "Progress",
          description: "Monitor student learning progress.",
        };
      }

      if (location.pathname.includes("/assignments")) {
        return {
          title: "Assignments",
          description: "Manage student assignments.",
        };
      }

      if (location.pathname.includes("/submissions")) {
        return {
          title: "Submissions",
          description: "Review student submissions.",
        };
      }
    }

    if (role === "student") {
      if (location.pathname.includes("/attendance")) {
        return {
          title: "Attendance",
          description: "View your attendance records.",
        };
      }

      if (location.pathname.includes("/progress")) {
        return {
          title: "Progress",
          description: "Track your learning progress.",
        };
      }

      if (location.pathname.includes("/assignments")) {
        return {
          title: "Assignments",
          description: "View and complete your assignments.",
        };
      }

      if (location.pathname.includes("/grades")) {
        return {
          title: "Grades",
          description: "View your grades and performance.",
        };
      }

      if (location.pathname.includes("/submissions")) {
        return {
          title: "Submissions",
          description: "View your submitted assignments.",
        };
      }

      if (location.pathname.includes("/profile")) {
        return {
          title: "Profile",
          description: "Manage your profile.",
        };
      }
    }

    if (role === "admin") {
      if (location.pathname.includes("/users")) {
        return {
          title: "Users",
          description: "Manage system users.",
        };
      }

      if (location.pathname.includes("/applications")) {
        return {
          title: "Applications",
          description: "Review student applications.",
        };
      }

      if (location.pathname.includes("/attendance")) {
        return {
          title: "Attendance",
          description: "Manage student attendance.",
        };
      }

      if (location.pathname.includes("/batches")) {
        return {
          title: "Batches",
          description: "Manage bootcamp batches.",
        };
      }

      if (location.pathname.includes("/registrations")) {
        return {
          title: "Registrations",
          description: "Manage student registrations.",
        };
      }

      if (location.pathname.includes("/form-builder")) {
        return {
          title: "Application Form Builder",
          description: "Configure the student application form.",
        };
      }

      if (location.pathname.includes("/assignments")) {
        return {
          title: "Assignments",
          description: "Manage assignments.",
        };
      }

      if (location.pathname.includes("/settings")) {
        return {
          title: "Settings",
          description: "Manage system settings.",
        };
      }
    }

    return {
      title:
        role === "admin"
          ? "Admin Dashboard"
          : role === "mentor"
          ? "Mentor Dashboard"
          : "Student Dashboard",
      description:
        role === "admin"
          ? "Manage the bootcamp system."
          : role === "mentor"
          ? "Manage your students and their progress."
          : "Track your bootcamp activities and progress.",
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        {getSidebar()}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-200 lg:hidden dark:border-slate-800 dark:bg-slate-900 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {getSidebar()}
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">

        {/* Top header */}
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">

          <div className="flex items-center justify-between px-4 py-3 lg:px-6">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {pageInfo.title}
                </h1>

                <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                  {pageInfo.description}
                </p>
              </div>

            </div>

            {/* Dark mode button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

          </div>

          {/* Existing Header */}
          <Header />

        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-80px)] p-4 transition-colors duration-200 sm:p-6 dark:bg-slate-950">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;