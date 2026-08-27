import { useState } from "react";
import { ClipboardList, Search, Calendar } from "lucide-react";

const assignments = [
  {
    id: "1",
    title: "Build a Personal Portfolio",
    deadline: "2026-08-25",
    submissions: 18,
  },
  {
    id: "2",
    title: "React Task Manager",
    deadline: "2026-08-28",
    submissions: 12,
  },
  {
    id: "3",
    title: "REST API Project",
    deadline: "2026-08-30",
    submissions: 25,
  },
];

function MentorAssignments() {
  const [search, setSearch] = useState("");

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Assignments
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View assignments and monitor student submissions.
        </p>
      </div>

      {/* Assignment Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <ClipboardList size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                All Assignments
              </h2>

              <p className="text-sm text-gray-500">
                {assignments.length} assignments
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Title
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Deadline
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Submissions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="transition hover:bg-gray-50"
                >
                  {/* Title */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                        <ClipboardList size={20} />
                      </div>

                      <span className="font-medium text-gray-900">
                        {assignment.title}
                      </span>
                    </div>
                  </td>

                  {/* Deadline */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={17} />

                      <span className="text-sm">
                        {new Date(
                          assignment.deadline
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Submissions */}
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      {assignment.submissions} submitted
                    </span>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-14 text-center"
                  >
                    <ClipboardList
                      size={42}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <h3 className="font-semibold text-gray-700">
                      No assignments found
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Try searching for a different assignment.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MentorAssignments;