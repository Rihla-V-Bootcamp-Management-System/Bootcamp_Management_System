import { useEffect, useMemo, useState } from "react";
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
  const [batch, setBatch] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [selectedWeek, setSelectedWeek] = useState("all");

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
  // LOAD ATTENDANCE
  // =========================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // GET MENTOR BATCH
      // -------------------------------------------------------

      const batchResponse = await apiClient.get(
        "/mentor/my-batch"
      );

      const mentorBatch =
        batchResponse.data?.batch ||
        batchResponse.data;

      if (!mentorBatch?._id) {
        throw new Error(
          "No batch has been assigned to you."
        );
      }

      setBatch(mentorBatch);

      // -------------------------------------------------------
      // GET ATTENDANCE
      // -------------------------------------------------------

      const attendanceResponse =
        await apiClient.get(
          `/attendance?batchId=${mentorBatch._id}`
        );

      console.log(
        "Mentor attendance response:",
        attendanceResponse.data
      );

      let records = [];

      if (Array.isArray(attendanceResponse.data)) {
        records = attendanceResponse.data;
      } else if (
        Array.isArray(
          attendanceResponse.data?.attendance
        )
      ) {
        records =
          attendanceResponse.data.attendance;
      } else if (
        Array.isArray(
          attendanceResponse.data?.records
        )
      ) {
        records =
          attendanceResponse.data.records;
      } else if (
        Array.isArray(
          attendanceResponse.data?.data
        )
      ) {
        records =
          attendanceResponse.data.data;
      }

      setAttendance(records);
    } catch (err) {
      console.error(
        "Failed to load mentor attendance:",
        err.response?.data || err.message
      );

      setBatch(null);
      setAttendance([]);

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
            "No assigned batch was found."
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
  // AVAILABLE WEEKS
  // =========================================================

  const weeks = useMemo(() => {
    const uniqueWeeks = [
      ...new Set(
        attendance
          .map((record) => record.week)
          .filter(
            (week) =>
              week !== undefined &&
              week !== null
          )
      ),
    ];

    return uniqueWeeks.sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [attendance]);

  // =========================================================
  // FILTER BY WEEK
  // =========================================================

  const filteredAttendance = useMemo(() => {
    if (selectedWeek === "all") {
      return attendance;
    }

    return attendance.filter(
      (record) =>
        Number(record.week) ===
        Number(selectedWeek)
    );
  }, [attendance, selectedWeek]);

  // =========================================================
  // BUILD STUDENTS
  // =========================================================

  const students = useMemo(() => {
    const studentsMap = new Map();

    filteredAttendance.forEach((record) => {
      if (!record?.studentId) {
        return;
      }

      const student = record.studentId;

      let studentId;
      let name;
      let displayId;

      if (typeof student === "object") {
        studentId = student._id;

        name =
          student.name ||
          student.fullName ||
          "Unknown Student";

        displayId =
          student.userID ||
          student.studentId ||
          student.email ||
          studentId;
      } else {
        studentId = String(student);
        name = "Unknown Student";
        displayId = studentId;
      }

      if (!studentId) {
        return;
      }

      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          id: studentId,
          name,
          studentId: displayId,
          records: [],
        });
      }

      studentsMap
        .get(studentId)
        .records.push(record);
    });

    return Array.from(
      studentsMap.values()
    ).map((student) => {
      const records = [...student.records].sort(
        (a, b) => {
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
        }
      );

      const applicableRecords =
        records.filter(
          (record) =>
            record.status !== "Excused"
        );

      const attendedRecords =
        applicableRecords.filter(
          (record) =>
            record.status === "Present" ||
            record.status === "Late"
        );

      const percentage =
        applicableRecords.length > 0
          ? Math.round(
              (attendedRecords.length /
                applicableRecords.length) *
                100
            )
          : 0;

      return {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        records,
        percentage,
        latestStatus:
          records[0]?.status ||
          "No Record",
      };
    });
  }, [filteredAttendance]);

  // =========================================================
  // OVERALL STATS
  // =========================================================

  const stats = useMemo(() => {
    const present = filteredAttendance.filter(
      (record) =>
        record.status === "Present"
    ).length;

    const late = filteredAttendance.filter(
      (record) =>
        record.status === "Late"
    ).length;

    const absent = filteredAttendance.filter(
      (record) =>
        record.status === "Absent"
    ).length;

    const excused = filteredAttendance.filter(
      (record) =>
        record.status === "Excused"
    ).length;

    const applicable =
      filteredAttendance.filter(
        (record) =>
          record.status !== "Excused"
      ).length;

    const attended = present + late;

    const percentage =
      applicable > 0
        ? Math.round(
            (attended / applicable) * 100
          )
        : 0;

    return {
      present,
      late,
      absent,
      excused,
      percentage,
    };
  }, [filteredAttendance]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2
            size={24}
            className="animate-spin"
          />

          <span>
            Loading attendance...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View attendance records for your assigned students.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAttendance}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
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
                onClick={fetchAttendance}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>

          </div>
        </div>
      )}

      {!error && (
        <>

          {/* =================================================
              BATCH + WEEK
          ================================================= */}

          <div className="rounded-xl border border-gray-200 bg-white p-5">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

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
                    {batch?.name ||
                      "No batch assigned"}
                  </span>

                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Week
                </label>

                <select
                  value={selectedWeek}
                  onChange={(e) =>
                    setSelectedWeek(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-500"
                >
                  <option value="all">
                    All Weeks
                  </option>

                  {weeks.map((week) => (
                    <option
                      key={week}
                      value={week}
                    >
                      Week {week}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* =================================================
              NOTICE
          ================================================= */}

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
                  assigned batch.
                </p>

              </div>

            </div>
          </div>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">
                Attendance
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.percentage}%
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">
                Present
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {stats.present}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">
                Late
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-500">
                {stats.late}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">
                Absent
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {stats.absent}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">
                Excused
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {stats.excused}
              </p>
            </div>

          </div>

          {/* =================================================
              STUDENTS
          ================================================= */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            <div className="border-b border-gray-200 px-5 py-4">

              <h2 className="font-semibold text-gray-900">
                Student Attendance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {students.length} student
                {students.length === 1
                  ? ""
                  : "s"}
              </p>

            </div>

            {students.length === 0 ? (
              <div className="py-16 text-center">

                <CalendarCheck
                  size={40}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-4 font-medium text-gray-900">
                  No attendance records found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Attendance recorded by the administrator
                  will appear here.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Student
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Week
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {students.map((student) => {

                      const latest =
                        student.records[0];

                      return (
                        <tr
                          key={student.id}
                          className="transition hover:bg-gray-50"
                        >

                          {/* STUDENT */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                                {student.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "?"}
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

                          {/* WEEK */}

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {latest?.week
                              ? `Week ${latest.week}`
                              : "-"}
                          </td>

                          {/* DATE */}

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {formatDate(
                              latest?.sessionDate ||
                                latest?.createdAt
                            )}
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

        </>
      )}
    </div>
  );
}

export default MentorAttendance;