import {
  LayoutDashboard,
  Users,
  Layers,
  Megaphone,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import useAuth from "../../context/useAuth";

function AdminSidebar() {
  const { logout } = useAuth();

  const links = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Batches",
      path: "/admin/batches",
      icon: Layers,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: Megaphone,
    },
    {
      name: "Registrations",
      path: "/admin/registrations",
      icon: ClipboardList,
    },
    {
      name: "Attendance",
      path: "/admin/attendance",
      icon: ClipboardList,
    },
    {
      name: "Applications",
      path: "/admin/applications",
      icon: FileText,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-50 border-r border-[#26364a] bg-[#071629] text-white">
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-[#26364a] px-6 py-5">
          <img
            src="/logo.jpg"
            alt="ASTU MSJ Logo"
            className="h-10 w-10 rounded-full object-contain"
          />

          <div>
            <h1 className="text-xl font-bold text-white">
              ASTU MSJ
            </h1>

            <p className="text-sm text-[#8f969e]">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">

            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#18273a] text-white shadow-sm"
                        : "text-[#aeb5bd] hover:bg-[#101f31] hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

          </div>
        </nav>

        {/* Admin profile */}
        <div className="border-t border-[#26364a] p-4">

          <div className="mb-3 rounded-lg bg-[#18273a] px-4 py-3">
            <p className="text-sm font-semibold text-white">
              Admin
            </p>

            <p className="text-xs text-[#8f969e]">
              Administrator
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-[#aeb5bd] transition-all duration-200 hover:bg-[#101f31] hover:text-white"
          >
            <LogOut size={19} strokeWidth={1.8} />

            <span>Logout</span>
          </button>

        </div>

      </div>
    </aside>
  );
}

export default AdminSidebar;