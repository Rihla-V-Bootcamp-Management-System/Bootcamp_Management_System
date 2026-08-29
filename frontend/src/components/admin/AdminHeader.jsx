import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  Shield,
  Search,
  User,
  Moon,
  Sun,
  Settings,
  ChevronDown,
} from "lucide-react";
import useAuth from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";

function AdminHeader() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const userName = user?.name || user?.fullName || "Admin";
  const userInitial = userName.charAt(0).toUpperCase() || "A";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/users?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-8 shadow-sm dark:border-slate-800 dark:bg-[#1f6f5b]/95 transition-colors">
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield size={20} className="text-[#1f6f5b] dark:text-blue-400" />
            Admin Panel
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{userName}</span>!
          </p>
        </div>

        {/* Functional Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
          <Search size={16} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, records..."
            className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 outline-none transition focus:border-[#1f6f5b] focus:bg-white focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 dark:bg-[#070e1b] hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-[#185848] dark:hover:text-slate-200 transition"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* Announcements Link */}
        <Link
          to="/admin/announcements"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 dark:bg-[#070e1b] hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-[#185848] dark:hover:text-slate-200 transition"
          title="Announcements"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#1f6f5b] dark:bg-blue-400" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-slate-700" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-100 dark:bg-[#070e1b] dark:hover:bg-[#185848] transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f6f5b] text-sm font-bold text-white shadow-sm">
              {userInitial}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{userName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{user?.role || "Admin"}</p>
            </div>

            <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-[#070e1b] dark:text-slate-200 dark:hover:bg-slate-700 transition"
              >
                <User size={15} className="text-[#1f6f5b] dark:text-blue-400" />
                My Profile
              </Link>

              <Link
                to="/admin/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-[#070e1b] dark:text-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Settings size={15} className="text-slate-500 dark:text-slate-400" />
                Admin Settings
              </Link>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700/60" />

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;