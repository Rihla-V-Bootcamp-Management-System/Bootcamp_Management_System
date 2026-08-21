import { useEffect, useState } from "react";
import {
  Check,
  X,
  Clock,
  CircleAlert,
  CalendarCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

import apiClient from "../services/apiClient";

function MentorAttendance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [batchName, setBatchName] = useState("Batch 2026");

  // TEMPORARY TEST BATCH
  // We will replace this later with the mentor's
  // assigned batch from the backend.
  const batchId = "6a88511ab71105e54fe97098";

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-50 text-green-700 border-green-200";

      case "Absent":
        return "bg-red-50 text-red-700 border-red-200";

      case "Late":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Excused":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // ==========================================
  // STATUS ICON
  // ==========================================

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <Check size={15} />;

      case "Absent":
        return <X size={15} />;

      case "Late":
        return <Clock size={15} />;

      case "Excused":
        return <CircleAlert size={15} />;

      default:
        return null;
    }
  };

  // ==========================================
  // FETCH ASSIGNED STUDENTS
  // ==========================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching mentor attendance...");
      console.log("Batch ID:", batchId);

      const response = await apiClient.get(
        `/attendance?batchId=${encodeURIComponent(batchId)}`
      );

      console.log("Backend response:", response.data);

      // ========================================
      // BACKEND RETURNS:
      //
      // {
      //   batch: {...},
      //   attendancePercentage: 80,
      //   totalRecords: 10,
      //   students: [...]
      // }
      // ========================================

      const data = response.data;

      if (data.batch?.name) {
        setBatchName(data.batch.name);
      }

      if (!Array.isArray(data.students)) {
        throw new Error(
          "Backend did not return a students array."
        );
      }

      setStudents(data.students);
    } catch (err) {
      console.error(
        "================================"
      );
      console.error("MENTOR ATTENDANCE ERROR");
      console.error(
        "================================"
      );
      console.error("Message:", err.message);
      console.error(
        "Status:",
        err.response?.status
      );
      console.error(
        "Response:",
        err.response?.data
      );
      console.error(
        "URL:",
        err.config?.url
      );
      console.error(
        "================================"
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "You are not assigned to this batch."
        );
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
            "Batch or attendance endpoint was not found."
        );
      } else if (err.response?.status === 500) {
        setError(
          err.response?.data?.message ||
            "Server error while loading attendance."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load attendance."
        );
      }

      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = () => {
    fetchAttendance();
  };

  // ==========================================
  // TODAY
  // ==========================================

  const sessionDate = new Date()
    .toISOString()
    .split("T")[0];

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* ====================================== */}
      {/* PAGE HEADER */}
      {/* ====================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View attendance for students assigned to
          your batch.
        </p>
      </div>

      {/* ====================================== */}
      {/* BATCH + DATE */}
      {/* ====================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5">

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* BATCH */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Batch
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">

              <CalendarCheck
                size={18}
                className="text-gray-500"
              />

              <span className="text-sm font-medium text-gray-700">
                {batchName}
              </span>

            </div>
          </div>

          {/* DATE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Session Date
            </label>

            <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {sessionDate}
            </div>
          </div>

        </div>
      </div>

      {/* ====================================== */}
      {/* NOTICE */}
      {/* ====================================== */}

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">

        <div className="flex items-center gap-3">

          <CalendarCheck
            size={19}
            className="text-blue-600"
          />

          <div>

            <p className="text-sm font-medium text-blue-800">
              View-only attendance
            </p>

            <p className="mt-1 text-xs text-blue-700">
              Attendance is managed by the administrator.
              You can only view attendance for students
              assigned to your batch.
            </p>

          </div>

        </div>
      </div>

      {/* ====================================== */}
      {/* ATTENDANCE CARD */}
      {/* ====================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

          <div>

            <h2 className="font-semibold text-gray-900">
              Assigned Students
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {students.length} assigned student
              {students.length !== 1 ? "s" : ""}
            </p>

          </div>

          <button
            type="button"
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={17} />
            )}

            Refresh

          </button>

        </div>

        {/* ====================================== */}
        {/* LOADING */}
        {/* ====================================== */}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-500">

            <Loader2
              className="animate-spin"
              size={22}
            />

            <span>
              Loading assigned students...
            </span>

          </div>
        )}

        {/* ====================================== */}
        {/* ERROR */}
        {/* ====================================== */}

        {!loading && error && (
          <div className="px-5 py-12 text-center">

            <CircleAlert
              className="mx-auto text-red-500"
              size={36}
            />

            <p className="mt-4 font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ====================================== */}
        {/* EMPTY */}
        {/* ====================================== */}

        {!loading &&
          !error &&
          students.length === 0 && (
            <div className="py-16 text-center">

              <CalendarCheck
                className="mx-auto h-10 w-10 text-gray-300"
              />

              <p className="mt-4 font-medium text-gray-900">
                No students assigned
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Students assigned to this batch will
                appear here.
              </p>

            </div>
          )}

        {/* ====================================== */}
        {/* TABLE */}
        {/* ====================================== */}

        {!loading &&
          !error &&
          students.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="border-b border-gray-200 bg-gray-50">

                  <tr>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Student
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Attendance
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Latest Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {students.map((student) => {

                    const percentage = Number(
                      student.attendancePercentage || 0
                    );

                    return (
                      <tr
                        key={student.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* STUDENT */}

                        <td className="px-5 py-4">

                          <p className="font-medium text-gray-900">
                            {student.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {student.userID ||
                              student.email ||
                              student.id}
                          </p>

                        </td>

                        {/* ATTENDANCE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">

                              <div
                                className="h-full rounded-full bg-green-500"
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      percentage,
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                            <span className="text-sm font-semibold text-gray-700">
                              {percentage}%
                            </span>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${getStatusStyle(
                              student.latestStatus
                            )}`}
                          >

                            {getStatusIcon(
                              student.latestStatus
                            )}

                            {student.latestStatus}

                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

      </div>

    </div>
  );
}

export default MentorAttendance;