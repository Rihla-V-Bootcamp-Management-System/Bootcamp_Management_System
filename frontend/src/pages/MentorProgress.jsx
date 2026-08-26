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
} from "lucide-react";

import apiClient from "../services/apiClient";

const STATUS_STYLES = {
  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
  "In Progress": {
    label: "In Progress",
    icon: Clock3,
    className: "bg-blue-100 text-blue-700",
  },
  "Not Started": {
    label: "Not Started",
    icon: Circle,
    className: "bg-gray-100 text-gray-600",
  },
  "Needs Improvement": {
    label: "Needs Improvement",
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-700",
  },
};

// Must match the Progress model exactly
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

  // Load mentor's assigned students once on mount.
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

  // Single source of truth for fetching one student's progress —
  // used by both the auto-load effect below and the manual refresh button,
  // so they can't drift out of sync with each other.
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

  const refreshProgress = () => {
    if (selectedStudentId) fetchStudentProgress(selectedStudentId);
  };

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <User size={20} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900">Select student</h2>
          </div>

          {studentsLoading && (
            <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
              <RefreshCw size={16} className="animate-spin" />
              Loading assigned students...
            </div>
          )}

          {!studentsLoading && studentsError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <p className="font-medium">{studentsError}</p>
            </div>
          )}

          {!studentsLoading && !studentsError && students.length === 0 && (
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              No students are currently assigned to you.
            </div>
          )}

          {!studentsLoading && !studentsError && students.length > 0 && (
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              >
                {students.map((student) => {
                  const id = student._id || student.id;
                  const name = student.name || student.fullName || "Unnamed student";
                  const email = student.email || "";
                  return (
                    <option key={id} value={id}>
                      {name}{email ? ` — ${email}` : ""}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="mb-6 rounded-2xl bg-gray-900 p-5 text-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-gray-400">Selected student</p>
                <h2 className="mt-1 text-xl font-bold">
                  {selectedStudent.name || selectedStudent.fullName || "Unnamed student"}
                </h2>
                {selectedStudent.email && (
                  <p className="mt-1 text-sm text-gray-400">{selectedStudent.email}</p>
                )}
              </div>

              <button
                type="button"
                onClick={refreshProgress}
                disabled={progressLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} className={progressLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        )}

        {progressError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load progress</p>
              <p className="mt-1">{progressError}</p>
            </div>
          </div>
        )}

        {progressLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="text-center">
              <RefreshCw size={32} className="mx-auto animate-spin text-gray-500" />
              <p className="mt-3 text-sm text-gray-500">Loading student progress...</p>
            </div>
          </div>
        ) : selectedStudent ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Overall progress"
                value={`${overallProgress}%`}
                icon={<BookOpen size={22} className="text-gray-700" />}
                iconBg="bg-gray-100"
                footer={
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-900 transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                }
              />
              <SummaryCard
                label="Completed"
                value={completedCount}
                icon={<CheckCircle2 size={22} className="text-green-600" />}
                iconBg="bg-green-100"
                footer={<p className="mt-3 text-xs text-gray-500">Out of {TOPICS.length} topics</p>}
              />
              <SummaryCard
                label="In progress"
                value={inProgressCount}
                icon={<Clock3 size={22} className="text-blue-600" />}
                iconBg="bg-blue-100"
                footer={<p className="mt-3 text-xs text-gray-500">Topics currently being learned</p>}
              />
              <SummaryCard
                label="Needs improvement"
                value={needsImprovementCount}
                icon={<AlertCircle size={22} className="text-orange-600" />}
                iconBg="bg-orange-100"
                footer={<p className="mt-3 text-xs text-gray-500">Topics requiring attention</p>}
              />
            </div>

            <div className="mt-6 rounded-2xl bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-900">Topic progress</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Detailed progress for each bootcamp topic.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {TOPICS.map((topic) => {
                  const item = progressByTopic[topic];
                  const status = item?.status || "Not Started";
                  const statusInfo = STATUS_STYLES[status] || STATUS_STYLES["Not Started"];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={topic} className="p-5 transition hover:bg-gray-50">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-gray-100 p-2.5">
                            <BookOpen size={18} className="text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{topic}</h3>
                            {item?.notes && (
                              <p className="mt-1 text-sm text-gray-500">{item.notes}</p>
                            )}
                          </div>
                        </div>

                        <div
                          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusInfo.className}`}
                        >
                          <StatusIcon size={14} />
                          {statusInfo.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="text-center">
              <User size={40} className="mx-auto text-gray-300" />
              <h3 className="mt-4 font-semibold text-gray-800">Select a student</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose an assigned student to view their progress.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, iconBg, footer }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconBg}`}>{icon}</div>
      </div>
      {footer}
    </div>
  );
}

export default MentorProgress;