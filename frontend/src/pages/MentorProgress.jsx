import { useEffect, useMemo, useState, useCallback } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Circle,
  AlertCircle,
  User,
  ChevronDown,
  RefreshCw,
  Eye,
} from "lucide-react";
import apiClient from "../services/apiClient";

const STATUS_STYLES = {
  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  },
  "In Progress": {
    label: "In Progress",
    icon: Clock3,
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  },
  "Not Started": {
    label: "Not Started",
    icon: Circle,
    badgeClass: "bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
  },
  "Needs Improvement": {
    label: "Needs Improvement",
    icon: AlertCircle,
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
  },
};

const TOPICS = [
  "HTML/CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Git/GitHub",
];

function MentorProgress() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [progress, setProgress] = useState([]);

  const [studentsLoading, setStudentsLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);

  const [studentsError, setStudentsError] = useState("");
  const [progressError, setProgressError] = useState("");

  // Load mentor's assigned students on mount
  useEffect(() => {
    let cancelled = false;

    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        setStudentsError("");

        const response = await apiClient.get("/mentor/my-students");
        if (cancelled) return;

        const data = response.data;
        const studentList = Array.isArray(data) ? data : data?.students || [];
        setStudents(studentList);

        const firstId = studentList[0]?._id || studentList[0]?.id;
        setSelectedStudentId(firstId || "");
      } catch (error) {
        if (cancelled) return;
        console.error("MENTOR STUDENTS ERROR:", error);
        setStudents([]);
        setStudentsError(
          error.response?.data?.message || "Failed to load assigned students."
        );
      } finally {
        if (!cancelled) setStudentsLoading(false);
      }
    };

    loadStudents();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchStudentProgress = useCallback(async (studentId, { signalCancelled } = {}) => {
    setProgressLoading(true);
    setProgressError("");

    try {
      const response = await apiClient.get("/progress", {
        params: { studentId },
      });
      if (signalCancelled?.()) return;

      const data = response.data;
      setProgress(Array.isArray(data) ? data : data?.progress || []);
    } catch (error) {
      if (signalCancelled?.()) return;
      console.error("PROGRESS ERROR:", error);
      setProgress([]);
      setProgressError(
        error.response?.data?.message || "Failed to load student progress."
      );
    } finally {
      if (!signalCancelled?.()) setProgressLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      setProgress([]);
      return;
    }

    let cancelled = false;
    fetchStudentProgress(selectedStudentId, { signalCancelled: () => cancelled });

    return () => {
      cancelled = true;
    };
  }, [selectedStudentId, fetchStudentProgress]);

  const selectedStudent = useMemo(
    () => students.find((s) => (s._id || s.id) === selectedStudentId),
    [students, selectedStudentId]
  );

  const progressByTopic = useMemo(() => {
    const map = {};
    progress.forEach((item) => {
      if (item?.topic) map[item.topic] = item;
    });
    return map;
  }, [progress]);

  const completedCount = progress.filter((item) => item.status === "Completed").length;
  const inProgressCount = progress.filter((item) => item.status === "In Progress").length;
  const needsImprovementCount = progress.filter((item) => item.status === "Needs Improvement").length;
  const overallProgress = Math.round((completedCount / TOPICS.length) * 100);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold tracking-widest text-[#1f6f5b] dark:text-emerald-400 uppercase">
            ANALYTICS & STUDENT PROGRESS
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Progress Tracker
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View live curriculum topics and completion updates reported by your assigned students.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-slate-300">
          <Eye size={15} className="text-[#1f6f5b] dark:text-emerald-400" />
          <span>Read-Only View</span>
        </div>
      </div>

      {/* STUDENT SELECTOR CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#1f6f5b] dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Select Assigned Student
            </h2>
          </div>

          <button
            type="button"
            onClick={() => selectedStudentId && fetchStudentProgress(selectedStudentId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-slate-300"
          >
            <RefreshCw size={13} className={progressLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {studentsLoading ? (
          <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
            <RefreshCw size={14} className="animate-spin text-[#1f6f5b]" />
            Loading assigned students...
          </div>
        ) : studentsError ? (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
            {studentsError}
          </div>
        ) : students.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">
            No students currently assigned to your mentorship cohort.
          </p>
        ) : (
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-[#1f6f5b] dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white"
            >
              {students.map((student) => {
                const sId = student._id || student.id;
                return (
                  <option key={sId} value={sId}>
                    {student.name} — {student.email} {student.batchId?.name ? `(${student.batchId.name})` : ""}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        )}
      </div>

      {progressError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <p className="font-bold">Unable to load progress: {progressError}</p>
          </div>
        </div>
      )}

      {selectedStudent && (
        <>
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Overall Progress</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                    {overallProgress}%
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-[#10261f] dark:text-[#34d399]">
                  <BookOpen size={20} />
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#070e1b]">
                <div
                  className="h-full rounded-full bg-[#1f6f5b]"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Completed</p>
                  <p className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {completedCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Out of {TOPICS.length} curriculum topics</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">In Progress</p>
                  <p className="mt-1 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {inProgressCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Clock3 size={20} />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Topics currently being practiced</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Needs Attention</p>
                  <p className="mt-1 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                    {needsImprovementCount}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <AlertCircle size={20} />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Requires review or guidance</p>
            </div>
          </div>

          {/* TOPIC PROGRESS TABLE (READ-ONLY FOR MENTORS) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-[#15253f] dark:bg-[#0b1528] overflow-hidden">
            <div className="border-b border-slate-100 p-6 dark:border-[#15253f] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Curriculum Topics & Student Status
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Live status reported by {selectedStudent.name}.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#15253f]">
              {TOPICS.map((topic) => {
                const item = progressByTopic[topic];
                const status = item?.status || "Not Started";
                const statusInfo = STATUS_STYLES[status] || STATUS_STYLES["Not Started"];
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={topic}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 dark:hover:bg-[#070e1b] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#070e1b] border border-slate-200 dark:border-[#15253f] text-slate-700 dark:text-slate-300 font-bold text-xs">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {topic}
                        </h3>
                        {item?.notes ? (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            Note: {item.notes}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {item?.updatedAt ? `Last updated: ${new Date(item.updatedAt).toLocaleDateString()}` : "No student notes yet"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* READ-ONLY STATUS BADGE */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusInfo.badgeClass}`}
                      >
                        <StatusIcon size={13} />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MentorProgress;