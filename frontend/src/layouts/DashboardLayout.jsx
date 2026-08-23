import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
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
        description: "View your assigned students.",
      };
    }

    if (path.includes("/mentor/attendance")) {
      return {
        title: "Attendance",
        description: "Monitor student attendance.",
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

    if (path === "/student") {
      return {
        title: "Student Dashboard",
        description: "Track your bootcamp learning journey.",
      };
    }

    if (path.includes("/student/attendance")) {
      return {
        title: "Attendance",
        description: "View your attendance history.",
      };
    }

    if (path.includes("/student/progress/web")) {
      return {
        title: "Web Development",
        description: "Track your web development progress.",
      };
    }

    if (path.includes("/student/progress/cp")) {
      return {
        title: "Competitive Programming",
        description: "Track your competitive programming progress.",
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
        description: "View your assignments.",
      };
    }

    if (path.includes("/student/grades")) {
      return {
        title: "Grades",
        description: "View your grades.",
      };
    }

    if (path.includes("/student/announcements")) {
      return {
        title: "Announcements",
        description: "View bootcamp announcements.",
      };
    }

    if (path.includes("/student/profile")) {
      return {
        title: "Profile",
        description: "Manage your profile.",
      };
    }

    return {
      title: "Dashboard",
      description: "",
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fa]">

      {/* ================================
          DESKTOP SIDEBAR
      ================================= */}

      <aside className="hidden h-screen w-60 shrink-0 md:flex">
        {getSidebar()}
      </aside>

      {/* ================================
          MOBILE SIDEBAR
      ================================= */}

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <aside className="fixed left-0 top-0 z-50 h-screen w-60 md:hidden">
            {getSidebar()}
          </aside>
        </>
      )}

      {/* ================================
          RIGHT SIDE
      ================================= */}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}

        <Header
          title={pageInfo.title}
          description={pageInfo.description}
          onMenuClick={() =>
            setSidebarOpen((previous) => !previous)
          }
          sidebarOpen={sidebarOpen}
        />

        {/* CONTENT */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;