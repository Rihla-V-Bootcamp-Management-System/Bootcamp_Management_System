import { Bell, LogOut, Shield } from "lucide-react";
import useAuth from "../../context/useAuth";

function AdminHeader() {
  const { user, logout } = useAuth();

  const userName = user?.name || user?.fullName || "Admin";
  const userInitial = userName.charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-8 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield size={20} className="text-blue-600" />
          Admin Panel
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Welcome back, <span className="font-semibold text-slate-800">{userName}</span>!
        </p>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="/admin/announcements"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
          title="Announcements"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
        </a>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
            {userInitial}
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900">{userName}</p>
            <p className="text-[11px] text-slate-500 capitalize">{user?.role || "Admin"}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Logout"
            className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition ml-1"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;