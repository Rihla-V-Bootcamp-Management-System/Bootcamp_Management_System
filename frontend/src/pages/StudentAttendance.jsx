import { useCallback, useEffect, useState } from "react";
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
import useAuth from "../context/useAuth";

function StudentAttendance() {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // ==========================================
  // FETCH STUDENT ATTENDANCE
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadAttendance = async () => {
      if (!user) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setError("");
        }

        // Get logged-in student's ID
        const studentId = user._id || user.id;

        if (!studentId) {
          throw new Error("Student ID was not found.");
        }

        const response = await apiClient.get(
          `/attendance?studentId=${studentId}`
        );

        console.log(
          "Student attendance response:",
          response.data
        );

        // ------------------------------------------
        // Handle possible backend response formats
        // ------------------------------------------

        let records = [];

        if (Array.isArray(response.data)) {
          records = response.data;
        } else if (
          Array.isArray(response.data.attendance)
        ) {
          records = response.data.attendance;
        } else if (
          Array.isArray(response.data.records)
        ) {
          records = response.data.records;
        } else if (
          Array.isArray(response.data.data)
        ) {
          records = response.data.data;
        }

        if (!cancelled) {
          setAttendance(records);
        }
      } catch (err) {
        console.error(
          "Student attendance error:",
          err.response?.data || err.message
        );

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load attendance."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAttendance();

    return () => {
      cancelled = true;
    };
  }, [user, reload]);

  // ==========================================
  // RETRY
  // ==========================================

  const handleRetry = useCallback(() => {
    setReload((current) => current + 1);
  }, []);

  // ==========================================
  // ATTENDANCE COUNTS
  // ==========================================

  const presentCount = attendance.filter(
    (record) => record.status === "Present"
  ).length;

  const lateCount = attendance.filter(
    (record) => record.status === "Late"
  ).length;

  const absentCount = attendance.filter(
    (record) => record.status === "Absent"
  ).length;

  const excusedCount = attendance.filter(
    (record) => record.status === "Excused"
  ).length;

  // ==========================================
  // ATTENDANCE CALCULATION
  // ==========================================

  /*
   * Present + Late = attended
   *
   * Excused = excluded
   *
   * Example:
   *
   * Present = 8
   * Late = 1
   * Absent = 1
   *
   * Applicable sessions = 10
   * Attended = 9
   *
   * Attendance = 90%
   */

  const applicableSessions = attendance.filter(
    (record) => record.status !== "Excused"
  );

  const attendedSessions =
    presentCount + lateCount;

  const attendancePercentage =
    applicableSessions.length > 0
      ? Math.round(
          (attendedSessions /
            applicableSessions.length) *
            100
        )
      : 0;

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
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2
            size={24}
            className="animate-spin"
          />

          <span>Loading attendance...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="space-y-6">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Attendance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View your attendance records and overall
          attendance percentage.
        </p>
      </div>

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-3">

            <CircleAlert
              size={22}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>

              <p className="font-medium text-red-700">
                Unable to load attendance
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ====================================== */}
      {/* CONTENT */}
      {/* ====================================== */}

      {!error && (
        <>

          {/* ================================== */}
          {/* STAT CARDS */}
          {/* ================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* OVERALL */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Attendance
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {attendancePercentage}%
                  </p>

                </div>

                <div className="rounded-lg bg-green-50 p-3">

                  <CalendarCheck
                    size={22}
                    className="text-green-600"
                  />

                </div>

              </div>

            </div>

            {/* PRESENT */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <p className="text-sm text-gray-500">
                Present
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {presentCount}
              </p>

            </div>

            {/* LATE */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <p className="text-sm text-gray-500">
                Late
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-500">
                {lateCount}
              </p>

            </div>

            {/* ABSENT */}

            <div className="rounded-xl border border-gray-200 bg-white p-5">

              <p className="text-sm text-gray-500">
                Absent
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {absentCount}
              </p>

            </div>

          </div>

          {/* ================================== */}
          {/* ATTENDANCE PROGRESS */}
          {/* ================================== */}

          <div className="rounded-xl border border-gray-200 bg-white p-5">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-semibold text-gray-900">
                  Attendance Progress
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your overall attendance rate
                </p>

              </div>

              <span className="text-xl font-bold text-gray-900">
                {attendancePercentage}%
              </span>

            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${attendancePercentage}%`,
                }}
              />

            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">

              <span>
                {presentCount} Present
              </span>

              <span>
                {lateCount} Late
              </span>

              <span>
                {absentCount} Absent
              </span>

              <span>
                {excusedCount} Excused
              </span>

            </div>

          </div>

          {/* ================================== */}
          {/* ATTENDANCE HISTORY */}
          {/* ================================== */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            {/* TABLE HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>

                <h2 className="font-semibold text-gray-900">
                  Attendance History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {attendance.length} attendance records
                </p>

              </div>

              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

            </div>

            {/* EMPTY */}

            {attendance.length === 0 ? (

              <div className="py-16 text-center">

                <CalendarCheck
                  size={40}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-4 font-medium text-gray-900">
                  No attendance records yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Your attendance will appear here when
                  records are created.
                </p>

              </div>

            ) : (

              /* TABLE */

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {[...attendance]
                      .sort((a, b) => {
                        const dateA = new Date(
                          a.sessionDate ||
                            a.createdAt ||
                            0
                        ).getTime();

                        const dateB = new Date(
                          b.sessionDate ||
                            b.createdAt ||
                            0
                        ).getTime();

                        return dateB - dateA;
                      })
                      .map((record, index) => (

                        <tr
                          key={
                            record._id ||
                            `${record.sessionDate}-${record.status}-${index}`
                          }
                          className="transition hover:bg-gray-50"
                        >

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {formatDate(
                              record.sessionDate ||
                                record.createdAt
                            )}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${getStatusStyle(
                                record.status
                              )}`}
                            >

                              {getStatusIcon(
                                record.status
                              )}

                              {record.status ||
                                "Unknown"}

                            </span>

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
  );
}

export default StudentAttendance;