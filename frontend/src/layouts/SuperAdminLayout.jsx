import { Outlet, NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  Boxes,
} from "lucide-react";

import useAuth from "../context/useAuth";

import "./SuperAdminLayout.css";

function SuperAdminLayout() {
  const { logout, user } = useAuth();

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
      label: "Batches",
      path: "/superadmin/batches",
      icon: Boxes,
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

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "SA";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="superadmin-layout">

      {/* ================= SIDEBAR ================= */}
      <aside className="superadmin-sidebar">

        {/* BRAND */}
        <div className="superadmin-brand">
          <div className="superadmin-brand-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2>Super Admin</h2>
            <p>Management System</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="superadmin-nav">
          <p className="superadmin-nav-title">
            MAIN MENU
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/superadmin"}
                className={({ isActive }) =>
                  `superadmin-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={19} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="superadmin-logout">
          <button
            type="button"
            onClick={logout}
            className="superadmin-logout-button"
          >
            <LogOut size={20} />

            <span>
              Logout
            </span>
          </button>
        </div>

      </aside>

      {/* ================= MAIN ================= */}
      <main className="superadmin-main">

        {/* HEADER */}
        <header className="superadmin-header">

          <div>
            <p className="superadmin-header-label">
              ADMINISTRATION
            </p>

            <h1>
              Super Admin Panel
            </h1>
          </div>

          {/* PROFILE */}
          <div className="superadmin-profile">

            <div className="superadmin-avatar">
              {getInitials(user?.name)}
            </div>

            <div>
              <p className="superadmin-profile-name">
                {user?.name || "Super Admin"}
              </p>

              <p className="superadmin-profile-role">
                {user?.role || "System Administrator"}
              </p>
            </div>

          </div>

        </header>

        {/* ================= PAGE CONTENT ================= */}
        <div className="superadmin-content">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default SuperAdminLayout;