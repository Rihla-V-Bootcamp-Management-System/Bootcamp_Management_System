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

// =========================================================
// STATUS STYLES
// =========================================================

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
    icon: Clock3,
    className: "bg-gray-100 text-gray-600",
  },
  "Needs Improvement": {
    label: "Needs Improvement",
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-700",
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

function StudentProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTopic, setSavingTopic] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =======================================================
  // LOAD STUDENT'S OWN PROGRESS
  // =======================================================

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/progress");
      const data = response.data;
      const progressList = Array.isArray(data) ? data : data?.progress || [];

      setProgress(progressList);
    } catch (err) {
      console.error("LOAD STUDENT PROGRESS ERROR:", err);
      setProgress([]);
      setError(
        err.response?.data?.message || "Failed to load your progress."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  // =======================================================
  // MAP BY TOPIC
  // =======================================================

  const progressByTopic = useMemo(() => {
    const map = {};
    progress.forEach((item) => {
      if (item?.topic) {
        map[item.topic] = item;
      }
    });
    return map;
  }, [progress]);

  // =======================================================
  // COUNTS & METRICS
  // =======================================================

  const completedCount = progress.filter(
    (item) => item.status === "Completed"
  ).length;

  const inProgressCount = progress.filter(
    (item) => item.status === "In Progress"
  ).length;

  const needsImprovementCount = progress.filter(
    (item) => item.status === "Needs Improvement"
  ).length;

  const totalTopics = TOPICS.length;
  const overallProgress =
    totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // =======================================================
  // LOCAL STATE UPDATES (Optimistic UI)
  // =======================================================

  const updateLocalTopicState = (topic, updates) => {
    setProgress((currentProgress) => {
      const existingIndex = currentProgress.findIndex(
        (item) => item.topic === topic
      );

      if (existingIndex !== -1) {
        return currentProgress.map((item) =>
          item.topic === topic ? { ...item, ...updates } : item
        );
      }

      return [
        ...currentProgress,
        {
          topic,
          status: "Not Started",
          notes: "",
          ...updates,
        },
      ];
    });
  };

  const handleStatusChange = (topic, newStatus) => {
    updateLocalTopicState(topic, { status: newStatus });
  };

  const handleNotesChange = (topic, notes) => {
    updateLocalTopicState(topic, { notes });
  };

  // =======================================================
  // SAVE / UPDATE PROGRESS TO API
  // =======================================================

  const handleSaveTopic = async (topic) => {
    const targetItem = progressByTopic[topic] || {};
    const status = targetItem.status || "Not Started";
    const notes = targetItem.notes || "";

    try {
      setSavingTopic(topic);
      setError("");
      setSuccess("");

      let response;

      if (targetItem._id) {
        response = await apiClient.patch(`/progress/${targetItem._id}`, {
          status,
          notes,
        });
      } else {
        response = await apiClient.post("/progress", {
          topic,
          status,
          notes,
        });
      }

      const savedProgress = response.data?.progress || response.data;

      if (savedProgress && savedProgress._id) {
        setProgress((currentProgress) => {
          const exists = currentProgress.some(
            (item) => item.topic === topic || item._id === savedProgress._id
          );

          if (exists) {
            return currentProgress.map((item) =>
              item.topic === topic || item._id === savedProgress._id
                ? savedProgress
                : item
            );
          }

          return [...currentProgress, savedProgress];
        });
      }

      setSuccess(`${topic} progress saved successfully.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("SAVE PROGRESS ERROR:", err);
      setError(err.response?.data?.message || "Failed to save progress.");
    } finally {
      setSavingTopic("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and update your progress for each bootcamp topic.
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
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-gray-500"
              />
              <p className="mt-3 text-sm text-gray-500">
                Loading your progress...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Overall Progress</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {overallProgress}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-100 p-3">
                    <BookOpen size={22} className="text-gray-700" />
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-900 transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {completedCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-100 p-3">
                    <CheckCircle2 size={22} className="text-green-600" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Out of {totalTopics} topics
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {inProgressCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-blue-100 p-3">
                    <Clock3 size={22} className="text-blue-600" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Topics currently being learned
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Needs Improvement</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {needsImprovementCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-orange-100 p-3">
                    <AlertCircle size={22} className="text-orange-600" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Topics requiring attention
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Update Your Progress
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select your current status and add notes for each topic.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {TOPICS.map((topic) => {
                  const item = progressByTopic[topic];
                  const status = item?.status || "Not Started";
                  const statusInfo =
                    STATUS_STYLES[status] || STATUS_STYLES["Not Started"];
                  const StatusIcon = statusInfo.icon;
                  const isSaving = savingTopic === topic;

                  return (
                    <div key={topic} className="p-5">
                      <div className="flex flex-col gap-5">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-gray-100 p-2.5">
                            <BookOpen size={18} className="text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {topic}
                            </h3>
                            <div
                              className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusInfo.className}`}
                            >
                              <StatusIcon size={14} />
                              {statusInfo.label}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Progress Status
                          </label>
                          <select
                            value={status}
                            disabled={isSaving}
                            onChange={(e) =>
                              handleStatusChange(topic, e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Needs Improvement">
                              Needs Improvement
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Notes
                          </label>
                          <textarea
                            value={item?.notes || ""}
                            disabled={isSaving}
                            onChange={(e) =>
                              handleNotesChange(topic, e.target.value)
                            }
                            placeholder={`Add notes about your ${topic} progress...`}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSaveTopic(topic)}
                            disabled={isSaving}
                            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSaving ? (
                              <>
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Save Progress
                              </>
                            )}
                          </button>
                        </div>
                      </div>
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

export default StudentProgress;