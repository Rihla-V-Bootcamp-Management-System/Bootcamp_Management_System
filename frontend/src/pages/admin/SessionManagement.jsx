import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Play,
  Square,
  Eye,
  Save,
  Unlock,
  X,
  Users,
  Check,
  Clock,
  UserX,
} from "lucide-react";

import apiClient from "../../services/apiClient";

function SessionManagement() {
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  const [loading, setLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    batchId: "",
    title: "",
    sessionDate: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
  });

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
      console.error("LOAD BATCHES ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load batches."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD SESSIONS
  // =========================================================

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (selectedBatch) {
        params.batchId = selectedBatch;
      }

      const response = await apiClient.get("/sessions", {
        params,
      });

      const data =
        response.data?.sessions ||
        response.data?.data ||
        [];

      const sessionList =
        Array.isArray(data) ? data : [];

      setSessions(sessionList);

      // If currently selected session exists,
      // update it with the latest version.
      if (selectedSession?._id) {
        const updated =
          sessionList.find(
            (item) =>
              String(item._id) ===
              String(selectedSession._id)
          );

        if (updated) {
          setSelectedSession(updated);
        }
      }
    } catch (err) {
      console.error("LOAD SESSIONS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ATTENDANCE FOR SESSION
  // =========================================================

  const loadAttendance = async (sessionId) => {
    if (!sessionId) {
      setAttendance([]);
      return;
    }

    try {
      setAttendanceLoading(true);
      setError("");

      const response = await apiClient.get(
        "/attendance",
        {
          params: {
            sessionId,
          },
        }
      );

      console.log(
        "ATTENDANCE RESPONSE:",
        response.data
      );

      const data =
        response.data?.attendance ||
        response.data?.records ||
        response.data?.data ||
        response.data ||
        [];

      setAttendance(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "LOAD ATTENDANCE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load students."
      );

      setAttendance([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBatches();
    loadSessions();
  }, []);

  // =========================================================
  // FILTER BY BATCH
  // =========================================================

  useEffect(() => {
    loadSessions();
  }, [selectedBatch]);

  // =========================================================
  // AUTO REFRESH ATTENDANCE WHILE TRACKING
  // =========================================================

  useEffect(() => {
    if (!selectedSession?._id) {
      return;
    }

    loadAttendance(selectedSession._id);

    // Refresh students every 5 seconds while tracking.
    if (
      selectedSession.status === "Tracking"
    ) {
      const interval = setInterval(() => {
        loadAttendance(selectedSession._id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [
    selectedSession?._id,
    selectedSession?.status,
  ]);

  // =========================================================
  // CALCULATE WEEK
  // =========================================================

  const calculateWeek = (
    batchStartDate,
    sessionDate
  ) => {
    if (!batchStartDate || !sessionDate) {
      return null;
    }

    const start = new Date(batchStartDate);
    const session = new Date(sessionDate);

    start.setHours(0, 0, 0, 0);
    session.setHours(0, 0, 0, 0);

    const difference =
      session.getTime() -
      start.getTime();

    const daysDifference = Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (daysDifference < 0) {
      return null;
    }

    return (
      Math.floor(daysDifference / 7) + 1
    );
  };

  // =========================================================
  // GET SELECTED BATCH
  // =========================================================

  const getSelectedBatch = () => {
    return batches.find(
      (batch) =>
        String(batch._id) ===
        String(form.batchId)
    );
  };

  // =========================================================
  // CREATE SESSION
  // =========================================================

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.batchId) {
        setError("Please select a batch.");
        return;
      }

      if (!form.sessionDate) {
        setError(
          "Please select a session date."
        );
        return;
      }

      const selectedBatchData =
        getSelectedBatch();

      if (!selectedBatchData) {
        setError(
          "Selected batch was not found."
        );
        return;
      }

      const batchStartDate =
        selectedBatchData.startDate;

      if (!batchStartDate) {
        setError(
          "This batch does not have a start date."
        );
        return;
      }

      const week = calculateWeek(
        batchStartDate,
        form.sessionDate
      );

      if (!week || week < 1) {
        setError(
          "Session date cannot be before the batch start date."
        );
        return;
      }

      const payload = {
        batchId: form.batchId,

        title:
          form.title.trim() ||
          "Attendance Session",

        week,

        sessionDate:
          form.sessionDate,
      };

      if (form.scheduledStartTime) {
        payload.scheduledStartTime =
          form.scheduledStartTime;
      }

      if (form.scheduledEndTime) {
        payload.scheduledEndTime =
          form.scheduledEndTime;
      }

      await apiClient.post(
        "/sessions",
        payload
      );

      setSuccess(
        `Session created successfully for Week ${week}.`
      );

      setShowCreate(false);

      setForm({
        batchId: "",
        title: "",
        sessionDate: "",
        scheduledStartTime: "",
        scheduledEndTime: "",
      });

      await loadSessions();
    } catch (err) {
      console.error(
        "CREATE SESSION ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create session."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SESSION ACTION
  // =========================================================

  const sessionAction = async (
    session,
    action
  ) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      setSelectedSession(session);

      const response =
        await apiClient.post(
          `/sessions/${session._id}/${action}`
        );

      const messages = {
        open:
          "Session opened successfully.",

        start:
          "Attendance tracking started successfully.",

        stop:
          "Attendance tracking stopped successfully.",

        review:
          "Session reviewed successfully.",

        save:
          "Session saved successfully.",
      };

      setSuccess(
        messages[action] ||
          "Session updated successfully."
      );

      await loadSessions();

      // Get updated session directly
      const updatedSession =
        response.data?.session;

      if (updatedSession) {
        setSelectedSession(
          updatedSession
        );

        // VERY IMPORTANT:
        // When START is clicked, load the students.
        if (action === "start") {
          await loadAttendance(
            updatedSession._id
          );
        }

        // Also reload after stop/review.
        if (
          action === "stop" ||
          action === "review"
        ) {
          await loadAttendance(
            updatedSession._id
          );
        }
      } else {
        await loadAttendance(
          session._id
        );
      }

      return response;
    } catch (err) {
      console.error(
        `${action.toUpperCase()} SESSION ERROR:`,
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          `Failed to ${action} session.`
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SELECT SESSION
  // =========================================================

  const handleSelectSession = async (
    session
  ) => {
    setSelectedSession(session);
    setError("");

    await loadAttendance(
      session._id
    );
  };

  // =========================================================
  // UPDATE STUDENT STATUS
  // =========================================================

  const updateStudentStatus = async (
    record,
    status
  ) => {
    if (!record?._id) {
      setError(
        "Attendance record ID is missing."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await apiClient.put(
          `/attendance/${record._id}`,
          {
            status,
            manuallyOverridden: true,
          }
        );

      const updated =
        response.data?.attendance ||
        response.data?.record ||
        response.data?.data;

      if (updated) {
        setAttendance((prev) =>
          prev.map((item) =>
            String(item._id) ===
            String(record._id)
              ? updated
              : item
          )
        );
      } else {
        await loadAttendance(
          selectedSession?._id
        );
      }

      setSuccess(
        "Student attendance updated."
      );
    } catch (err) {
      console.error(
        "UPDATE ATTENDANCE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Created":
        return "bg-gray-100 text-gray-700";

      case "Open":
        return "bg-blue-100 text-blue-700";

      case "Tracking":
        return "bg-green-100 text-green-700";

      case "Stopped":
        return "bg-orange-100 text-orange-700";

      case "Reviewed":
        return "bg-purple-100 text-purple-700";

      case "Saved":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // =========================================================
  // ATTENDANCE STATUS STYLE
  // =========================================================

  const getAttendanceStatusClass = (
    status
  ) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";

      case "Late":
        return "bg-orange-100 text-orange-700";

      case "Excused":
        return "bg-purple-100 text-purple-700";

      case "Absent":
      default:
        return "bg-red-100 text-red-700";
    }
  };

  // =========================================================
  // ACTION BUTTON
  // =========================================================

  const renderAction = (session) => {
    switch (session.status) {
      case "Created":
        return (
          <button
            onClick={() =>
              sessionAction(
                session,
                "open"
              )
            }
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Unlock size={15} />
            Open
          </button>
        );

      case "Open":
        return (
          <button
            onClick={() =>
              sessionAction(
                session,
                "start"
              )
            }
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Play size={15} />
            Start
          </button>
        );

      case "Tracking":
        return (
          <button
            onClick={() =>
              sessionAction(
                session,
                "stop"
              )
            }
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Square size={15} />
            Stop
          </button>
        );

      case "Stopped":
        return (
          <button
            onClick={() =>
              sessionAction(
                session,
                "review"
              )
            }
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Eye size={15} />
            Review
          </button>
        );

      case "Reviewed":
        return (
          <button
            onClick={() =>
              sessionAction(
                session,
                "save"
              )
            }
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save size={15} />
            Save
          </button>
        );

      case "Saved":
        return (
          <span className="text-sm font-medium text-green-600">
            ✓ Completed
          </span>
        );

      default:
        return null;
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  // =========================================================
  // FORMAT DATETIME
  // =========================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString();
  };

  // =========================================================
  // GET STUDENT NAME
  // =========================================================

  const getStudentName = (record) => {
    const student =
      record.studentId;

    if (
      student &&
      typeof student === "object"
    ) {
      return (
        student.name ||
        student.fullName ||
        student.username ||
        student.email ||
        String(student._id)
      );
    }

    return (
      record.studentName ||
      record.name ||
      String(student || "Unknown Student")
    );
  };

  // =========================================================
  // GET STUDENT EMAIL
  // =========================================================

  const getStudentEmail = (record) => {
    const student =
      record.studentId;

    if (
      student &&
      typeof student === "object"
    ) {
      return student.email || "";
    }

    return record.email || "";
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const presentCount =
    attendance.filter(
      (item) =>
        item.status === "Present"
    ).length;

  const absentCount =
    attendance.filter(
      (item) =>
        item.status === "Absent"
    ).length;

  const lateCount =
    attendance.filter(
      (item) =>
        item.status === "Late"
    ).length;

  const excusedCount =
    attendance.filter(
      (item) =>
        item.status === "Excused"
    ).length;

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setError("");
    setSuccess("");

    setForm({
      batchId:
        selectedBatch || "",
      title: "",
      sessionDate: "",
      scheduledStartTime: "",
      scheduledEndTime: "",
    });

    setShowCreate(true);
  };

  // =========================================================
  // SELECTED BATCH PREVIEW
  // =========================================================

  const selectedBatchForForm =
    getSelectedBatch();

  const previewWeek =
    selectedBatchForForm &&
    form.sessionDate
      ? calculateWeek(
          selectedBatchForForm.startDate,
          form.sessionDate
        )
      : null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6 p-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attendance Sessions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage attendance
            tracking sessions.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => {
              loadBatches();
              loadSessions();

              if (
                selectedSession?._id
              ) {
                loadAttendance(
                  selectedSession._id
                );
              }
            }}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={17} />

            Create Session
          </button>

        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

          <span>{error}</span>

          <button
            onClick={() =>
              setError("")
            }
            className="rounded p-1 hover:bg-red-100"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">

          <span>{success}</span>

          <button
            onClick={() =>
              setSuccess("")
            }
            className="rounded p-1 hover:bg-green-100"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* =====================================================
          FILTER
      ====================================================== */}

      <div className="rounded-xl border bg-white p-5 shadow-sm">

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Filter by Batch
        </label>

        <select
          value={selectedBatch}
          onChange={(e) =>
            setSelectedBatch(
              e.target.value
            )
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 md:w-96"
        >

          <option value="">
            All Batches
          </option>

          {batches.map((batch) => (
            <option
              key={batch._id}
              value={batch._id}
            >
              {batch.name ||
                batch.batchName ||
                batch.title ||
                "Unnamed Batch"}
            </option>
          ))}

        </select>

      </div>

      {/* =====================================================
          SESSION TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b p-5">

          <h2 className="font-semibold text-gray-900">
            Sessions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Click a session to view its students.
          </p>

        </div>

        {loading ? (

          <div className="p-10 text-center text-gray-500">

            <RefreshCw
              size={22}
              className="mx-auto mb-3 animate-spin"
            />

            Loading sessions...

          </div>

        ) : sessions.length === 0 ? (

          <div className="p-10 text-center text-gray-500">
            No sessions found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Session
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Batch
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Week
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Duration
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

                {sessions.map(
                  (session) => (

                    <tr
                      key={session._id}
                      onClick={() =>
                        handleSelectSession(
                          session
                        )
                      }
                      className={`cursor-pointer border-t transition hover:bg-blue-50 ${
                        selectedSession?._id ===
                        session._id
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >

                      <td className="px-5 py-4">

                        <div className="font-medium text-gray-900">
                          {session.title ||
                            "Attendance Session"}
                        </div>

                        {session.startedAt && (
                          <div className="mt-1 text-xs text-gray-500">
                            Started:{" "}
                            {formatDateTime(
                              session.startedAt
                            )}
                          </div>
                        )}

                        {session.endedAt && (
                          <div className="mt-1 text-xs text-gray-500">
                            Ended:{" "}
                            {formatDateTime(
                              session.endedAt
                            )}
                          </div>
                        )}

                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {session.batchId
                          ?.name ||
                          session.batchId
                            ?.batchName ||
                          "-"}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-700">
                        Week{" "}
                        {session.week ||
                          "-"}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {formatDate(
                          session.sessionDate
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {session.totalMinutes !=
                        null
                          ? `${session.totalMinutes} min`
                          : "0 min"}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            session.status
                          )}`}
                        >
                          {session.status}
                        </span>

                      </td>

                      <td
                        className="px-5 py-4"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        {renderAction(
                          session
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          STUDENT ATTENDANCE
      ====================================================== */}

      {selectedSession && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b p-5">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>

                <div className="flex items-center gap-3">

                  <Users
                    size={22}
                    className="text-blue-600"
                  />

                  <h2 className="text-lg font-bold text-gray-900">
                    Students
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      selectedSession.status
                    )}`}
                  >
                    {selectedSession.status}
                  </span>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedSession.title ||
                    "Attendance Session"}{" "}
                  — Week{" "}
                  {selectedSession.week}
                </p>

              </div>

              <button
                onClick={() =>
                  loadAttendance(
                    selectedSession._id
                  )
                }
                disabled={
                  attendanceLoading
                }
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    attendanceLoading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh Students
              </button>

            </div>

            {/* COUNTERS */}

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

              <div className="rounded-lg bg-green-50 p-3">

                <div className="flex items-center gap-2 text-green-700">

                  <Check size={17} />

                  <span className="text-sm font-medium">
                    Present
                  </span>

                </div>

                <p className="mt-1 text-xl font-bold text-green-700">
                  {presentCount}
                </p>

              </div>

              <div className="rounded-lg bg-red-50 p-3">

                <div className="flex items-center gap-2 text-red-700">

                  <UserX size={17} />

                  <span className="text-sm font-medium">
                    Absent
                  </span>

                </div>

                <p className="mt-1 text-xl font-bold text-red-700">
                  {absentCount}
                </p>

              </div>

              <div className="rounded-lg bg-orange-50 p-3">

                <div className="flex items-center gap-2 text-orange-700">

                  <Clock size={17} />

                  <span className="text-sm font-medium">
                    Late
                  </span>

                </div>

                <p className="mt-1 text-xl font-bold text-orange-700">
                  {lateCount}
                </p>

              </div>

              <div className="rounded-lg bg-purple-50 p-3">

                <div className="flex items-center gap-2 text-purple-700">

                  <Users size={17} />

                  <span className="text-sm font-medium">
                    Excused
                  </span>

                </div>

                <p className="mt-1 text-xl font-bold text-purple-700">
                  {excusedCount}
                </p>

              </div>

            </div>

          </div>

          {/* STUDENTS */}

          {attendanceLoading ? (

            <div className="p-10 text-center text-gray-500">

              <RefreshCw
                size={22}
                className="mx-auto mb-3 animate-spin"
              />

              Loading students...

            </div>

          ) : attendance.length === 0 ? (

            <div className="p-10 text-center">

              <Users
                size={35}
                className="mx-auto mb-3 text-gray-300"
              />

              <p className="font-medium text-gray-700">
                No students found
              </p>

              {selectedSession.status ===
                "Created" ||
              selectedSession.status ===
                "Open" ? (
                <p className="mt-1 text-sm text-gray-500">
                  Click{" "}
                  <strong>Start</strong>{" "}
                  to create attendance
                  records for all students.
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Make sure students are
                  assigned to this batch.
                </p>
              )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      #
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Check In
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Check Out
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Minutes
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                      Arrange
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {attendance.map(
                    (record, index) => (

                      <tr
                        key={
                          record._id ||
                          index
                        }
                        className="border-t hover:bg-gray-50"
                      >

                        {/* NUMBER */}

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>

                        {/* STUDENT */}

                        <td className="px-5 py-4">

                          <div className="font-medium text-gray-900">
                            {getStudentName(
                              record
                            )}
                          </div>

                          {getStudentEmail(
                            record
                          ) && (
                            <div className="mt-1 text-xs text-gray-500">
                              {getStudentEmail(
                                record
                              )}
                            </div>
                          )}

                        </td>

                        {/* CHECK IN */}

                        <td className="px-5 py-4 text-sm text-gray-600">

                          {record.checkInTime
                            ? formatDateTime(
                                record.checkInTime
                              )
                            : "-"}

                        </td>

                        {/* CHECK OUT */}

                        <td className="px-5 py-4 text-sm text-gray-600">

                          {record.checkOutTime
                            ? formatDateTime(
                                record.checkOutTime
                              )
                            : "-"}

                        </td>

                        {/* MINUTES */}

                        <td className="px-5 py-4 text-sm font-medium text-gray-700">

                          {record.attendedMinutes ||
                            0}{" "}
                          min

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAttendanceStatusClass(
                              record.status
                            )}`}
                          >
                            {record.status ||
                              "Absent"}
                          </span>

                        </td>

                        {/* ARRANGE */}

                        <td className="px-5 py-4">

                          <div className="flex flex-wrap gap-2">

                            <button
                              onClick={() =>
                                updateStudentStatus(
                                  record,
                                  "Present"
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-md bg-green-100 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 disabled:opacity-50"
                            >
                              Present
                            </button>

                            <button
                              onClick={() =>
                                updateStudentStatus(
                                  record,
                                  "Absent"
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                            >
                              Absent
                            </button>

                            <button
                              onClick={() =>
                                updateStudentStatus(
                                  record,
                                  "Late"
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-md bg-orange-100 px-2.5 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                            >
                              Late
                            </button>

                            <button
                              onClick={() =>
                                updateStudentStatus(
                                  record,
                                  "Excused"
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-md bg-purple-100 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                            >
                              Excused
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>
      )}

      {/* =====================================================
          CREATE SESSION MODAL
      ====================================================== */}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Create Session
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  The week is calculated
                  automatically.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleCreate}
              className="space-y-4"
            >

              {/* BATCH */}

              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Batch
                </label>

                <select
                  value={form.batchId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      batchId:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                >

                  <option value="">
                    Select batch
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

              {/* TITLE */}

              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Session Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. React Session"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* DATE */}

              <div>

                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Session Date
                </label>

                <input
                  type="date"
                  value={
                    form.sessionDate
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sessionDate:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />

              </div>

              {/* WEEK */}

              {form.batchId &&
                form.sessionDate && (

                  <div
                    className={`rounded-lg border p-3 text-sm ${
                      previewWeek
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >

                    {previewWeek ? (
                      <>
                        <strong>
                          Week {previewWeek}
                        </strong>

                        <span className="ml-1">
                          will be assigned.
                        </span>
                      </>
                    ) : (
                      <>
                        The selected date is
                        before the batch start
                        date.
                      </>
                    )}

                  </div>

                )}

              {/* SCHEDULE */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Scheduled Start
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      form.scheduledStartTime
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scheduledStartTime:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Scheduled End
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      form.scheduledEndTime
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scheduledEndTime:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !previewWeek
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Session"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default SessionManagement;