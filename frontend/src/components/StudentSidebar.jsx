import {
  LayoutDashboard,
  CalendarCheck,
  ChartNoAxesColumn,
  ClipboardList,
  Star,
  Megaphone,
  User,
  LogOut,
  UserCheck,
  ListTodo,
  FileCheck,
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
    <div className="flex h-full w-full flex-col bg-[#111827] text-white">
      {/* LOGO */}
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

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-1">

          {/* Dashboard */}
          <NavLink
            to="/student"
            end
            className={navClass}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          {/* Attendance */}
          <NavLink
            to="/student/attendance"
            className={navClass}
          >
            <CalendarCheck size={19} />
            <span>Attendance</span>
          </NavLink>

          {/* Progress */}
          <NavLink
            to="/student/progress"
            end
            className={navClass}
          >
            <ChartNoAxesColumn size={19} />
            <span>Progress</span>
          </NavLink>

          {/* My Mentor */}
          <NavLink
            to="/student/my-mentor"
            end
            className={navClass}
          >
            <UserCheck size={19} />
            <span>My Mentor</span>
          </NavLink>

          {/* Daily Tasks */}
          <NavLink
            to="/student/daily-tasks"
            end
            className={navClass}
          >
            <ListTodo size={19} />
            <span>Daily Tasks</span>
          </NavLink>

          {/* Assignments */}
          <NavLink
            to="/student/assignments"
            className={navClass}
          >
            <ClipboardList size={19} />
            <span>Assignments</span>
          </NavLink>

          {/* Grades */}
          <NavLink
            to="/student/grades"
            className={navClass}
          >
            <Star size={19} />
            <span>Grades</span>
          </NavLink>

          {/* Submissions */}
          <NavLink
            to="/student/submissions"
            className={navClass}
          >
            <FileCheck size={19} />
            <span>Submissions</span>
          </NavLink>

          {/* Announcements */}
          <NavLink
            to="/student/announcements"
            className={navClass}
          >
            <Megaphone size={19} />
            <span>Announcements</span>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/student/profile"
            className={navClass}
          >
            <User size={19} />
            <span>Profile</span>
          </NavLink>

        </div>
      </nav>

      {/* LOGOUT */}
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
    </div>
  );
}

export default StudentSidebar;