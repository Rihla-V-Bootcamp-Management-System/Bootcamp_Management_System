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
    <aside className="fixed left-0 top-0 z-40 h-screen w-62 border-r border-[#26364a] bg-[#071629]">
      <div className="flex h-full flex-col">

        <div className="border-slate-200 px-6 py-5 flex items-center gap-3 ">
              <img
      src="/logo.jpg"
      alt="Logo"
      className="h-10 w-10 rounded-full object-contain"
    />
    <div>
      <h1 className="text-20 font-bold text-white">
            ASTU MSJ
          </h1>

          <p className="text-sm text-[#8f969e]">
            Admin Portal
          </p>
        </div>

    </div>
          

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-">

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-[#242827] text-white"
                    : "text-[#aeb5bd] hover:bg-[#101f31] hover:text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

        </nav>

        <div className="border-gray-600 bg-[#071629] p-4">
          <div className="rounded-lg bg-[#18273a] px-4 py-3">
            <p className="text-sm font-semibold text-white">
              Admin
            </p>

            <p className="text-xs text-[#8f969e]">
              Administrator
            </p>
          </div>
        </div>

      </div>
    </aside>
  );
}

export default AdminSidebar;