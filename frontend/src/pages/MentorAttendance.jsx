import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  AlertCircle,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Award,
  Timer,
  ChevronDown,
  ChevronUp,
  Wifi,
  Search,
} from "lucide-react";
import apiClient from "../services/apiClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({ status }) => {
  const map = {
    Present: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    Late: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    Excused: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    Absent: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${map[status] || "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"}`}>
      {status || "—"}
    </span>
  );
};

// =========================================================
// SUGGESTED STATUS BADGE
// =========================================================

const SuggestedBadge = ({ status }) => {
  const map = {
    Present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    Late: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    Excused: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
    Absent: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${map[status] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
      → {status || "—"}
    </span>
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================

function MentorAttendance() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [summary, setSummary] = useState(null);

  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("overallPercentage");
  const [sortDir, setSortDir] = useState("desc");

  // =========================================================
  // LOAD MENTOR BATCHES
  // =========================================================

  const loadBatches = async () => {
    try {
      setLoadingBatches(true);
      setError("");
      const response = await apiClient.get("/batches/mentor");
      const data = response.data?.batches || response.data?.data || response.data || [];
      setBatches(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedBatch(data[0]._id);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Fallback to all batches if mentor endpoint doesn't exist
        try {
          const response2 = await apiClient.get("/batches");
          const data = response2.data?.batches || response2.data?.data || response2.data || [];
          setBatches(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) setSelectedBatch(data[0]._id);
        } catch {
          setError("Failed to load batches.");
        }
      } else {
        setError(err.response?.data?.message || "Failed to load batches.");
      }
    } finally {
      setLoadingBatches(false);
    }
  };

  // =========================================================
  // LOAD BATCH SUMMARY
  // =========================================================

  const loadBatchSummary = async (batchId) => {
    if (!batchId) {
      setSummary(null);
      return;
    }
    try {
      setLoadingSummary(true);
      setError("");
      setSummary(null);
      const response = await apiClient.get(`/attendance/batch-summary/${batchId}`);
      setSummary(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load batch attendance summary.");
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  // =========================================================
  // EFFECTS
  // =========================================================

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadBatchSummary(selectedBatch);
    }
  }, [selectedBatch]);

  // =========================================================
  // SORTING & FILTERING
  // =========================================================

  const students = useMemo(() => {
    if (!summary?.students) return [];
    let list = [...summary.students];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let av = a[sortField] ?? 0;
      let bv = b[sortField] ?? 0;
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [summary, searchQuery, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }) =>
    sortField === field ? (
      sortDir === "asc" ? <ChevronUp size={12} className="inline ml-1" /> : <ChevronDown size={12} className="inline ml-1" />
    ) : null;

  const currentBatch = batches.find((b) => b._id === selectedBatch);

  const formatDate = (d) => {
    if (!d) return "—";
    const p = new Date(d);
    if (isNaN(p)) return "—";
    return p.toLocaleDateString();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-emerald-950/60 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Batch Attendance
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Per-student attendance summary for your assigned batches.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            loadBatches();
            if (selectedBatch) loadBatchSummary(selectedBatch);
          }}
          disabled={loadingBatches || loadingSummary}
        >
          <RefreshCw size={14} className={(loadingBatches || loadingSummary) ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* BATCH SELECTOR */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-5 shadow-sm">
        <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Your Batch
        </label>
        {loadingBatches ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw size={14} className="animate-spin" /> Loading batches...
          </div>
        ) : (
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full max-w-md rounded-xl border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
          >
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name || batch.batchName || batch.title || "Unnamed Batch"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* SUMMARY STATS */}
      {summary && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {/* Total sessions */}
            <Card className="p-5 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sessions</p>
                  <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
                    {summary.totalSessions ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 text-slate-500 dark:text-slate-400">
                  <Calendar size={20} />
                </div>
              </div>
            </Card>

            {/* Total students */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Students</p>
                  <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
                    {summary.students?.length ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-violet-50 dark:bg-violet-950/60 p-2.5 text-violet-600 dark:text-violet-300">
                  <Users size={20} />
                </div>
              </div>
            </Card>

            {/* Avg attendance % */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avg Attendance</p>
                  <p className="mt-1.5 text-2xl font-bold text-[#1f6f5b] dark:text-emerald-400">
                    {summary.batchAveragePercentage ?? 0}%
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-[#1f6f5b] dark:text-emerald-400">
                  <Award size={20} />
                </div>
              </div>
            </Card>

            {/* At-Risk */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">At Risk (&lt;75%)</p>
                  <p className="mt-1.5 text-2xl font-bold text-red-600 dark:text-red-400">
                    {summary.students?.filter((s) => (s.overallPercentage ?? 0) < 75).length ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-red-50 dark:bg-red-950/60 p-2.5 text-red-600 dark:text-red-300">
                  <AlertCircle size={20} />
                </div>
              </div>
            </Card>

            {/* Perfect */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Perfect (100%)</p>
                  <p className="mt-1.5 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {summary.students?.filter((s) => (s.overallPercentage ?? 0) >= 100).length ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </Card>
          </div>

          {/* STUDENT TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] shadow-sm">
            {/* Table header */}
            <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-[#15253f] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Student Attendance Overview
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {currentBatch?.name || "Batch"} • {summary.totalSessions} session{summary.totalSessions !== 1 ? "s" : ""}
                </p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student…"
                  className="h-9 w-full rounded-xl border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] pl-8 pr-3 text-xs text-slate-800 dark:text-white outline-none focus:border-[#1f6f5b]"
                />
              </div>
            </div>

            {loadingSummary ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-[#1f6f5b]" />
                Loading attendance summary...
              </div>
            ) : students.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <Users size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                {searchQuery ? "No students match your search." : "No student data found."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-xs">
                  <thead className="bg-slate-50 dark:bg-[#070e1b] text-left font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-5 py-4">Student</th>
                      <th
                        className="cursor-pointer select-none px-5 py-4 hover:text-[#1f6f5b] dark:hover:text-emerald-400"
                        onClick={() => handleSort("totalAttendedMinutes")}
                      >
                        Total Minutes <SortIcon field="totalAttendedMinutes" />
                      </th>
                      <th
                        className="cursor-pointer select-none px-5 py-4 hover:text-[#1f6f5b] dark:hover:text-emerald-400"
                        onClick={() => handleSort("overallPercentage")}
                      >
                        Overall % <SortIcon field="overallPercentage" />
                      </th>
                      <th className="px-5 py-4">Present</th>
                      <th className="px-5 py-4">Late</th>
                      <th className="px-5 py-4">Excused</th>
                      <th className="px-5 py-4">Absent</th>
                      <th className="px-5 py-4">Suggested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#15253f]">
                    {students.map((student) => {
                      const pct = student.overallPercentage ?? 0;
                      const pctClass =
                        pct >= 90
                          ? "text-emerald-600 dark:text-emerald-400"
                          : pct >= 75
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400";
                      return (
                        <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-[#070e1b]/50 transition">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {student.name || "Unknown Student"}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                {student.email || ""}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                            <span className="flex items-center gap-1">
                              <Timer size={12} className="text-violet-500" />
                              {student.totalAttendedMinutes ?? 0} min
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className={`font-bold ${pctClass}`}>{pct}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {student.statusBreakdown?.Present ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              {student.statusBreakdown?.Late ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {student.statusBreakdown?.Excused ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {student.statusBreakdown?.Absent ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <SuggestedBadge status={student.suggestedStatus} />
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

      {/* EMPTY STATE */}
      {!selectedBatch && !loadingBatches && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-12 text-center shadow-sm">
          <Users size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">
            No batch selected
          </h3>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Select a batch to view attendance summary.
          </p>
        </div>
      )}

      {/* LOADING */}
      {selectedBatch && loadingSummary && !summary && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-12 text-center shadow-sm">
          <RefreshCw size={32} className="mx-auto animate-spin text-[#1f6f5b]" />
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Loading summary…</p>
        </div>
      )}
    </div>
  );
}

export default MentorAttendance;