import { useState } from "react";
import { TrendingUp } from "lucide-react";

function StudentProgress() {
  const [filter, setFilter] = useState("All");
  // Later, this data will come from the backend.
  const progressData = [];

  const filteredProgress =
    filter === "All"
      ? progressData
      : progressData.filter((item) => item.status === filter);

  // These will automatically be calculated from backend data later.
  const completed = progressData.filter(
    (item) => item.status === "Completed"
  ).length;

  const inProgress = progressData.filter(
    (item) => item.status === "In Progress"
  ).length;

  const needsImprovement = progressData.filter(
    (item) => item.status === "Needs Improvement"
  ).length;

  const notStarted = progressData.filter(
    (item) => item.status === "Not Started"
  ).length;

  // Later this will come from the student's actual progress.
  const overallProgress = 0;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Progress
        </h1>

        <p className="mt-2 text-gray-600">
          Track your learning progress across bootcamp topics.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">

        <div className="flex flex-col items-center gap-8 md:flex-row">

          {/* Progress Circle */}
          <div
            className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(
                #0f172a ${overallProgress * 3.6}deg,
                #e2e8f0 0deg
              )`,
            }}
          >
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-3xl font-bold text-gray-900">
                {overallProgress}%
              </span>

              <span className="text-xs uppercase text-gray-500">
                Overall
              </span>
            </div>
          </div>

          {/* Progress Statistics */}
          <div className="grid flex-1 grid-cols-2 gap-6 md:grid-cols-4">

            {/* Completed */}
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {completed}
              </p>

              <p className="mt-1 text-sm text-green-600">
                <span className="mr-1">●</span>
                Completed
              </p>
            </div>

            {/* In Progress */}
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {inProgress}
              </p>

              <p className="mt-1 text-sm text-blue-600">
                <span className="mr-1">●</span>
                In Progress
              </p>
            </div>

            {/* Needs Improvement */}
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {needsImprovement}
              </p>

              <p className="mt-1 text-sm text-orange-500">
                <span className="mr-1">●</span>
                Needs Improvement
              </p>
            </div>

            {/* Not Started */}
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {notStarted}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                <span className="mr-1">●</span>
                Not Started
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* My Learning Progress */}
      <div className="rounded-xl border bg-white shadow-sm">

        {/* Header */}
        <div className="flex flex-col gap-4 border-b p-6 md:flex-row md:items-center md:justify-between">

          <h2 className="text-lg font-semibold text-gray-900">
            My Learning Progress
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">

            {[
              "All",
              "Completed",
              "In Progress",
              "Needs Improvement",
              "Not Started",
            ].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  filter === option
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}

          </div>
        </div>

        {/* Progress Content */}
        <div className="p-6">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b pb-3 text-xs font-medium uppercase tracking-wide text-gray-500">

            <div className="col-span-4">
              Topic
            </div>

            <div className="col-span-6">
              Progress
            </div>

            <div className="col-span-2 text-right">
              Status
            </div>

          </div>

          {/* No Topics Yet */}
          {filteredProgress.length === 0 && (
            <div className="py-16 text-center">

              <TrendingUp className="mx-auto h-10 w-10 text-gray-300" />

              <h3 className="mt-4 font-medium text-gray-700">
                No topics assigned yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Your learning topics and progress will appear here
                after your mentor assigns them.
              </p>

            </div>
          )}

          {/* Topics From Backend */}
          {filteredProgress.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center gap-4 border-b py-5 last:border-0"
            >

              {/* Topic */}
              <div className="col-span-4 text-sm font-medium text-gray-900">
                {item.topic}
              </div>

              {/* Progress */}
              <div className="col-span-6 flex items-center gap-3">

                <div className="h-2 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gray-900 transition-all"
                    style={{
                      width: `${item.progress}%`,
                    }}
                  />
                </div>

                <span className="w-10 text-right text-xs text-gray-600">
                  {item.progress}%
                </span>

              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-end">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : item.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : item.status === "Needs Improvement"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status}
                </span>

              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}

export default StudentProgress;