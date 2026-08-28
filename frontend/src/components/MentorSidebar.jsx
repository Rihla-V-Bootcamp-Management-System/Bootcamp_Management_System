import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ChartNoAxesColumn,
  ClipboardList,
  Upload,
  Megaphone,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";

function MentorSidebar() {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-800 ${
      isActive
        ? "border border-white"
        : "border border-transparent"
    }`;

  return (
    <div className="flex h-full w-full flex-col bg-gray-900 p-6 text-white overflow-y-auto">

      {/* LOGO / NAME */}
      <h2 className="mb-8 text-xl font-bold">
        ASTU MSJ
      </h2>

      {/* NAVIGATION */}
      <nav className="flex flex-col gap-2">

        {/* Dashboard - exact /mentor match only */}
        <NavLink
          to="/mentor"
          end
          className={linkClass}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/mentor/students"
          className={linkClass}
        >
          <Users size={20} />
          My Students
        </NavLink>

        <NavLink
          to="/mentor/attendance"
          className={linkClass}
        >
          <CalendarCheck size={20} />
          Attendance
        </NavLink>

        <NavLink
          to="/mentor/progress"
          className={linkClass}
        >
          <ChartNoAxesColumn size={20} />
          Progress
        </NavLink>

        <NavLink
          to="/mentor/assignments"
          className={linkClass}
        >
          <ClipboardList size={20} />
          Assignments
        </NavLink>

        <NavLink
          to="/mentor/submissions"
          className={linkClass}
        >
          <Upload size={20} />
          Submissions
        </NavLink>

        <NavLink
          to="/mentor/announcements"
          className={linkClass}
        >
          <Megaphone size={20} />
          Announcements
        </NavLink>

      </nav>

      {/* LOGOUT */}
      <div className="mt-auto border-t border-gray-700 pt-6">

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-800"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </div>
  );
}

export default MentorSidebar;