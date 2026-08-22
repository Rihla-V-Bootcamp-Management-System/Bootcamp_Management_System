import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function SubmissionDashboard() {
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

  const submissions = [];

  const filteredSubmissions = submissions.filter((submission) =>
    submission.assignmentId?.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
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
              Submissions
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
                Submissions
              </h1>

              <p className="mt-2 text-[#64748b]">
                Track your submitted assignments and feedback.
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search submissions..."
                className="w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-[#1e293b] outline-none placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {filteredSubmissions.length > 0 ? (
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] text-left">
                        <th className="px-6 py-4 text-sm font-semibold text-[#64748b]">
                          ASSIGNMENT
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-[#64748b]">
                          SUBMITTED
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-[#64748b]">
                          STATUS
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-[#64748b]">
                          GRADE
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-[#64748b]">
                          FEEDBACK
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSubmissions.map((submission) => (
                        <tr
                          key={submission._id}
                          className="border-b border-[#e2e8f0] last:border-0"
                        >
                          <td className="px-6 py-5 font-semibold text-[#1e293b]">
                            {submission.assignmentId?.title || "Assignment"}
                          </td>

                          <td className="px-6 py-5 text-sm text-[#64748b]">
                            {submission.createdAt
                              ? new Date(
                                  submission.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Submitted
                            </span>
                          </td>

                          <td className="px-6 py-5 font-semibold text-[#1e3a5f]">
                            {submission.grade || "Pending"}
                          </td>

                          <td className="px-6 py-5 text-sm text-[#64748b]">
                            {submission.feedback || "Waiting for review"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-12 text-center shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
                <h2 className="text-xl font-semibold text-[#1e293b]">
                  No submissions yet
                </h2>

                <p className="mt-2 text-sm text-[#64748b]">
                  Your submitted assignments will appear here.
                </p>

                <Link
                  to="/assignments"
                  className="mt-6 inline-block rounded-lg bg-[#2563eb] px-5 py-3 font-semibold text-white transition hover:bg-[#1d4ed8]"
                >
                  View Assignments
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SubmissionDashboard;