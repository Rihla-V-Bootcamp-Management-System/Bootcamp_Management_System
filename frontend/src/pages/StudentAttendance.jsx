import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Award,
  ShieldCheck,
  CalendarCheck,
  Wifi,
  Timer,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import apiClient from "../services/apiClient";
import useAuth from "../context/useAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({ status }) => {
  switch (status) {
    case "Present":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 size={11} /> Present
        </span>
      );
    case "Late":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock size={11} /> Late
        </span>
      );
    case "Excused":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <ShieldCheck size={11} /> Excused
        </span>
      );
    case "Absent":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 text-[11px] font-bold text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          <XCircle size={11} /> Absent
        </span>
      );
    default:
      return (
        <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          {status || "—"}
        </span>
      );
  }
};

// =========================================================
// SOURCE BADGE
// =========================================================

const SourceBadge = ({ source }) => {
  if (source === "google_meet_auto") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
        <Wifi size={10} /> Google Meet Auto
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
      Manual
    </span>
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================

function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/attendance/my");
      const list = response.data?.attendance || response.data?.records || response.data?.data || [];
      setAttendance(Array.isArray(list) ? list : []);
      if (response.data?.summary) {
        setSummary(response.data.summary);
      }
    } catch (err) {
      console.error("LOAD STUDENT ATTENDANCE ERROR:", err);
      setError(err.response?.data?.message || "Unable to load your attendance history.");
      setAttendance([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  // Compute stats from records (or use summary from API)
  const presentCount = summary?.statusBreakdown?.Present ?? attendance.filter((a) => a.status === "Present").length;
  const lateCount = summary?.statusBreakdown?.Late ?? attendance.filter((a) => a.status === "Late").length;
  const excusedCount = summary?.statusBreakdown?.Excused ?? attendance.filter((a) => a.status === "Excused").length;
  const absentCount = summary?.statusBreakdown?.Absent ?? attendance.filter((a) => a.status === "Absent").length;
  const totalCount = summary?.totalSessions ?? attendance.length;
  const totalMinutes = summary?.totalAttendedMinutes ?? attendance.reduce((s, a) => s + (a.attendedMinutes || 0), 0);
  const overallPct = summary?.overallAttendancePercentage ?? (totalCount > 0 ? Math.round(attendance.reduce((s, a) => s + (a.attendancePercentage || 0), 0) / totalCount) : 0);

  const filteredAttendance = useMemo(() => {
    if (statusFilter === "All") return attendance;
    return attendance.filter((a) => a.status === statusFilter);
  }, [attendance, statusFilter]);

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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1f6f5b] dark:text-emerald-400">
            <CalendarCheck size={22} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your complete session attendance history with check-in times, durations, and admin-set statuses.
          </p>
        </div>
        <Button variant="outline" onClick={fetchMyAttendance} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {/* Overall % */}
        <Card className="p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Overall %</p>
              <p className="mt-1.5 text-2xl font-bold text-[#1f6f5b] dark:text-emerald-400">{overallPct}%</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-[#1f6f5b] dark:text-emerald-300">
              <Award size={20} />
            </div>
          </div>
        </Card>

        {/* Total Minutes */}
        <Card className="p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Minutes</p>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">{totalMinutes}</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/60 p-2.5 text-violet-600 dark:text-violet-300">
              <Timer size={20} />
            </div>
          </div>
        </Card>

        {/* Present */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Present</p>
              <p className="mt-1.5 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </Card>

        {/* Late */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Late</p>
              <p className="mt-1.5 text-2xl font-bold text-amber-600 dark:text-amber-400">{lateCount}</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/60 p-2.5 text-amber-600 dark:text-amber-300">
              <Clock size={20} />
            </div>
          </div>
        </Card>

        {/* Excused */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Excused</p>
              <p className="mt-1.5 text-2xl font-bold text-blue-600 dark:text-blue-400">{excusedCount}</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-2.5 text-blue-600 dark:text-blue-300">
              <ShieldCheck size={20} />
            </div>
          </div>
        </Card>

        {/* Absent */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Absent</p>
              <p className="mt-1.5 text-2xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-2.5 text-red-600 dark:text-red-300">
              <XCircle size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* ATTENDANCE LOG */}
      <Card className="overflow-hidden p-0 border border-slate-200 dark:border-[#15253f]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-[#15253f] p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Session Attendance Log</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Per-session breakdown with check-in times, attended minutes, and final status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-3 text-xs font-semibold text-slate-800 dark:text-white outline-none"
            >
              <option value="All">All Records ({attendance.length})</option>
              <option value="Present">Present ({presentCount})</option>
              <option value="Late">Late ({lateCount})</option>
              <option value="Excused">Excused ({excusedCount})</option>
              <option value="Absent">Absent ({absentCount})</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <RefreshCw size={24} className="mx-auto animate-spin text-[#1f6f5b]" />
            <p className="mt-2">Loading attendance history...</p>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <Calendar size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-xs">
              <thead className="border-b border-slate-100 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] text-left font-bold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">Week</th>
                  <th className="px-5 py-3">Session</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Check-In</th>
                  <th className="px-5 py-3">Check-Out</th>
                  <th className="px-5 py-3">Minutes</th>
                  <th className="px-5 py-3">%</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#15253f] text-slate-800 dark:text-slate-200">
                {filteredAttendance.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-[#070e1b]/50">
                    <td className="px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400">
                      Wk {record.week || "—"}
                    </td>
                    <td className="px-5 py-3.5 font-medium max-w-[160px] truncate">
                      {record.sessionTitle || record.sessionId?.title || "Daily Session"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {formatDate(record.sessionDate || record.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {record.attendedMinutes ?? 0} min
                    </td>
                    <td className="px-5 py-3.5 font-bold">
                      <span
                        className={`${
                          (record.attendancePercentage || 0) >= 90
                            ? "text-emerald-600 dark:text-emerald-400"
                            : (record.attendancePercentage || 0) >= 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {record.attendancePercentage ?? 0}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <SourceBadge source={record.source} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 max-w-[200px] truncate">
                      {record.excuseReason || record.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default StudentAttendance;