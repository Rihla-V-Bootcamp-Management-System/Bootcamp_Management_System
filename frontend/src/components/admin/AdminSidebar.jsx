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
    <aside>
      <h1>Admin</h1>

      <nav>
        {links.map((link) => (
          <NavLink key={link.path} to={link.path}>
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;