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

  return (
    <aside className="w-56 bg-gray-900 text-white p-6 flex flex-col">

      <h2 className="text-xl font-bold mb-8">
        ASTU MSJ
      </h2>

      <nav className="flex flex-col gap-2">

        <NavLink
          to="/student"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/student/attendance"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <CalendarCheck size={20} />
          Attendance
        </NavLink>

        <NavLink
          to="/student/progress"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <ChartNoAxesColumn size={20} />
          Progress
        </NavLink>

        <NavLink
          to="student/assignments"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <ClipboardList size={20} />
          Assignments
        </NavLink>

        <NavLink
          to="/student/grades"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <Star size={20} />
          Grades
        </NavLink>

        <NavLink
          to="student/announcements"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <Megaphone size={20} />
          Announcements
        </NavLink>

        <NavLink
          to="/student/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <User size={20} />
          Profile
        </NavLink>

      </nav>

      <div className="mt-auto pt-6 border-t border-gray-700">

        <button
          onClick=
          {logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-gray-800"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default StudentSidebar;