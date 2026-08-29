import { useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import MentorSidebar from "../components/MentorSidebar";
import StudentSidebar from "../components/StudentSidebar";
import Header from "../components/Header";

import { useTheme } from "../context/ThemeContext";

function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const { darkMode, toggleDarkMode } = useTheme();

  // =========================================================
  // SIDEBAR
  // =========================================================

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

  // =========================================================
  // PAGE INFORMATION
  // =========================================================

  const getPageInfo = () => {
    const path = location.pathname;

    // =======================================================
    // ADMIN
    // =======================================================

    if (role === "admin") {
      if (path === "/admin" || path === "/admin/dashboard") {
        return {
          title: "Admin Dashboard",
          description: "Manage the bootcamp system.",
        };
      }

      if (path.includes("/admin/users")) {
        return {
          title: "Users",
          description: "Manage system users.",
        };
      }

      if (path.includes("/admin/register-mentor")) {
        return {
          title: "Register Mentor",
          description: "Register a new mentor.",
        };
      }

      if (path.includes("/admin/applications")) {
        return {
          title: "Applications",
          description: "Review student applications.",
        };
      }

      if (path.includes("/admin/attendance")) {
        return {
          title: "Attendance",
          description: "Manage student attendance.",
        };
      }

      if (path.includes("/admin/sessions")) {
        return {
          title: "Session Management",
          description: "Manage bootcamp sessions.",
        };
      }

      if (path.includes("/admin/batches")) {
        return {
          title: "Batches",
          description: "Manage bootcamp batches.",
        };
      }

      if (path.includes("/admin/regisrations")) {
        return {
          title: "Registrations",
          description: "Manage student registrations.",
        };
      }

      if (path.includes("/admin/mentor-assignment")) {
        return {
          title: "Mentor Assignment",
          description: "Assign mentors to students.",
        };
      }

      if (path.includes("/admin/assignments")) {
        return {
          title: "Assignments",
          description: "Manage assignments.",
        };
      }

      if (path.includes("/admin/form-builder")) {
        return {
          title: "Application Form Builder",
          description: "Configure the student application form.",
        };
      }

      if (path.includes("/admin/announcements")) {
        return {
          title: "Announcements",
          description: "Manage bootcamp announcements.",
        };
      }

      if (path.includes("/admin/analytics")) {
        return {
          title: "Analytics",
          description: "View bootcamp analytics.",
        };
      }

      if (path.includes("/admin/modules")) {
        return {
          title: "Modules",
          description: "Manage bootcamp modules.",
        };
      }

      if (path.includes("/admin/module-resources")) {
        return {
          title: "Module Resources",
          description: "Manage module resources.",
        };
      }


      if (path.includes("/admin/levels")) {
        return {
          title: "Levels",
          description: "Manage bootcamp levels.",
        };
      }

      if (path.includes("/admin/daily-tasks")) {
        return {
          title: "Daily Tasks",
          description: "Manage student daily tasks.",
        };
      }

      if (path.includes("/admin/settings")) {
        return {
          title: "Settings",
          description: "Manage system settings.",
        };
      }

      if (path.includes("/admin/faqs")) {
        return {
          title: "FAQs",
          description: "Manage frequently asked questions.",
        };
      }

      if (path.includes("/admin/about")) {
        return {
          title: "About",
          description: "Manage system information.",
        };
      }

      return {
        title: "Admin Dashboard",
        description: "Manage the bootcamp system.",
      };
    }

    // =======================================================
    // MENTOR
    // =======================================================

    if (role === "mentor") {
      if (path === "/mentor") {
        return {
          title: "Mentor Dashboard",
          description: "Manage your students and their progress.",
        };
      }

      if (
        path.includes("/mentor/students") ||
        path.includes("/mentor/my-students")
      ) {
        return {
          title: "Students",
          description: "View and manage your assigned students.",
        };
      }

      if (path.includes("/mentor/attendance")) {
        return {
          title: "Attendance",
          description: "Track student attendance.",
        };
      }

      if (path.includes("/mentor/progress")) {
        return {
          title: "Progress",
          description: "Monitor student learning progress.",
        };
      }

      if (path.includes("/mentor/assignments")) {
        return {
          title: "Assignments",
          description: "Manage student assignments.",
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
          description: "View bootcamp announcements.",
        };
      }

      if (path.includes("/mentor/profile")) {
        return {
          title: "Profile",
          description: "Manage your profile.",
        };
      }

      return {
        title: "Mentor Dashboard",
        description: "Manage your students and their progress.",
      };
    }

    // =======================================================
    // STUDENT
    // =======================================================

    if (role === "student") {
      if (path === "/student") {
        return {
          title: "Student Dashboard",
          description: "Track your bootcamp activities and progress.",
        };
      }

      if (path.includes("/student/attendance")) {
        return {
          title: "Attendance",
          description: "View your attendance history.",
        };
      }

      if (path.includes("/student/daily-tasks")) {
        return {
          title: "Daily Tasks",
          description:
            "Complete your daily tasks and keep your learning progress on track.",
        };
      }

      if (path.includes("/student/progress")) {
        return {
          title: "Progress",
          description: "Track your learning progress.",
        };
      }

      if (path.includes("/student/assignments")) {
        return {
          title: "Assignments",
          description: "View and complete your assignments.",
        };
      }

      if (path.includes("/student/grades")) {
        return {
          title: "Grades",
          description: "View your grades and performance.",
        };
      }


      if (path.includes("/student/submissions")) {
        return {
          title: "Submissions",
          description: "View your submitted assignments.",
        };
      }

      if (path.includes("/student/announcements")) {
        return {
          title: "Announcements",
          description: "View bootcamp announcements.",
        };
      }

      if (path.includes("/student/my-mentor")) {
        return {
          title: "My Mentor",
          description: "View your assigned mentor.",
        };
      }

      if (path.includes("/student/profile")) {
        return {
          title: "Profile",
          description: "Manage your profile.",
        };
      }

      return {
        title: "Student Dashboard",
        description: "Track your bootcamp activities and progress.",
      };
    }

    return {
      title: "Dashboard",
      description: "Welcome to the Bootcamp Management System.",
    };
  };

  const pageInfo = getPageInfo();

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        {getSidebar()}
      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white transition-transform duration-200 lg:hidden dark:border-slate-800 dark:bg-slate-900 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
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

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 w-full lg:ml-64 overflow-x-hidden">

        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">

          <div className="flex items-center justify-between px-4 py-3 lg:px-6">

            <div className="flex items-center gap-3">

              {/* Mobile menu */}
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

            {/* =================================================
                DARK MODE
            ================================================= */}

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

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="min-h-[calc(100vh-80px)] p-4 transition-colors duration-200 sm:p-6 dark:bg-slate-950">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;