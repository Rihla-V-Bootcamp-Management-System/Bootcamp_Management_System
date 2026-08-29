 import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
  Save,
} from "lucide-react";

import apiClient from "../services/apiClient";

const TOPICS = [
  "HTML/CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Git/GitHub",
];

const STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Completed",
  "Needs Improvement",
];

function StudentProgress() {
  // `progress` is the last known-good state from the server.
  // `drafts` holds in-flight edits that haven't been saved yet.
  // Nothing moves from drafts into progress until the API confirms it.
  const [progress, setProgress] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingTopic, setSavingTopic] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/progress");
      const data = response.data;
      setProgress(Array.isArray(data) ? data : data?.progress || []);
    } catch (err) {
      console.error("LOAD STUDENT PROGRESS ERROR:", err);
      setProgress([]);
      setError(err.response?.data?.message || "Failed to load your progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const progressByTopic = useMemo(() => {
    const map = {};
    progress.forEach((item) => {
      if (item?.topic) map[item.topic] = item;
    });
    return map;
  }, [progress]);

  const savedStatus = (topic) => progressByTopic[topic]?.status || "Not Started";
  const displayedStatus = (topic) => drafts[topic] ?? savedStatus(topic);
  const isDirty = (topic) => drafts[topic] !== undefined && drafts[topic] !== savedStatus(topic);

  const completedCount = progress.filter((item) => item.status === "Completed").length;
  const inProgressCount = progress.filter((item) => item.status === "In Progress").length;
  const needsImprovementCount = progress.filter((item) => item.status === "Needs Improvement").length;
  const overallProgress = Math.round((completedCount / TOPICS.length) * 100);

  const handleStatusChange = (topic, newStatus) => {
    setDrafts((prev) => ({ ...prev, [topic]: newStatus }));
    setError("");
  };

  const handleSaveTopic = async (topic) => {
    const status = displayedStatus(topic);
    const existing = progressByTopic[topic];

    try {
      setSavingTopic(topic);
      setError("");
      setSuccess("");

      const response = existing?._id
        ? await apiClient.put(`/progress/${existing._id}`, { status })
        : await apiClient.post("/progress", { topic, status });

      const saved = response.data?.progress || response.data;

      // Only now, with a confirmed save, does the change become part of `progress`.
      setProgress((current) => {
        const exists = current.some((item) => item._id === saved?._id || item.topic === topic);
        if (exists) {
          return current.map((item) =>
            item._id === saved?._id || item.topic === topic ? saved : item
          );
        }
        return [...current, saved || { topic, status }];
      });

      // Clear the draft now that it matches what's saved.
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[topic];
        return next;
      });

      setSuccess(`${topic} progress saved.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("SAVE PROGRESS ERROR:", err);
      // Draft is left in place on failure — the student's edit isn't lost,
      // and the UI still visibly shows it as unsaved (Save button stays active).
      setError(err.response?.data?.message || `Failed to save ${topic}. Your change wasn't saved — try again.`);
    } finally {
      setSavingTopic("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] dark:bg-[#070e1b] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My progress</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Update your progress for each bootcamp topic.
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white dark:bg-[#0b1528] shadow-sm">
            <div className="text-center">
              <RefreshCw size={32} className="mx-auto animate-spin text-gray-500 dark:text-slate-400" />
              <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">Loading your progress...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Overall progress"
                value={`${overallProgress}%`}
                icon={<BookOpen size={22} className="text-gray-700 dark:text-slate-200" />}
                iconBg="bg-gray-100"
                footer={
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-[#070e1b]">
                    <div
                      className="h-full rounded-full bg-[#1f6f5b] transition-all"
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
                footer={<p className="mt-3 text-xs text-gray-500 dark:text-slate-400">Out of {TOPICS.length} topics</p>}
              />
              <SummaryCard
                label="In progress"
                value={inProgressCount}
                icon={<Clock3 size={22} className="text-[#1f6f5b]" />}
                iconBg="bg-blue-100"
                footer={<p className="mt-3 text-xs text-gray-500 dark:text-slate-400">Topics currently being learned</p>}
              />
              <SummaryCard
                label="Needs improvement"
                value={needsImprovementCount}
                icon={<AlertCircle size={22} className="text-orange-600" />}
                iconBg="bg-orange-100"
                footer={<p className="mt-3 text-xs text-gray-500 dark:text-slate-400">Topics requiring attention</p>}
              />
            </div>

            <div className="mt-6 rounded-2xl bg-white dark:bg-[#0b1528] shadow-sm">
              <div className="border-b border-gray-100 dark:border-[#15253f] p-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Update your progress</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Select your current status for each topic, then save.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                {TOPICS.map((topic) => {
                  const status = displayedStatus(topic);
                  const dirty = isDirty(topic);
                  const isSaving = savingTopic === topic;

                  return (
                    <div key={topic} className="rounded-xl border border-gray-200 dark:border-[#15253f] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gray-100 dark:bg-[#070e1b] p-2">
                          <BookOpen size={18} className="text-gray-600 dark:text-slate-300" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{topic}</h3>
                      </div>

                      <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                          Progress status
                        </label>
                        <select
                          value={status}
                          disabled={isSaving}
                          onChange={(e) => handleStatusChange(topic, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveTopic(topic)}
                        disabled={isSaving || !dirty}
                        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed ${
                          dirty ? "bg-[#1f6f5b] hover:bg-[#185848]" : "bg-gray-300"
                        }`}
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            {dirty ? "Save" : "Saved"}
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, iconBg, footer }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0b1528] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconBg}`}>{icon}</div>
      </div>
      {footer}
    </div>
  );
}

export default StudentProgress;