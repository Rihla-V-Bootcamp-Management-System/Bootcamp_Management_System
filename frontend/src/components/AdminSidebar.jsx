import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Users,
  UserCheck,
  CalendarCheck,
  Layers,
  BookOpen,
  BarChart3,
  Settings,
  HelpCircle,
  Info,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const mainLinks = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Registrations",
      path: "/admin/registrations",
      icon: ClipboardList,
    },
    {
      label: "Applications",
      path: "/admin/applications",
      icon: FileText,
    },
    {
      label: "Students",
      path: "/admin/students",
      icon: Users,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: UserCheck,
    },
    {
      label: "Attendance",
      path: "/admin/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Batches",
      path: "/admin/batches",
      icon: Layers,
    },
    {
      label: "Assignments",
      path: "/admin/assignments",
      icon: BookOpen,
    },
    {
      label: "Performance",
      path: "/admin/performance",
      icon: BarChart3,
    },
  ];

  const contentLinks = [
    {
      label: "About",
      path: "/admin/about",
      icon: Info,
    },
    {
      label: "FAQ",
      path: "/admin/faqs",
      icon: HelpCircle,
    },
  ];

  return (
    <aside className="min-h-screen w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h2>
      </div>

      <nav className="space-y-1 px-3">
        {/* MAIN */}
        {mainLinks.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* CONTENT */}
        <div className="px-4 pb-2 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Content
          </p>
        </div>

        {contentLinks.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* SETTINGS */}
        <div className="pt-4">
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;