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
  Sun,
  Moon,
} from "lucide-react";

import useAuth from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

import "./SuperAdminLayout.css";

function SuperAdminLayout() {
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

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
    {
      label: "My Profile",
      path: "/superadmin/profile",
      icon: Users,
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

  const handleLogout = () => {
    logout();
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
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="superadmin-sidebar-bottom">
          <button
            type="button"
            className="superadmin-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
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

            <h1>Super Admin Panel</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* THEME TOGGLE BUTTON */}
            <button
              type="button"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: darkMode ? "1px solid #15253f" : "1px solid #e2e8f0",
                background: darkMode ? "#070e1b" : "#ffffff",
                color: darkMode ? "#ffffff" : "#334155",
                transition: "all 0.2s ease",
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

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
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="superadmin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SuperAdminLayout;