import {
  LayoutDashboard,
  Users,
  Layers,
  Megaphone,
  ChartNoAxesColumn,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";

function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <aside className="w-56 bg-gray-900 text-white p-6 flex flex-col">

      <h2 className="text-xl font-bold mb-8">
        ASTU MSJ
      </h2>

      <nav className="flex flex-col gap-2">

        <NavLink
          to="/admin"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <Users size={20} />
          Users
        </NavLink>

        <NavLink
          to="/admin/batches"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <Layers size={20} />
          Batches
        </NavLink>

        <NavLink
          to="/admin/announcements"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <Megaphone size={20} />
          Announcements
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <ChartNoAxesColumn size={20} />
          Analytics
        </NavLink>

        <NavLink
          to="/admin/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          <Settings size={20} />
          Settings
        </NavLink>

      </nav>

      <div className="mt-auto pt-6 border-t border-gray-700">

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-gray-800"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </aside>
  );
}

export default AdminDashboard;