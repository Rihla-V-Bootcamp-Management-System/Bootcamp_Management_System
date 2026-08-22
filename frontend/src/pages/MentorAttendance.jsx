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
  // =========================================================
  // STATE
  // =========================================================

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return "border-green-200 bg-green-50 text-green-700";

      case "Absent":
        return "border-red-200 bg-red-50 text-red-700";

      case "Late":
        return "border-orange-200 bg-orange-50 text-orange-700";

      case "Excused":
        return "border-blue-200 bg-blue-50 text-blue-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

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

  // =========================================================
  // CALCULATE ATTENDANCE PERCENTAGE
  //
  // Present = counted as attendance
  // Late = counted as attendance
  // Absent = not counted
  // Excused = ignored
  // =========================================================

  const calculatePercentage = (records) => {
    if (!Array.isArray(records) || records.length === 0) {
      return 0;
    }

    const applicableRecords = records.filter(
      (record) => record.status !== "Excused"
    );

    if (applicableRecords.length === 0) {
      return 0;
    }

    const attendedRecords = applicableRecords.filter(
      (record) =>
        record.status === "Present" ||
        record.status === "Late"
    );

    return Number(
      (
        (attendedRecords.length / applicableRecords.length) *
        100
      ).toFixed(1)
    );
  };

  // =========================================================
  // BUILD STUDENT LIST
  // =========================================================

  const buildStudents = (records) => {
    if (!Array.isArray(records)) {
      return [];
    }

    const studentsMap = new Map();

    records.forEach((record) => {
      if (!record?.studentId) {
        return;
      }

      const student = record.studentId;

      // -----------------------------------------------
      // Populated student
      // -----------------------------------------------

      if (typeof student === "object") {
        const studentId = student._id;

        if (!studentId) {
          return;
        }

        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            id: studentId,
            name: student.name || "Unknown Student",
            studentId:
              student.userID ||
              student.studentId ||
              student.email ||
              studentId,
            records: [],
          });
        }

        studentsMap.get(studentId).records.push(record);

        return;
      }

      // -----------------------------------------------
      // Non-populated ObjectId fallback
      // -----------------------------------------------

      const studentId = student.toString();

      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          id: studentId,
          name: "Unknown Student",
          studentId,
          records: [],
        });
      }

      studentsMap.get(studentId).records.push(record);
    });

    // =====================================================
    // FORMAT STUDENTS
    // =====================================================

    return Array.from(studentsMap.values()).map((student) => {
      const sortedRecords = [...student.records].sort(
        (a, b) => {
          const dateA = new Date(
            a.sessionDate || a.createdAt || 0
          );

          const dateB = new Date(
            b.sessionDate || b.createdAt || 0
          );

          return dateB - dateA;
        }
      );

      const latestRecord = sortedRecords[0];

      return {
        id: student.id,
        name: student.name,
        studentId: student.studentId,

        percentage: calculatePercentage(
          student.records
        ),

        status: latestRecord?.status || "No Record",
      };
    });
  };

  // =========================================================
  // FETCH MENTOR ATTENDANCE
  // =========================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------------------
      // STEP 1: GET MENTOR'S ASSIGNED BATCH
      // -----------------------------------------------------

      const batchResponse = await apiClient.get(
        "/mentor/my-batch"
      );

      const mentorBatch = batchResponse.data?.batch;

      if (!mentorBatch?._id) {
        throw new Error(
          "No batch has been assigned to you."
        );
      }

      setBatch(mentorBatch);

      // -----------------------------------------------------
      // STEP 2: GET ATTENDANCE FOR THAT BATCH
      // -----------------------------------------------------

      const attendanceResponse = await apiClient.get(
        `/attendance?batchId=${mentorBatch._id}`
      );

      const records =
        attendanceResponse.data?.attendance || [];

      // -----------------------------------------------------
      // STEP 3: BUILD STUDENTS
      // -----------------------------------------------------

      const formattedStudents =
        buildStudents(records);

      setStudents(formattedStudents);
    } catch (err) {
      console.error(
        "Failed to load mentor attendance:",
        err
      );

      setBatch(null);
      setStudents([]);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
            "You are not allowed to view this attendance."
        );
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
            "No batch or attendance endpoint was found."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load attendance."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchAttendance();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchAttendance();
  };

  // =========================================================
  // TODAY
  // =========================================================

  const sessionDate = new Date()
    .toISOString()
    .split("T")[0];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View attendance records for your assigned students.
        </p>
      </div>

      {/* =====================================================
          BATCH INFORMATION
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Batch */}

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
                {loading
                  ? "Loading..."
                  : batch?.name || "No batch assigned"}
              </span>
            </div>
          </div>

          {/* Session Date */}

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

      {/* =====================================================
          VIEW ONLY NOTICE
      ====================================================== */}

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <CalendarCheck
            size={19}
            className="shrink-0 text-blue-600"
          />

          <div>
            <p className="text-sm font-medium text-blue-800">
              View-only attendance
            </p>

            <p className="mt-1 text-xs text-blue-700">
              Attendance is managed by the administrator.
              Mentors can only view attendance for their
              assigned students.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <CircleAlert
              size={22}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-medium text-red-800">
                Unable to load attendance
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ATTENDANCE CARD
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Header */}

        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Student Attendance
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Loading attendance..."
                : `${students.length} student${
                    students.length === 1 ? "" : "s"
                  } with attendance records`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
            <Loader2
              size={22}
              className="animate-spin"
            />

            <span>Loading attendance...</span>
          </div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          students.length === 0 && (
            <div className="py-16 text-center">
              <CalendarCheck
                size={40}
                className="mx-auto text-gray-300"
              />

              <p className="mt-4 font-medium text-gray-900">
                No attendance records found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                There are currently no attendance records
                for your assigned batch.
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          )}

        {/* ===================================================
            TABLE
        ==================================================== */}

        {!loading &&
          !error &&
          students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Student
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Attendance
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Latest Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Student */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {student.name
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {student.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {student.studentId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Percentage */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-green-500 transition-all"
                              style={{
                                width: `${Math.min(
                                  student.percentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-sm font-medium text-gray-700">
                            {student.percentage}%
                          </span>
                        </div>
                      </td>

                      {/* Latest Status */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${getStatusStyle(
                            student.status
                          )}`}
                        >
                          {getStatusIcon(student.status)}

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
  );
}

export default MentorAttendance;