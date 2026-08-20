import { useState } from "react";
import {
  Users,
  Search,
  AlertTriangle,
  CheckCircle2,
  Eye,
} from "lucide-react";

const students = [
  {
    id: 1,
    name: "Amina Mohammed",
    attendance: 92,
    progress: 85,
    risk: "Low",
  },
  {
    id: 2,
    name: "Abebe Kebede",
    attendance: 70,
    progress: 58,
    risk: "Medium",
  },
  {
    id: 3,
    name: "Hana Ali",
    attendance: 45,
    progress: 35,
    risk: "High",
  },
  {
    id: 4,
    name: "Mohammed Ahmed",
    attendance: 88,
    progress: 76,
    risk: "Low",
  },
];

const riskStyles = {
  Low: "bg-green-50 text-green-700",
  Medium: "bg-yellow-50 text-yellow-700",
  High: "bg-red-50 text-red-700",
};

function MentorStudents() {
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowRiskCount = students.filter(
    (student) => student.risk === "Low"
  ).length;

  const mediumRiskCount = students.filter(
    (student) => student.risk === "Medium"
  ).length;

  const highRiskCount = students.filter(
    (student) => student.risk === "High"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Students
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and monitor your assigned students.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Students
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {students.length}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Low Risk */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Low Risk
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {lowRiskCount}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Medium Risk
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {mediumRiskCount}
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* High Risk */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                High Risk
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {highRiskCount}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Assigned Students
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Monitor attendance, progress, and risk level.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Attendance
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Progress
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Risk Level
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="transition hover:bg-gray-50"
                >
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {student.name.charAt(0)}
                      </div>

                      <p className="font-medium text-gray-900">
                        {student.name}
                      </p>
                    </div>
                  </td>

                  {/* Attendance */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">
                      {student.attendance}%
                    </span>
                  </td>

                  {/* Progress */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">
                      {student.progress}%
                    </span>
                  </td>

                  {/* Risk */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                        riskStyles[student.risk]
                      }`}
                    >
                      {student.risk}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye size={18} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No students found.
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

export default MentorStudents;