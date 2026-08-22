import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function AssignmentDashboard() {
  const location = useLocation();
  const [search, setSearch] = useState("");

  const navItems = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Courses", path: "/student/courses" },
    { name: "Assignments", path: "/assignments" },
    { name: "Attendance", path: "/student/attendance" },
    { name: "Progress", path: "/student/progress" },
    { name: "Announcements", path: "/student/announcements" },
    { name: "Profile", path: "/student/profile" },
  ];

  const assignments = [];

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f1b3d] text-white">
        <div className="flex h-[72px] items-center border-b border-white/10 px-6">
          <h1 className="text-xl font-bold">
            ASTU MSJ
          </h1>
        </div>

        <nav className="space-y-2 px-3 py-6">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#2a4b8c] text-white"
                    : "text-[#cbd5e1] hover:bg-[#2a4b8c] hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-6">
          <button
            type="button"
            className="w-full rounded-lg border border-white/10 px-4 py-3 text-left text-sm text-[#cbd5e1] transition hover:bg-[#2a4b8c]"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="ml-64">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e2e8f0] bg-white px-6">
          <div>
            <h2 className="text-lg font-bold text-[#0f1b3d]">
              Assignments
            </h2>

            <p className="text-xs text-[#64748b]">
              Student Portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
              S
            </div>

            <div>
              <p className="text-sm font-semibold text-[#1e293b]">
                Student
              </p>

              <p className="text-xs text-[#64748b]">
                Student
              </p>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#0f1b3d]">
                Assignments
              </h1>

              <p className="mt-2 text-[#64748b]">
                View assignments created and assigned to you.
              </p>
            </div>

            <div className="mb-8">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assignments..."
                className="w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-[#1e293b] outline-none placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {filteredAssignments.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="rounded-2xl bg-white p-6 shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <h2 className="text-xl font-bold text-[#1e293b]">
                      {assignment.title}
                    </h2>

                    <p className="mt-2 text-sm text-[#64748b]">
                      {assignment.deadline}
                    </p>

                    <Link
                      to={`/student/assignments/${assignment._id}`}
                      className="mt-6 inline-block rounded-lg bg-[#2563eb] px-5 py-3 font-semibold text-white transition hover:bg-[#1d4ed8]"
                    >
                      View Assignment
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
                <p className="text-[#64748b]">
                  No assignments available.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssignmentDashboard;