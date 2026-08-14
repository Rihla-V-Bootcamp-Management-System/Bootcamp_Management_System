function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    "Dashboard",
    "Assigned Students",
    "Attendance",
    "Progress",
    "Assignments",
    "Announcements",
    "Profile",
  ]
  return (
    <aside className="w-64 min-h-screen bg-white border-r p-5">
      <h1 className="text-xl font-bold mb-8">
        Mentor Dashboard
      </h1>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => setActivePage(item)}
            className={`w-full text-left px-4 py-3 rounded-lg ${
              activePage === item
                ? "bg-purple-100 text-purple-700"
                : "hover:bg-gray-100"
            }`}
            >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  )
}
export default Sidebar