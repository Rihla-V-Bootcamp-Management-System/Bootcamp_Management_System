import { useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import MentorSidebar from "../components/MentorSidebar";
import StudentSidebar from "../components/StudentSidebar";
import useAuth from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
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

    if (role === "admin") {
      if (path === "/admin" || path === "/admin/dashboard") {
        return {
          category: "OVERVIEW",
          title: "Admin Dashboard",
          description: "Monitor and manage the bootcamp system from one place.",
        };
      }
      if (path.includes("/admin/users")) {
        return {
          category: "USER MANAGEMENT",
          title: "Users",
          description: "Manage administrators, mentors, super administrators, and students.",
        };
      }
      if (path.includes("/admin/batches")) {
        return {
          category: "COHORT MANAGEMENT",
          title: "Batches",
          description: "Organize cohort timelines, curricula, and enrollments.",
        };
      }
      if (path.includes("/admin/daily-tasks")) {
        return {
          category: "CURRICULUM",
          title: "Daily Tasks",
          description: "Schedule daily tasks, milestones, and point allocations.",
        };
      }
      if (path.includes("/admin/announcements")) {
        return {
          category: "COMMUNICATION",
          title: "Announcements",
          description: "Publish announcements and important broadcast updates.",
        };
      }
      if (path.includes("/admin/attendance")) {
        return {
          category: "OPERATIONS",
          title: "Attendance Tracker",
          description: "Track live session check-ins, excuses, and statistics.",
        };
      }
      if (path.includes("/admin/assignments")) {
        return {
          category: "ACADEMICS",
          title: "Assignments",
          description: "Create and publish learning assignments and tasks.",
        };
      }
      if (path.includes("/admin/applications")) {
        return {
          category: "ADMISSIONS",
          title: "Applications",
          description: "Review and evaluate student admission applications.",
        };
      }
      if (path.includes("/admin/profile")) {
        return {
          category: "ACCOUNT",
          title: "My Profile",
          description: "Manage your personal account credentials and preferences.",
        };
      }

      return {
        category: "ADMINISTRATION",
        title: "Admin Panel",
        description: "Manage the bootcamp operations and platform settings.",
      };
    }

    if (role === "mentor") {
      if (path.includes("/mentor/students")) {
        return {
          category: "STUDENT SUPPORT",
          title: "My Students",
          description: "Track student performance, questions, and assigned tasks.",
        };
      }
      if (path.includes("/mentor/attendance")) {
        return {
          category: "SESSION LOGS",
          title: "Attendance",
          description: "Verify daily student check-ins and session attendance.",
        };
      }
      if (path.includes("/mentor/progress")) {
        return {
          category: "ANALYTICS",
          title: "Progress Tracker",
          description: "Monitor cohort metrics and learning advancement.",
        };
      }
      if (path.includes("/mentor/submissions")) {
        return {
          category: "GRADING",
          title: "Submissions",
          description: "Review, evaluate, and provide feedback on submissions.",
        };
      }
      if (path.includes("/mentor/profile")) {
        return {
          category: "ACCOUNT",
          title: "My Profile",
          description: "Manage your mentor profile and account credentials.",
        };
      }

      return {
        category: "MENTORSHIP",
        title: "Mentor Workspace",
        description: "Support your assigned bootcamp cohort and students.",
      };
    }

    if (role === "student") {
      if (path.includes("/student/attendance")) {
        return {
          category: "SESSION LOGS",
          title: "My Attendance",
          description: "View your attendance records and check-in history.",
        };
      }
      if (path.includes("/student/progress")) {
        return {
          category: "MILESTONES",
          title: "My Progress",
          description: "Track your learning points, streak, and level advancement.",
        };
      }
      if (path.includes("/student/daily-tasks")) {
        return {
          category: "DAILY ACTIVITIES",
          title: "Daily Tasks",
          description: "Complete your scheduled daily tasks and activities.",
        };
      }
      if (path.includes("/student/assignments")) {
        return {
          category: "COURSEWORK",
          title: "Assignments",
          description: "View assignment specifications and submit solutions.",
        };
      }
      if (path.includes("/student/profile")) {
        return {
          category: "ACCOUNT",
          title: "My Profile",
          description: "Manage your personal profile and account credentials.",
        };
      }

      return {
        category: "STUDENT SPACE",
        title: "Student Dashboard",
        description: "Your personalized learning environment and coursework.",
      };
    }

    return {
      category: "DASHBOARD",
      title: "Bootcamp Management",
      description: "Manage your bootcamp resources.",
    };
  };

  const pageInfo = getPageInfo();

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return role === "admin" ? "AD" : role === "mentor" ? "ME" : "ST";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] dark:bg-slate-950 text-[#20202a] dark:text-slate-100 flex">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}
      <div className="hidden lg:block">
        {getSidebar()}
      </div>

      {/* =====================================================
          MOBILE SIDEBAR MODAL
      ===================================================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {getSidebar()}
          </div>
        </div>
      )}

      {/* =====================================================
          MAIN VIEWPORT
      ===================================================== */}
      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col min-h-screen">
        {/* ===================================================
            TOP HEADER (SUPERADMIN STYLE)
        =================================================== */}
        <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-[#e9e9ef] bg-white/95 px-6 py-4 backdrop-blur dark:border-[#15253f] dark:bg-[#070f1e]/95 sm:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:bg-[#070e1b] lg:hidden dark:text-slate-300 dark:hover:bg-[#0b1528]"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-[#a0a0ad] uppercase">
                {pageInfo.category}
              </p>
              <h1 className="text-lg font-extrabold text-[#20202a] dark:text-white leading-tight">
                {pageInfo.title}
              </h1>
            </div>
          </div>

          {/* RIGHT SIDE (AVATAR & THEME TOGGLE) */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white dark:hover:bg-[#0f1d33]"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-[#15253f]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5f1ed] text-[#1f6f5b] font-extrabold text-xs shadow-xs">
                {getInitials(user?.name)}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#30303a] dark:text-white leading-none">
                  {user?.name || "Logged In User"}
                </p>
                <p className="text-[10px] text-[#a0a0ad] leading-none mt-1 capitalize">
                  {user?.role || role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}
        <main className="flex-1 p-6 sm:p-8 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;