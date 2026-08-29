import { useEffect, useState } from "react";
import {
  RefreshCw,
  UserCheck,
  AlertCircle,
  CalendarDays,
  Clock,
  Eye,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Video,
  Users,
  Zap,
} from "lucide-react";

import apiClient from "../../services/apiClient";

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Excused"];

function Attendance() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState({});

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  // Google Meet preview state
  const [gmPreview, setGmPreview] = useState(null);
  const [gmLoading, setGmLoading] = useState(false);
  const [gmError, setGmError] = useState("");
  const [expandedParticipants, setExpandedParticipants] = useState({});

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
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
      const data = response.data?.batches || response.data?.data || response.data || [];
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load batches.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD SESSIONS
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
      const response = await apiClient.get(`/sessions?batchId=${selectedBatch}`);
      const data = response.data?.sessions || response.data?.data || [];
      const allSessions = Array.isArray(data) ? data : [];
      const attendanceSessions = allSessions.filter((s) =>
        ["Tracking", "Stopped", "Reviewed", "Saved"].includes(s.status)
      );
      attendanceSessions.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));
      setSessions(attendanceSessions);
      if (attendanceSessions.length > 0) {
        setSelectedSession(attendanceSessions[0]._id);
      } else {
        setSelectedSession("");
      }
    } catch (err) {
      setSessions([]);
      setSelectedSession("");
      setError(err.response?.data?.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  const loadStudents = async () => {
    if (!selectedBatch) {
      setStudents([]);
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.get(`/batches/${selectedBatch}`);
      const batch = response.data?.batch;
      if (!batch) {
        setStudents([]);
        return;
      }
      const batchStudents = Array.isArray(batch.studentIds) ? batch.studentIds : [];
      setStudents(batchStudents);
    } catch (err) {
      setStudents([]);
      setError(err.response?.data?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ATTENDANCE
  // =========================================================

  const loadAttendance = async () => {
    if (!selectedSession) {
      setAttendance({});
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get(`/attendance?sessionId=${selectedSession}`);
      const records = response.data?.attendance || response.data?.records || response.data?.data || [];
      const map = {};
      if (Array.isArray(records)) {
        records.forEach((record) => {
          const studentId =
            typeof record.studentId === "object" ? record.studentId?._id : record.studentId;
          if (studentId) map[String(studentId)] = record;
        });
      }
      setAttendance(map);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance.");
      setAttendance({});
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD GOOGLE MEET DATA (PREVIEW)
  // =========================================================

  const loadGoogleMeetData = async () => {
    if (!selectedSession) {
      setGmError("Please select a session first.");
      return;
    }
    setGmLoading(true);
    setGmError("");
    setGmPreview(null);
    setExpandedParticipants({});
    try {
      // Try google-meet-attendance preview first
      const response = await apiClient.get(
        `/google-meet-attendance/${selectedSession}/participants`
      );
      setGmPreview(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Try /google-meet prefix
        try {
          const response2 = await apiClient.get(
            `/google-meet/${selectedSession}/participants`
          );
          setGmPreview(response2.data);
        } catch (err2) {
          setGmError(
            err2.response?.data?.message ||
              "Could not load Google Meet data. The conference record may not be available yet."
          );
        }
      } else {
        setGmError(
          err.response?.data?.message ||
            "Could not load Google Meet data. The conference record may not be available yet."
        );
      }
    } finally {
      setGmLoading(false);
    }
  };

  // =========================================================
  // SYNC GOOGLE MEET
  // =========================================================

  const handleSync = async () => {
    if (!selectedSession) return;
    try {
      setSyncing(true);
      setError("");
      setSuccess("");
      const response = await apiClient.post(
        `/google-meet-attendance/${selectedSession}/sync`
      );
      setSuccess(
        `Google Meet sync complete: ${response.data?.synced || 0} students synced, ${response.data?.unmatched || 0} unmatched.`
      );
      await loadAttendance();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sync Google Meet attendance.");
    } finally {
      setSyncing(false);
    }
  };

  // =========================================================
  // EFFECTS
  // =========================================================

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      setSessions([]);
      setAttendance({});
      setSelectedSession("");
      setGmPreview(null);
      return;
    }
    setAttendance({});
    setSelectedSession("");
    setGmPreview(null);
    loadStudents();
    loadSessions();
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedSession) {
      setAttendance({});
      setGmPreview(null);
      return;
    }
    loadAttendance();
  }, [selectedSession]);

  const currentSession =
    sessions.find((s) => String(s._id) === String(selectedSession)) || null;

  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const handleStatusChange = async (studentId, status) => {
    setError("");
    setSuccess("");
    const existing = attendance[String(studentId)];
    if (!existing?._id) {
      setError("This student does not have an attendance record yet. Sync or start tracking first.");
      return;
    }
    try {
      setSaving(true);
      const response = await apiClient.put(`/attendance/${existing._id}`, { status });
      const updated = response.data?.attendance || { ...existing, status };
      setAttendance((prev) => ({ ...prev, [String(studentId)]: updated }));
      setSuccess("Attendance status updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update attendance status.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EXCUSE
  // =========================================================

  const handleExcuse = async () => {
    if (!excuseStudent || !excuseReason.trim() || !selectedSession) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const studentId = excuseStudent._id || excuseStudent.id;
      const response = await apiClient.post("/attendance/excuse", {
        studentId,
        batchId: selectedBatch,
        sessionId: selectedSession,
        reason: excuseReason.trim(),
      });
      const record = response.data?.attendance;
      if (record) {
        setAttendance((prev) => ({ ...prev, [String(studentId)]: record }));
      }
      setExcuseStudent(null);
      setExcuseReason("");
      setSuccess("Student marked as excused.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to excuse attendance.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getStudentId = (student) => student?._id || student?.id;

  const getStudentName = (student) => {
    if (student?.name) return student.name;
    return (
      [student?.firstName, student?.lastName].filter(Boolean).join(" ") ||
      "Unknown Student"
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300";
      case "Absent":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300";
      case "Late":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300";
      case "Excused":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getSessionStatusClass = (status) => {
    switch (status) {
      case "Tracking": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300";
      case "Stopped": return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300";
      case "Reviewed": return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300";
      case "Saved": return "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const formatTime = (t) => {
    if (!t) return "—";
    const d = new Date(t);
    if (isNaN(d)) return "—";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const p = new Date(d);
    if (isNaN(p)) return "—";
    return p.toLocaleDateString();
  };

  const formatDateTime = (d) => {
    if (!d) return "—";
    const p = new Date(d);
    if (isNaN(p)) return "—";
    return p.toLocaleString();
  };

  const refreshAll = async () => {
    setError("");
    setSuccess("");
    await loadBatches();
    if (selectedBatch) {
      await loadStudents();
      await loadSessions();
      if (selectedSession) await loadAttendance();
    }
  };

  const toggleParticipantExpand = (i) => {
    setExpandedParticipants((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-emerald-950/60 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
            <UserCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Attendance Tracker
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Review Google Meet participant data, sync records, and assign final statuses.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* SELECTORS */}
      <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Batch
          </label>
          <select
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setError("");
              setSuccess("");
            }}
            className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
          >
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name || batch.batchName || batch.title || "Unnamed Batch"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Session
          </label>
          <select
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(e.target.value);
              setError("");
              setSuccess("");
              setGmPreview(null);
            }}
            disabled={!selectedBatch || sessions.length === 0}
            className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] disabled:opacity-50"
          >
            <option value="">
              {selectedBatch
                ? sessions.length > 0
                  ? "Select a session"
                  : "No attendance sessions yet"
                : "Select a batch first"}
            </option>
            {sessions.map((session) => (
              <option key={session._id} value={session._id}>
                Week {session.week} — {formatDate(session.sessionDate)} — {session.title || "Session"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SESSION INFO CARDS */}
      {currentSession && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarDays size={16} /> Week
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              Week {currentSession.week}
            </p>
          </div>
          <div className="rounded-xl border dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarDays size={16} /> Date
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {formatDate(currentSession.sessionDate)}
            </p>
          </div>
          <div className="rounded-xl border dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock size={16} /> Duration
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {currentSession.totalMinutes ?? 0} min
            </p>
          </div>
          <div className="rounded-xl border dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSessionStatusClass(currentSession.status)}`}>
              {currentSession.status}
            </span>
          </div>
        </div>
      )}

      {/* GOOGLE MEET PANEL */}
      {selectedSession && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-[#15253f] p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Video size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Meet Data
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Preview participant join/leave times before committing sync.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadGoogleMeetData}
                disabled={gmLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/60 px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition disabled:opacity-50"
              >
                {gmLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Eye size={14} />
                )}
                {gmLoading ? "Loading..." : "Load Google Meet Data"}
              </button>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing || !selectedSession}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1f6f5b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#185848] transition disabled:opacity-50"
              >
                {syncing ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )}
                {syncing ? "Syncing..." : "Sync Attendance"}
              </button>
            </div>
          </div>

          {/* GM ERROR */}
          {gmError && (
            <div className="flex items-center gap-2 m-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 p-4 text-xs text-amber-700 dark:text-amber-300">
              <WifiOff size={16} className="shrink-0" />
              <span>{gmError}</span>
            </div>
          )}

          {/* GM PREVIEW DATA */}
          {gmPreview && (
            <div className="p-5 space-y-4">
              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${gmPreview.conferenceRecordAvailable ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                  {gmPreview.conferenceRecordAvailable ? <Wifi size={14} /> : <WifiOff size={14} />}
                  {gmPreview.conferenceRecordAvailable ? "Conference Record Found" : "No Conference Record Yet"}
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Users size={14} />
                  {gmPreview.totalParticipants} Participants
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 size={14} />
                  {gmPreview.matchedCount} Matched
                </div>
                {gmPreview.unmatchedCount > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <AlertTriangle size={14} />
                    {gmPreview.unmatchedCount} Unmatched
                  </div>
                )}
              </div>

              {/* Participants list */}
              {gmPreview.participants?.length > 0 ? (
                <div className="space-y-2">
                  {gmPreview.participants.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] overflow-hidden"
                    >
                      <div className="flex flex-col gap-2 p-3 md:flex-row md:items-center">
                        {/* Match Badge */}
                        <div className="shrink-0">
                          {p.isMatched ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 size={11} /> Matched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                              <XCircle size={11} /> Unmatched
                            </span>
                          )}
                        </div>

                        {/* Name / Student */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {p.displayName}
                          </p>
                          {p.isMatched && p.matchedStudent && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              → {p.matchedStudent.name} ({p.matchedStudent.email})
                            </p>
                          )}
                          {p.email && !p.isMatched && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.email}</p>
                          )}
                        </div>

                        {/* Times & Minutes */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Join:</span>{" "}
                            {formatTime(p.checkInTime)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Leave:</span>{" "}
                            {formatTime(p.checkOutTime)}
                          </div>
                          <div className="flex items-center gap-1 rounded-lg bg-white dark:bg-[#0b1528] border border-slate-200 dark:border-[#15253f] px-2 py-1">
                            <Clock size={11} />
                            <span className="font-bold text-slate-800 dark:text-white">
                              {p.totalMinutes} min
                            </span>
                          </div>
                        </div>

                        {/* Expand sessions */}
                        {p.sessions?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleParticipantExpand(i)}
                            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            {expandedParticipants[i] ? (
                              <ChevronDown size={15} />
                            ) : (
                              <ChevronRight size={15} />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Session segments */}
                      {expandedParticipants[i] && p.sessions?.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-[#15253f] p-3 bg-white dark:bg-[#0b1528]">
                          <p className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Join / Leave Segments
                          </p>
                          <div className="space-y-1">
                            {p.sessions.map((seg, j) => (
                              <div
                                key={j}
                                className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-[#070e1b] px-3 py-1.5 text-[11px]"
                              >
                                <span className="font-semibold text-slate-400 dark:text-slate-500">
                                  #{j + 1}
                                </span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  {formatTime(seg.startTime)} → {formatTime(seg.endTime)}
                                </span>
                                <span className="ml-auto font-bold text-[#1f6f5b] dark:text-emerald-400">
                                  {seg.minutes} min
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-100 dark:border-[#15253f] p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No participants found in the Google Meet conference record.
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!gmPreview && !gmLoading && !gmError && (
            <div className="p-8 text-center">
              <Video size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Click "Load Google Meet Data" to preview participant join/leave times before syncing.
              </p>
            </div>
          )}
        </div>
      )}

      {/* NO SESSION */}
      {selectedBatch && !selectedSession && !loading && (
        <div className="rounded-xl border dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-10 text-center shadow-sm">
          <CalendarDays size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-900 dark:text-white">No attendance sessions</h3>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Start tracking a session first.
          </p>
        </div>
      )}

      {/* STUDENT ATTENDANCE TABLE */}
      {selectedSession && (
        <div className="overflow-hidden rounded-2xl border dark:border-[#15253f] bg-white dark:bg-[#0b1528] shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b dark:border-[#15253f] p-5 md:flex-row md:items-center">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Student Attendance</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {currentSession?.title || "Session"} • Week {currentSession?.week} •{" "}
                {formatDate(currentSession?.sessionDate)}
              </p>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {students.length} student{students.length !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-400">
              <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
              Loading attendance...
            </div>
          ) : students.length === 0 ? (
            <div className="p-10 text-center text-slate-400 dark:text-slate-500">
              No students found in this batch.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-[#070e1b]">
                  <tr>
                    {["Student", "Email", "Check In", "Check Out", "Minutes", "Attendance%", "Source", "Status", "Action"].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const studentId = getStudentId(student);
                    const record = attendance[String(studentId)];

                    return (
                      <tr
                        key={studentId}
                        className="border-t dark:border-[#15253f] hover:bg-slate-50 dark:hover:bg-[#070e1b] transition"
                      >
                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-white text-sm">
                          {getStudentName(student)}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500">
                          {student.email || "—"}
                        </td>
                        <td className="px-5 py-4 text-xs font-mono">
                          {formatTime(record?.checkInTime)}
                        </td>
                        <td className="px-5 py-4 text-xs font-mono">
                          {formatTime(record?.checkOutTime)}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold">
                          {record ? `${record.attendedMinutes ?? 0} min` : "—"}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold">
                          {record ? `${record.attendancePercentage ?? 0}%` : "—"}
                        </td>
                        <td className="px-5 py-4">
                          {record?.source === "google_meet_auto" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              <Wifi size={10} /> Google Meet
                            </span>
                          ) : record?.source === "manual" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                              Manual
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={record?.status || "Absent"}
                            disabled={saving || !record?._id}
                            onChange={(e) => handleStatusChange(studentId, e.target.value)}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium outline-none cursor-pointer ${getStatusClass(record?.status || "Absent")}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={!record?._id || saving}
                            onClick={() => {
                              setExcuseStudent(student);
                              setExcuseReason("");
                              setError("");
                            }}
                            className="rounded-lg border border-blue-200 dark:border-blue-800 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 disabled:cursor-not-allowed disabled:opacity-50 transition"
                          >
                            Excuse
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EXCUSE MODAL */}
      {excuseStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0b1528] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Approve Excuse</h2>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              {getStudentName(excuseStudent)}
            </p>
            <textarea
              value={excuseReason}
              onChange={(e) => setExcuseReason(e.target.value)}
              placeholder="Enter the reason for the excuse..."
              className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-3 text-sm outline-none focus:border-[#1f6f5b] dark:text-white"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setExcuseStudent(null); setExcuseReason(""); }}
                className="rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#070e1b] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleExcuse}
                className="rounded-xl bg-[#1f6f5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#185848] disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : "Approve Excuse"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance;