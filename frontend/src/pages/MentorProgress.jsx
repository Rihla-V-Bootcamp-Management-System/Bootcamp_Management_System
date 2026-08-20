import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  AlertCircle,
  TrendingUp,
  UserRound,
} from "lucide-react";

import apiClient from "../services/apiClient";

const statusConfig = {
  Completed: {
    icon: CheckCircle2,
    className: "bg-green-50 text-green-600",
  },

  "In Progress": {
    icon: Clock3,
    className: "bg-yellow-50 text-yellow-600",
  },

  "Not Started": {
    icon: Circle,
    className: "bg-gray-100 text-gray-500",
  },

  "Needs Improvement": {
    icon: AlertCircle,
    className: "bg-red-50 text-red-600",
  },
};

function StatCard({ title, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className={`rounded-lg p-3 ${iconClass}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function MentorProgress() {
  const [progress, setProgress] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get progress from backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get("/progress");

        console.log("Progress response:", response.data);

        setProgress(response.data.progress || []);
      } catch (error) {
        console.error("Error loading progress:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load progress."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Create unique student list from progress records
  const students = useMemo(() => {
    const studentMap = new Map();

    progress.forEach((item) => {
      if (!item.studentId) return;

      const studentId =
        typeof item.studentId === "object"
          ? item.studentId._id
          : item.studentId;

      if (!studentId) return;

      const studentName =
        typeof item.studentId === "object"
          ? item.studentId.name ||
            item.studentId.fullName ||
            item.studentId.email ||
            `Student ${studentId}`
          : `Student ${studentId}`;

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: studentName,
        });
      }
    });

    return Array.from(studentMap.values());
  }, [progress]);

  // Get progress belonging to selected student
  const selectedStudentProgress = useMemo(() => {
    if (!selectedStudentId) return [];

    return progress.filter((item) => {
      const studentId =
        typeof item.studentId === "object"
          ? item.studentId._id
          : item.studentId;

      return studentId === selectedStudentId;
    });
  }, [progress, selectedStudentId]);

  const selectedStudent = students.find(
    (student) => student.id === selectedStudentId
  );

  // Statistics
  const completed = selectedStudentProgress.filter(
    (item) => item.status === "Completed"
  ).length;

  const inProgress = selectedStudentProgress.filter(
    (item) => item.status === "In Progress"
  ).length;

  const notStarted = selectedStudentProgress.filter(
    (item) => item.status === "Not Started"
  ).length;

  const needsImprovement = selectedStudentProgress.filter(
    (item) => item.status === "Needs Improvement"
  ).length;

  // Overall progress
  const totalTopics = selectedStudentProgress.length;

  const progressPercentage =
    totalTopics > 0
      ? Math.round((completed / totalTopics) * 100)
      : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 w-56 rounded bg-gray-200" />

          <div className="mt-2 h-4 w-80 rounded bg-gray-200" />

          <div className="mt-6 h-28 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Student Progress
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track the progress of your assigned students.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Student Selector */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <UserRound size={18} className="text-gray-600" />

          <label
            htmlFor="student"
            className="text-sm font-semibold text-gray-800"
          >
            Select Student
          </label>
        </div>

        <select
          id="student"
          value={selectedStudentId}
          onChange={(event) =>
            setSelectedStudentId(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-96"
        >
          <option value="">Choose a student...</option>

          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>

        {students.length === 0 && !error && (
          <p className="mt-3 text-sm text-gray-500">
            No progress records available.
          </p>
        )}
      </div>

      {/* Empty State */}
      {!selectedStudent && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <TrendingUp
            size={42}
            className="mx-auto mb-4 text-gray-300"
          />

          <h2 className="text-lg font-semibold text-gray-700">
            Select a student
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose a student above to view their progress.
          </p>
        </div>
      )}

      {/* Selected Student */}
      {selectedStudent && (
        <div className="mt-6 space-y-6">
          {/* Student Overview */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedStudent.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {totalTopics} topics tracked
                </p>
              </div>

              <div className="w-full md:w-72">
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Overall Progress
                  </span>

                  <span className="text-sm font-bold text-gray-900">
                    {progressPercentage}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Completed"
              value={completed}
              icon={CheckCircle2}
              iconClass="bg-green-50 text-green-600"
            />

            <StatCard
              title="In Progress"
              value={inProgress}
              icon={Clock3}
              iconClass="bg-yellow-50 text-yellow-600"
            />

            <StatCard
              title="Not Started"
              value={notStarted}
              icon={Circle}
              iconClass="bg-gray-100 text-gray-500"
            />

            <StatCard
              title="Needs Improvement"
              value={needsImprovement}
              icon={AlertCircle}
              iconClass="bg-red-50 text-red-600"
            />
          </div>

          {/* Topic Progress */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900">
                Topic Progress
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current progress for each topic.
              </p>
            </div>

            <div>
              {selectedStudentProgress.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No progress records found for this student.
                </div>
              ) : (
                selectedStudentProgress.map((item) => {
                  const config =
                    statusConfig[item.status] ||
                    statusConfig["Not Started"];

                  const Icon = config.icon;

                  return (
                    <div
                      key={item._id}
                      className="flex flex-col gap-3 border-b border-gray-100 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.topic}
                        </p>

                        {item.notes && (
                          <p className="mt-1 text-sm text-gray-500">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      <div
                        className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${config.className}`}
                      >
                        <Icon size={16} />

                        <span>{item.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}