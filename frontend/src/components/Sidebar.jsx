import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#F8F8F8] p-6">
      <h2 className="text-xl font-bold mb-8">
        ASTU MSJ
      </h2>

      <nav className="flex flex-col gap-2">
        <span className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-200">
          <LayoutDashboard size={20} />
          Dashboard
        </span>

        <span className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-200">
          <Users size={20} />
          All Members
        </span>

        <span className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-200">
          <CalendarCheck size={20} />
          Attendance
        </span>

        <span className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-200">
          <Settings size={20} />
          Settings
        </span>
      </nav>
    </aside>
  );
}

export default Sidebar;