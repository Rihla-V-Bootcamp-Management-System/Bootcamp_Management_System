import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";

function MentorAttendance() {
  const [email, setEmail] = useState("");
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoadBatches = async () => {
    if (!email.trim()) {
      setError("Please enter your mentor email.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/batches/mentor?email=${encodeURIComponent(email)}`
      );

      setBatches(response.data.batches || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load mentor batches."
      );
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAttendance = async () => {
    if (!selectedBatch) {
      setError("Please select a batch.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let url = `/attendance/batch/${selectedBatch}`;

      if (selectedWeek) {
        url += `?week=${selectedWeek}`;
      }

      const response = await apiClient.get(url);

      setStudents(response.data.students || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance."
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mentor Attendance
          </h1>

          <p className="mt-2 text-gray-500">
            View attendance of students in your assigned batches.
          </p>
        </div>

        {/* Mentor Email */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow">

          <label className="mb-2 block font-medium">
            Mentor Email
          </label>

          <div className="flex gap-3">

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter mentor email"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
            />

            <button
              onClick={handleLoadBatches}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Load Batches
            </button>

          </div>
        </div>

        {/* Filters */}
        {batches.length > 0 && (
          <div className="mb-6 grid gap-4 rounded-xl bg-white p-6 shadow md:grid-cols-3">

            <div>
              <label className="mb-2 block font-medium">
                Batch
              </label>

              <select
                value={selectedBatch}
                onChange={(e) =>
                  setSelectedBatch(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="">
                  Select Batch
                </option>

                {batches.map((batch) => (
                  <option
                    key={batch._id}
                    value={batch._id}
                  >
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Week
              </label>

              <select
                value={selectedWeek}
                onChange={(e) =>
                  setSelectedWeek(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="">
                  All Weeks
                </option>

                {[1, 2, 3, 4, 5, 6, 7, 8].map(
                  (week) => (
                    <option
                      key={week}
                      value={week}
                    >
                      Week {week}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleLoadAttendance}
                className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
              >
                View Attendance
              </button>
            </div>

          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Attendance */}
        <div className="rounded-xl bg-white shadow">

          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">
              Student Attendance
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              Loading attendance...
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Select a batch and week to view attendance.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left">
                      Week
                    </th>

                    <th className="px-6 py-4 text-left">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className="border-t"
                    >

                      <td className="px-6 py-4 font-medium">
                        {student.name}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {student.email}
                      </td>

                      <td className="px-6 py-4">
                        Week {student.week}
                      </td>

                      <td className="px-6 py-4">
                        {student.sessionDate
                          ? new Date(
                              student.sessionDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                          {student.status}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default MentorAttendance;