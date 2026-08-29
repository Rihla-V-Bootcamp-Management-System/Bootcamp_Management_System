import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  AlertTriangle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import apiClient from "../services/apiClient";

const riskStyles = {
  Low: "bg-green-50 text-green-700",
  Medium: "bg-yellow-50 text-yellow-700",
  High: "bg-red-50 text-red-700",
};

function MentorStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GET ASSIGNED STUDENTS
  // =========================================================

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(
          "/mentor/my-students"
        );

        setStudents(response.data?.students || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load assigned students."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // =========================================================
  // SEARCH STUDENTS
  // =========================================================

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return students;
    }

    return students.filter((student) =>
      student.name?.toLowerCase().includes(searchValue)
    );
  }, [students, search]);

  // =========================================================
  // RISK COUNTS
  // =========================================================

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
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] dark:bg-[#070e1b] p-6">
    
  {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

     
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

       
        <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Total Students
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? "..." : students.length}
              </p>
            </div>

            <div className="rounded-lg bg-[#e5f1ed] p-3 text-[#1f6f5b]">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Low Risk */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Low Risk
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? "..." : lowRiskCount}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Medium Risk
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? "..." : mediumRiskCount}
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* High Risk */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                High Risk
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? "..." : highRiskCount}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>
      </div>

      

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-[#15253f] p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Assigned Students
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
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
              className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50 dark:bg-[#070e1b]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Attendance
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Progress
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Risk Level
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-[#15253f]">

              {/* Loading */}
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-slate-400"
                  >
                    Loading assigned students...
                  </td>
                </tr>
              )}

              {/* Students */}
              {!loading &&
                filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="transition hover:bg-slate-50 dark:bg-[#070e1b]"
                  >

                    {/* Student */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-[#185848]">
                          {student.name
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                        </div>

                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {student.name}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {student.email}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800 dark:text-slate-100">
                        {student.attendance !== undefined
                          ? `${student.attendance}%`
                          : "—"}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800 dark:text-slate-100">
                        {student.progress !== undefined
                          ? `${student.progress}%`
                          : "—"}
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="px-6 py-4">
                      {student.risk ? (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                            riskStyles[student.risk] ||
                            "bg-slate-50 dark:bg-[#070e1b] text-gray-700"
                          }`}
                        >
                          {student.risk}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#1f6f5b] transition hover:bg-[#e5f1ed]"
                      >
                        <Eye size={18} />
                        View
                      </button>
                    </td>

                  </tr>
                ))}

              {/* No students */}
              {!loading &&
                filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-gray-500 dark:text-slate-400"
                    >
                      {search
                        ? "No students found."
                        : "No students have been assigned to you yet."}
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