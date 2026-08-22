import { NavLink } from "react-router-dom";

function AssignmentSidebar() {
  const links = [
    {
      name: "Assignments",
      path: "/assignments",
    },
    {
      name: "Submissions",
      path: "/submissions",
    },
  ];

  return (
    <aside className="hidden min-h-screen w-64 bg-[#0f1b3d] md:block">
      <div className="sticky top-0 flex min-h-screen flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <h1 className="text-xl font-bold text-white">
            ASTU MSJ
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Assignment Management
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#2a4b8c] text-white"
                    : "text-[#cbd5e1] hover:bg-[#2a4b8c] hover:text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-xs text-slate-400">
            ASTU MSJ Bootcamp
          </p>
        </div>
      </div>
    </aside>
  );
}

export default AssignmentSidebar;