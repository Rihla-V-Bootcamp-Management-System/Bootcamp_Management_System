import { useEffect, useState } from "react";
import {
  RefreshCw,
  UserCheck,
  AlertCircle,
  CalendarDays,
  Clock,
} from "lucide-react";

import apiClient from "../../services/apiClient";

const STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Late",
  "Excused",
];

function Attendance() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState({});

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [excuseStudent, setExcuseStudent] = useState(null);
  const [excuseReason, setExcuseReason] = useState("");

  // =========================================================
  // LOAD BATCHES
  // =========================================================

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/batches");

      const data =
        response.data?.batches ||
        response.data?.data ||
        response.data ||
        [];

      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "LOAD BATCHES ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load batches."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD SESSIONS FOR SELECTED BATCH
  // =========================================================

  const loadSessions = async () => {
    if (!selectedBatch) {
      setSessions([]);
      setSelectedSession("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/sessions?batchId=${selectedBatch}`
      );

      const data =
        response.data?.sessions ||
        response.data?.data ||
        [];

      const allSessions = Array.isArray(data)
        ? data
        : [];

      // -------------------------------------------------------
      // IMPORTANT
      //
      // Do NOT show future Created/Open sessions as attendance.
      //
      // Attendance becomes available once tracking starts.
      // -------------------------------------------------------

      const attendanceSessions =
        allSessions.filter((session) =>
          [
            "Tracking",
            "Stopped",
            "Reviewed",
            "Saved",
          ].includes(session.status)
        );

      // Newest session first
      attendanceSessions.sort(
        (a, b) =>
          new Date(b.sessionDate) -
          new Date(a.sessionDate)
      );

      setSessions(attendanceSessions);

      // -------------------------------------------------------
      // Automatically select newest active/completed session
      // -------------------------------------------------------

      if (attendanceSessions.length > 0) {
        setSelectedSession(
          attendanceSessions[0]._id
        );
      } else {
        setSelectedSession("");
      }
    } catch (err) {
      console.error(
        "LOAD SESSIONS ERROR:",
        err.response?.data || err
      );

      setSessions([]);
      setSelectedSession("");

      setError(
        err.response?.data?.message ||
          "Failed to load sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD STUDENTS FROM BATCH
  // =========================================================

  const loadStudents = async () => {
    if (!selectedBatch) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/batches/${selectedBatch}`
      );

      const batch =
        response.data?.batch;

      if (!batch) {
        setStudents([]);
        setError(
          "Batch data was not returned."
        );
        return;
      }

      const batchStudents =
        Array.isArray(batch.studentIds)
          ? batch.studentIds
          : [];

      setStudents(batchStudents);
    } catch (err) {
      console.error(
        "LOAD STUDENTS ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load students."
      );

      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ATTENDANCE FOR ONE SESSION
  // =========================================================

  const loadAttendance = async () => {
    if (!selectedSession) {
      setAttendance({});
      return;
    }

    try {
      setLoading(true);
      setError("");

      // IMPORTANT:
      // We now request attendance for ONE SESSION ONLY.
      const response = await apiClient.get(
        `/attendance?sessionId=${selectedSession}`
      );

      const records =
        response.data?.attendance ||
        response.data?.records ||
        response.data?.data ||
        [];

      const map = {};

      if (Array.isArray(records)) {
        records.forEach((record) => {
          const studentId =
            typeof record.studentId ===
            "object"
              ? record.studentId?._id
              : record.studentId;

          if (!studentId) {
            return;
          }

          map[String(studentId)] =
            record;
        });
      }

      setAttendance(map);
    } catch (err) {
      console.error(
        "LOAD ATTENDANCE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load attendance."
      );

      setAttendance({});
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBatches();
  }, []);

  // =========================================================
  // BATCH CHANGE
  // =========================================================

  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      setSessions([]);
      setAttendance({});
      setSelectedSession("");
      return;
    }

    setAttendance({});
    setSelectedSession("");

    loadStudents();
    loadSessions();
  }, [selectedBatch]);

  // =========================================================
  // SESSION CHANGE
  // =========================================================

  useEffect(() => {
    if (!selectedSession) {
      setAttendance({});
      return;
    }

    loadAttendance();
  }, [selectedSession]);

  // =========================================================
  // SELECTED SESSION OBJECT
  // =========================================================

  const currentSession =
    sessions.find(
      (session) =>
        String(session._id) ===
        String(selectedSession)
    ) || null;

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = async (
    studentId,
    status
  ) => {
    setError("");
    setSuccess("");

    const existing =
      attendance[String(studentId)];

    if (!existing?._id) {
      setError(
        "This student does not have an attendance record yet. Start tracking the session first."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await apiClient.put(
          `/attendance/${existing._id}`,
          {
            status,
          }
        );

      const updatedRecord =
        response.data?.attendance || {
          ...existing,
          status,
        };

      setAttendance((prev) => ({
        ...prev,
        [String(studentId)]:
          updatedRecord,
      }));

      setSuccess(
        "Attendance status updated successfully."
      );
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update attendance status."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EXCUSE STUDENT
  // =========================================================

  const handleExcuse = async () => {
    if (!excuseStudent) {
      return;
    }

    if (!excuseReason.trim()) {
      setError(
        "Please provide an excuse reason."
      );
      return;
    }

    if (!selectedSession) {
      setError(
        "Please select an attendance session."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const studentId =
        excuseStudent._id ||
        excuseStudent.id;

      // IMPORTANT:
      // Send sessionId so the excuse belongs
      // to THIS attendance session.
      const response =
        await apiClient.post(
          "/attendance/excuse",
          {
            studentId,
            batchId: selectedBatch,
            sessionId: selectedSession,
            reason:
              excuseReason.trim(),
          }
        );

      const record =
        response.data?.attendance;

      if (record) {
        setAttendance((prev) => ({
          ...prev,
          [String(studentId)]:
            record,
        }));
      }

      setExcuseStudent(null);
      setExcuseReason("");

      setSuccess(
        "Student marked as excused successfully."
      );
    } catch (err) {
      console.error(
        "EXCUSE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to excuse attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getStudentId = (student) =>
    student?._id || student?.id;

  const getStudentName = (student) => {
    if (student?.name) {
      return student.name;
    }

    return (
      [
        student?.firstName,
        student?.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Unknown Student"
    );
  };

  const getStatusClass = (status) => {
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

  const getSessionStatusClass = (
    status
  ) => {
    switch (status) {
      case "Tracking":
        return "bg-green-100 text-green-700";

      case "Stopped":
        return "bg-orange-100 text-orange-700";

      case "Reviewed":
        return "bg-purple-100 text-purple-700";

      case "Saved":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const date = new Date(time);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleTimeString();
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleString();
  };

  // =========================================================
  // REFRESH EVERYTHING
  // =========================================================

  const refreshAll = async () => {
    setError("");
    setSuccess("");

    await loadBatches();

    if (selectedBatch) {
      await loadStudents();
      await loadSessions();

      if (selectedSession) {
        await loadAttendance();
      }
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6 p-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-50 p-3">
            <UserCheck
              size={30}
              className="text-blue-600"
            />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-gray-900">
              AI Attendance Tracker
            </h1>

            <p className="text-sm text-gray-500">
              Attendance is automatically calculated
              from student check-in and check-out time.
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={refreshAll}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

          <AlertCircle size={18} />

          <span>{error}</span>

        </div>
      )}

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          BATCH + SESSION SELECTORS
      ====================================================== */}

      <div className="grid gap-5 rounded-xl border bg-white p-5 shadow-sm md:grid-cols-2">

        {/* BATCH */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Batch
          </label>

          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(
                e.target.value
              );

              setError("");
              setSuccess("");
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          >

            <option value="">
              Select a batch
            </option>

            {batches.map(
              (batch) => (
                <option
                  key={batch._id}
                  value={batch._id}
                >
                  {batch.name ||
                    batch.batchName ||
                    batch.title ||
                    "Unnamed Batch"}
                </option>
              )
            )}

          </select>

        </div>

        {/* SESSION */}

        <div>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Attendance Session
          </label>

          <select
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(
                e.target.value
              );

              setError("");
              setSuccess("");
            }}
            disabled={
              !selectedBatch ||
              sessions.length === 0
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
          >

            <option value="">
              {selectedBatch
                ? sessions.length > 0
                  ? "Select a session"
                  : "No attendance sessions yet"
                : "Select a batch first"}
            </option>

            {sessions.map(
              (session) => (
                <option
                  key={session._id}
                  value={session._id}
                >
                  Week {session.week} -{" "}
                  {formatDate(
                    session.sessionDate
                  )} -{" "}
                  {session.title ||
                    "Attendance Session"}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {/* =====================================================
          SESSION INFO
      ====================================================== */}

      {currentSession && (
        <div className="grid gap-4 md:grid-cols-4">

          {/* WEEK */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={16} />
              Week
            </div>

            <p className="mt-2 text-xl font-bold text-gray-900">
              Week{" "}
              {currentSession.week}
            </p>

          </div>

          {/* DATE */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={16} />
              Session Date
            </div>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {formatDate(
                currentSession.sessionDate
              )}
            </p>

          </div>

          {/* DURATION */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} />
              Duration
            </div>

            <p className="mt-2 text-xl font-bold text-gray-900">
              {currentSession.totalMinutes ??
                0}{" "}
              min
            </p>

          </div>

          {/* STATUS */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Session Status
            </p>

            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getSessionStatusClass(
                currentSession.status
              )}`}
            >
              {currentSession.status}
            </span>

          </div>

        </div>
      )}

      {/* =====================================================
          NO SESSION
      ====================================================== */}

      {selectedBatch &&
        !selectedSession &&
        !loading && (
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">

            <CalendarDays
              size={40}
              className="mx-auto mb-3 text-gray-400"
            />

            <h3 className="font-semibold text-gray-900">
              No attendance session available
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Start tracking a session first.
              Future sessions will not appear here.
            </p>

          </div>
        )}

      {/* =====================================================
          STUDENT ATTENDANCE
      ====================================================== */}

      {selectedSession && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex flex-col justify-between gap-4 border-b p-5 md:flex-row md:items-center">

            <div>

              <h2 className="font-semibold text-gray-900">
                Student Attendance
              </h2>

              <p className="text-sm text-gray-500">
                {currentSession?.title ||
                  "Attendance Session"}
                {" • "}
                Week{" "}
                {currentSession?.week}
                {" • "}
                {formatDate(
                  currentSession?.sessionDate
                )}
              </p>

            </div>

            <div className="text-sm text-gray-500">
              {students.length} student
              {students.length === 1
                ? ""
                : "s"}
            </div>

          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">

              <RefreshCw
                size={24}
                className="mx-auto mb-3 animate-spin"
              />

              Loading attendance...

            </div>
          ) : students.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No students found in this batch.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Check In
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Check Out
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Time
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Percentage
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {students.map(
                    (student) => {

                      const studentId =
                        getStudentId(
                          student
                        );

                      const record =
                        attendance[
                          String(
                            studentId
                          )
                        ];

                      return (
                        <tr
                          key={studentId}
                          className="border-t transition hover:bg-gray-50"
                        >

                          {/* STUDENT */}

                          <td className="px-5 py-4 font-medium text-gray-900">
                            {getStudentName(
                              student
                            )}
                          </td>

                          {/* EMAIL */}

                          <td className="px-5 py-4 text-sm text-gray-500">
                            {student.email ||
                              "-"}
                          </td>

                          {/* CHECK IN */}

                          <td className="px-5 py-4 text-sm">
                            {formatTime(
                              record?.checkInTime
                            )}
                          </td>

                          {/* CHECK OUT */}

                          <td className="px-5 py-4 text-sm">
                            {formatTime(
                              record?.checkOutTime
                            )}
                          </td>

                          {/* MINUTES */}

                          <td className="px-5 py-4">

                            {record
                              ? `${record.attendedMinutes ?? 0} min`
                              : "0 min"}

                          </td>

                          {/* PERCENTAGE */}

                          <td className="px-5 py-4 font-medium">

                            {record
                              ? `${record.attendancePercentage ?? 0}%`
                              : "0%"}

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <select
                              value={
                                record?.status ||
                                "Absent"
                              }
                              disabled={
                                saving ||
                                !record?._id
                              }
                              onChange={(
                                e
                              ) =>
                                handleStatusChange(
                                  studentId,
                                  e.target.value
                                )
                              }
                              className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none ${getStatusClass(
                                record?.status ||
                                  "Absent"
                              )}`}
                            >

                              {STATUS_OPTIONS.map(
                                (
                                  status
                                ) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {
                                      status
                                    }
                                  </option>
                                )
                              )}

                            </select>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <button
                              type="button"
                              disabled={
                                !record?._id ||
                                saving
                              }
                              onClick={() => {
                                setExcuseStudent(
                                  student
                                );

                                setExcuseReason(
                                  ""
                                );

                                setError(
                                  ""
                                );
                              }}
                              className="rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Excuse
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

      {/* =====================================================
          EXCUSE MODAL
      ====================================================== */}

      {excuseStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h2 className="text-lg font-bold text-gray-900">
              Approve Excuse
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {getStudentName(
                excuseStudent
              )}
            </p>

            <textarea
              value={excuseReason}
              onChange={(e) =>
                setExcuseReason(
                  e.target.value
                )
              }
              placeholder="Enter the reason for the excuse..."
              className="mt-4 min-h-32 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            />

            <div className="mt-5 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setExcuseStudent(
                    null
                  );
                  setExcuseReason("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleExcuse}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Approve Excuse"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Attendance;