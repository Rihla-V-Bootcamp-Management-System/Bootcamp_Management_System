import { Link, useLocation, useNavigate } from "react-router-dom";

function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Dashboard",
      path: "/student",
    },
    {
      name: "Courses",
      path: "/student/courses",
    },
    {
      name: "Assignments",
      path: "/student/assignments",
    },
    {
      name: "Attendance",
      path: "/student/attendance",
    },
    {
      name: "Progress",
      path: "/student/progress",
    },
    {
      name: "Submissions",
      path: "/student/submissions",
    },
    {
      name: "Announcements",
      path: "/student/announcements",
    },
    {
      name: "Profile",
      path: "/student/profile",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#0f1b3d] text-white shadow-xl">
      {/* Logo */}
      <div className="flex h-[72px] shrink-0 items-center border-b border-white/10 px-6">
        <h1 className="text-xl font-bold tracking-wide">
          ASTU MSJ
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {navItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== "/student" &&
              location.pathname.startsWith(item.path + "/"));

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[#2563eb] text-white shadow-md"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-white/10 p-6">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-white/10 px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default StudentSidebar;