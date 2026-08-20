import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock3,
  Info,
  CalendarDays,
} from "lucide-react";
function StudentAttendance() {
  const [filter, setFilter] = useState("All");
  // Later this will come from the backend.
  const attendanceHistory = [];

  const filteredAttendance =
    filter === "All"
      ? attendanceHistory
      : attendanceHistory.filter(
          (record) => record.status === filter
        );
  // These values will later be calculated from backend data.
  const present = 0;
  const absent = 0;
  const late = 0;
  const excused = 0;
  const total = present + absent + late + excused;

  const attendanceRate =
    total === 0 ? 0 : Math.round((present / total) * 100);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Track your attendance and view your attendance history.
        </p>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Overall Attendance */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            Overall Attendance
          </p>
          <div className="mt-6 flex items-center justify-center">
            <div
              className="relative flex h-32 w-32 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  #0f172a ${attendanceRate * 3.6}deg,
                  #e2e8f0 0deg
                )`,
              }} >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-bold text-gray-900">
                  {attendanceRate}%
                </span>
              </div>
            </div>
          </div>

          {total === 0 && (
            <p className="mt-4 text-center text-xs text-gray-500">
              No attendance recorded yet.
            </p>
          )}
        </div>
        {/* Attendance Status Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          {/* Present */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>

            <p className="text-sm text-gray-600">
              Present
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              {present}
            </p>
          </div>
          {/* Absent */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>

            <p className="text-sm text-gray-600">
              Absent
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              {absent}
            </p>
          </div>
          {/* Late */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <Clock3 className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">
              Late
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              {late}
            </p>
          </div>
          {/* Excused */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">
              Excused
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900">
              {excused}
            </p>
          </div>
        </div>
      </div>
      {/* Attendance History */}
      <div className="rounded-xl border bg-white shadow-sm">

        {/* History Header */}
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View your attendance records.
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Month */}
            <button className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <CalendarDays className="h-4 w-4" />
              August 2026
            </button>
            {/* Status */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </select>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-4 font-medium">
                  Date
                </th>

                <th className="px-5 py-4 font-medium">
                  Day
                </th>

                <th className="px-5 py-4 font-medium">
                  Session
                </th>

                <th className="px-5 py-4 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record, index) => (
                <tr
                  key={index}
                  className="border-b last:border-0">

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {record.date}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {record.day}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-gray-800">
                    {record.session}
                  </td>

                  <td className="px-5 py-4">
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Empty State */}
        {filteredAttendance.length === 0 && (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-4 font-medium text-gray-700">
              No attendance records yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Your attendance history will appear here after
              your mentor records your first attendance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default StudentAttendance;