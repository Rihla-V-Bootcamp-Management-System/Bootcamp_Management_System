import {
  LayoutDashboard,
  CalendarCheck,
  ChartNoAxesColumn,
  ClipboardList,
  Star,
  Megaphone,
  User,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";

function StudentSidebar() {
  const { logout } = useAuth();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg border px-4 py-3 transition ${
      isActive
        ? "border-white bg-gray-800 text-white font-semibold"
        : "border-transparent text-gray-300 hover:border-gray-700 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="flex w-56 flex-col bg-gray-900 p-6 text-white">

      {/* LOGO */}

      <h2 className="mb-8 text-xl font-bold">
        ASTU MSJ
      </h2>

      {/* NAVIGATION */}

      <nav className="flex flex-col gap-2">

        <NavLink
          to="/student"
          end
          className={navClass}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/student/attendance"
          className={navClass}
        >
          <CalendarCheck size={20} />
          Attendance
        </NavLink>

        <NavLink
          to="/student/progress"
          className={navClass}
        >
          <ChartNoAxesColumn size={20} />
          Progress
        </NavLink>

        <NavLink
          to="/student/assignments"
          className={navClass}
        >
          <ClipboardList size={20} />
          Assignments
        </NavLink>

        <NavLink
          to="/student/grades"
          className={navClass}
        >
          <Star size={20} />
          Grades
        </NavLink>

        <NavLink
          to="/student/announcements"
          className={navClass}
        >
          <Megaphone size={20} />
          Announcements
        </NavLink>

        <NavLink
          to="/student/profile"
          className={navClass}
        >
          <User size={20} />
          Profile
        </NavLink>

      </nav>

      {/* LOGOUT */}

      <div className="mt-auto border-t border-gray-700 pt-6">

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-left text-gray-300 transition hover:border-gray-700 hover:bg-gray-800 hover:text-white"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default StudentSidebar;