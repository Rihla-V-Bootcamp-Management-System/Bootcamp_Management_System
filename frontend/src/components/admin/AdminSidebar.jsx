import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const links = [
    {
      name: "Dashboard",
      path: "/admin",
    },
    {
      name: "Users",
      path: "/admin/users",
    },
    {
      name: "Batches",
      path: "/admin/batches",
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white">
      <div className="flex h-full flex-col">
        
        <div className="border-b border-slate-200 px-6 py-5">
          <h1 className="text-xl font-bold text-slate-900">
            ASTU Bootcamp
          </h1>
          <p className="mt-1 text-sm text-slate-500">Admin Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Management
          </p>

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Admin</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;