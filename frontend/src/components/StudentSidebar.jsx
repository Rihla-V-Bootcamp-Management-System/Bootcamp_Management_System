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
    `group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
      isActive
        ? "border border-white text-white"
        : "border border-transparent text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="flex h-screen w-60 flex-col bg-[#111827] text-white">

      {/* =========================
          LOGO
      ========================== */}

      <div className="flex h-[76px] shrink-0 items-center border-b border-white/10 px-5">
        <div>
          <p className="text-lg font-bold tracking-wide">
            ASTU MSJ
          </p>

          <p className="text-xs text-slate-400">
            Bootcamp
          </p>
        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">

          <NavLink
            to="/student"
            end
            className={navClass}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/student/attendance"
            className={navClass}
          >
            <CalendarCheck size={19} />
            <span>Attendance</span>
          </NavLink>

          <NavLink
            to="/student/progress"
            end
            className={navClass}
          >
            <ChartNoAxesColumn size={19} />
            <span>Progress</span>
          </NavLink>

          <NavLink
            to="/student/assignments"
            className={navClass}
          >
            <ClipboardList size={19} />
            <span>Assignments</span>
          </NavLink>

          <NavLink
            to="/student/grades"
            className={navClass}
          >
            <Star size={19} />
            <span>Grades</span>
          </NavLink>

          <NavLink
            to="/student/announcements"
            className={navClass}
          >
            <Megaphone size={19} />
            <span>Announcements</span>
          </NavLink>

          <NavLink
            to="/student/profile"
            className={navClass}
          >
            <User size={19} />
            <span>Profile</span>
          </NavLink>

        </div>
      </nav>

      {/* =========================
          LOGOUT
      ========================== */}

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}

export default StudentSidebar;