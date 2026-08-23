import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import useAuth from "../context/useAuth";
import "./SuperAdminLayout.css";

function SuperAdminLayout() {
  const { logout } = useAuth();

  const navigation = [
    {
      label: "Dashboard",
      path: "/superadmin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/superadmin/users",
      icon: Users,
    },
    {
      label: "Registrations",
      path: "/superadmin/registrations",
      icon: ClipboardList,
    },
    {
      label: "Audit Logs",
      path: "/superadmin/audit-logs",
      icon: FileText,
    },
    {
      label: "Settings",
      path: "/superadmin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="superadmin-layout">
      <aside className="superadmin-sidebar">
        <div className="superadmin-brand">
          <div className="superadmin-brand-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2>Super Admin</h2>
            <p>Management System</p>
          </div>
        </div>

        <nav className="superadmin-nav">
          <p className="superadmin-nav-title">MAIN MENU</p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/superadmin"}
                className={({ isActive }) =>
                  `superadmin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

           {/* LOGOUT */}
      <div className="mt-auto border-t border-gray-700 pt-6">

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-200  "
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>
      </aside>

      <main className="superadmin-main">
        <header className="superadmin-header">
          <div>
            <p className="superadmin-header-label">ADMINISTRATION</p>
            <h1>Super Admin Panel</h1>
          </div>

          <div className="superadmin-profile">
            <div className="superadmin-avatar">SA</div>

            <div>
              <p className="superadmin-profile-name">
                Super Admin
              </p>

              <p className="superadmin-profile-role">
                System Administrator
              </p>
            </div>
          </div>
        </header>

        <div className="superadmin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SuperAdminLayout;