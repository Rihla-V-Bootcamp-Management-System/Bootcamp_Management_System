import {
  LayoutDashboard,
  CalendarCheck,
  ChartNoAxesColumn,
  ClipboardList,
  Megaphone,
  User,
  LogOut,
  UserCheck,
  ListTodo,
  FileCheck,
  Code2,
  Award,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";

function StudentSidebar() {
  const { logout, user } = useAuth();

  const links = [
    {
      name: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Attendance",
      path: "/student/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Progress",
      path: "/student/progress",
      icon: ChartNoAxesColumn,
    },
    {
      name: "My Mentor",
      path: "/student/my-mentor",
      icon: UserCheck,
    },
    {
      name: "Daily Tasks",
      path: "/student/daily-tasks",
      icon: ListTodo,
    },
    {
      name: "Assignments",
      path: "/student/assignments",
      icon: ClipboardList,
    },
    {
      name: "Submissions",
      path: "/student/submissions",
      icon: FileCheck,
    },
    {
      name: "Announcements",
      path: "/student/announcements",
      icon: Megaphone,
    },
    {
      name: "Certificates",
      path: "/student/certificates",
      icon: Award,
    },
    {
      name: "My Profile",
      path: "/student/profile",
      icon: User,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#15253f] bg-[#070d18] px-4 py-6 text-white overflow-hidden">
      {/* BRAND */}
      <div className="flex items-center gap-3 px-2 pb-6 border-b border-[#15253f]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1f6f5b] text-white shadow-xs">
          <Code2 size={22} />
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-white leading-tight">
            ASTU MSJ
          </h2>
          <p className="text-[11px] font-medium text-slate-400">
            Student Portal
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-1 [scrollbar-width:thin] [scrollbar-color:#202938_transparent]">
        <p className="px-3 pb-2 pt-1 text-[10px] font-extrabold tracking-wider text-[#6f7887] uppercase">
          MAIN MENU
        </p>

        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#1f6f5b] text-white shadow-md font-bold"
                    : "text-[#aeb6c2] hover:bg-[#15253f] hover:text-white"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="border-t border-[#202938] pt-4 mt-auto">
        <button
          type="button"
          onClick={logout}
          className="flex w-full min-h-[42px] items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#aeb6c2] transition hover:bg-[#2a2023] hover:text-[#e17a7a]"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default StudentSidebar;