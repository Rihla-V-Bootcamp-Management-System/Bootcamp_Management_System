import { useState } from "react";
import apiClient from "../services/apiClient";

function StudentAttendance() {
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/attendance/student?email=${encodeURIComponent(email)}`
      );

      setStudent(response.data.student);
      setAttendance(response.data.attendance);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance."
      );
      setAttendance([]);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const present = attendance.filter(
    (a) => a.status === "Present"
  ).length;

  const late = attendance.filter(
    (a) => a.status === "Late"
  ).length;

  const absent = attendance.filter(
    (a) => a.status === "Absent"
  ).length;

  const excused = attendance.filter(
    (a) => a.status === "Excused"
  ).length;

  const total = attendance.length;

  const percentage =
    total > 0
      ? Math.round(((present + late) / total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Attendance
          </h1>

          <p className="mt-2 text-gray-500">
            Check your bootcamp attendance using your email.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <label className="mb-2 block font-medium text-gray-700">
            Student Email
          </label>

          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSearch}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "View Attendance"}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>

        {student && (
          <>
            {/* Student Information */}
            <div className="mb-6 rounded-xl bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900">
                {student.name}
              </h2>

              <p className="text-gray-500">
                {student.email}
              </p>

              {student.batch && (
                <p className="mt-2 text-sm text-gray-500">
                  Batch: {student.batch.name}
                </p>
              )}
            </div>

            {/* Statistics */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">

              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">
                  Overall
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {percentage}%
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">
                  Present
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {present}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">
                  Late
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {late}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">
                  Absent
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {absent}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow">
                <p className="text-sm text-gray-500">
                  Excused
                </p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {excused}
                </p>
              </div>

            </div>

            {/* Attendance Table */}
            <div className="rounded-xl bg-white shadow">
              <div className="border-b p-6">
                <h2 className="text-xl font-semibold">
                  Attendance History
                </h2>
              </div>

              {attendance.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No attendance records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left">
                          Week
                        </th>
                        <th className="px-6 py-4 text-left">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left">
                          Notes
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {attendance.map((record) => (
                        <tr
                          key={record._id}
                          className="border-t"
                        >
                          <td className="px-6 py-4">
                            Week {record.week}
                          </td>

                          <td className="px-6 py-4">
                            {new Date(
                              record.sessionDate
                            ).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                              {record.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {record.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentAttendance;