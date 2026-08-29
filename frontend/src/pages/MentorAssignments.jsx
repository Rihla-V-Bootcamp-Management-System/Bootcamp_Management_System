import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock,
  Search,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import apiClient from "../services/apiClient";

function MentorAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =========================================================
  // FETCH ASSIGNMENTS
  // =========================================================

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/assignments");

      const data =
        response.data?.assignments ||
        response.data?.data ||
        response.data ||
        [];

      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Mentor assignments error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // NORMALIZE COURSE
  // =========================================================

  const getCourseName = (assignment) => {
    if (!assignment?.course) {
      return "General";
    }

    if (typeof assignment.course === "string") {
      return assignment.course;
    }

    return (
      assignment.course.name ||
      assignment.course.title ||
      "General"
    );
  };

  // =========================================================
  // NORMALIZE BATCH
  // =========================================================

  const getBatchName = (assignment) => {
    if (!assignment?.batchId) {
      return "All Batches";
    }

    if (typeof assignment.batchId === "string") {
      return "Assigned Batch";
    }

    return (
      assignment.batchId.name ||
      assignment.batchId.batchName ||
      assignment.batchId.title ||
      "Assigned Batch"
    );
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getAssignmentStatus = (assignment) => {
    if (assignment?.published === false) {
      return "draft";
    }

    if (!assignment?.deadline) {
      return "active";
    }

    const deadline = new Date(assignment.deadline);

    if (deadline < new Date()) {
      return "expired";
    }

    return "active";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "draft":
        return "Draft";

      case "expired":
        return "Expired";

      default:
        return "Active";
    }
  };

  // =========================================================
  // FILTER ASSIGNMENTS
  // =========================================================

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const courseName = getCourseName(assignment);
      const batchName = getBatchName(assignment);

      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        assignment.title
          ?.toLowerCase()
          .includes(searchText) ||
        assignment.description
          ?.toLowerCase()
          .includes(searchText) ||
        courseName
          .toLowerCase()
          .includes(searchText) ||
        batchName
          .toLowerCase()
          .includes(searchText);

      const status = getAssignmentStatus(
        assignment
      );

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    assignments,
    search,
    statusFilter,
  ]);

  // =========================================================
  // GROUP BY COURSE
  // =========================================================

  const groupedAssignments = useMemo(() => {
    return filteredAssignments.reduce(
      (groups, assignment) => {
        const courseName =
          getCourseName(assignment);

        if (!groups[courseName]) {
          groups[courseName] = [];
        }

        groups[courseName].push(assignment);

        return groups;
      },
      {}
    );
  }, [filteredAssignments]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalAssignments =
    assignments.length;

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        getAssignmentStatus(assignment) ===
        "active"
    ).length;

  const expiredAssignments =
    assignments.filter(
      (assignment) =>
        getAssignmentStatus(assignment) ===
        "expired"
    ).length;

  const totalTopics = assignments.reduce(
    (total, assignment) =>
      total + (assignment.topics?.length || 0),
    0
  );

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDeadline = (deadline) => {
    if (!deadline) {
      return "No deadline";
    }

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return "Invalid deadline";
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================================================
  // OPEN ASSIGNMENT
  // =========================================================

  const openAssignment = (assignmentId) => {
    navigate(
      `/mentor/assignments/${assignmentId}`
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-slate-200" />

            <div className="h-4 w-96 rounded bg-slate-200" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-xl bg-slate-200"
                />
              ))}
            </div>

            <div className="h-20 rounded-xl bg-slate-200" />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <div
                    key={item}
                    className="h-56 rounded-xl bg-slate-200"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="mt-0.5 text-red-600"
              />

              <div className="flex-1">
                <h2 className="font-semibold text-red-800">
                  Unable to load assignments
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchAssignments}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <ClipboardList size={16} />
                Mentor Workspace
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Assignments
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                View assignments assigned to your
                students, review their requirements,
                and manage submissions.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAssignments}
              className="inline-flex items-center justify-center gap-2 rounded-lg border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:bg-[#070e1b]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Assignments
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {totalAssignments}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 dark:bg-[#070e1b] p-3">
                <ClipboardList
                  size={20}
                  className="text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* ACTIVE */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {activeAssignments}
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50 p-3">
                <BookOpen
                  size={20}
                  className="text-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* EXPIRED */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Expired
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {expiredAssignments}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-3">
                <Clock
                  size={20}
                  className="text-red-600"
                />
              </div>
            </div>
          </div>

          {/* TOPICS */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Topics
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {totalTopics}
                </p>
              </div>

              <div className="rounded-lg bg-[#e5f1ed] p-3">
                <BookOpen
                  size={20}
                  className="text-[#1f6f5b]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTER BAR
        ================================================== */}

        <div className="mb-8 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search assignments, courses, or batches..."
                className="w-full rounded-lg border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Status:
              </span>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-lg border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">
                  All
                </option>

                <option value="active">
                  Active
                </option>

                <option value="expired">
                  Expired
                </option>

                <option value="draft">
                  Draft
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {filteredAssignments.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-[#070e1b]">
              <ClipboardList
                size={24}
                className="text-slate-500 dark:text-slate-400"
              />
            </div>

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              No assignments found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {search
                ? "Try changing your search or filter."
                : "There are currently no assignments available for your students."}
            </p>
          </div>
        ) : (
          /* =================================================
             COURSE GROUPS
          ================================================== */

          <div className="space-y-8">
            {Object.entries(
              groupedAssignments
            ).map(
              ([
                courseName,
                courseAssignments,
              ]) => (
                <section
                  key={courseName}
                  className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm"
                >

                  {/* COURSE HEADER */}

                  <div className="border-b border-slate-200 dark:border-[#15253f] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-slate-100 dark:bg-[#070e1b] p-3">
                          <BookOpen
                            size={20}
                            className="text-slate-700 dark:text-slate-200"
                          />
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {courseName}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {
                              courseAssignments.length
                            }{" "}
                            assignment
                            {courseAssignments.length !==
                            1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/mentor/assignments/course/${encodeURIComponent(
                              courseName
                            )}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:bg-[#070e1b]"
                      >
                        View Course
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* ASSIGNMENT CARDS */}

                  <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
                    {courseAssignments.map(
                      (assignment) => {
                        const status =
                          getAssignmentStatus(
                            assignment
                          );

                        return (
                          <article
                            key={assignment._id}
                            className="group flex flex-col rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 transition duration-200 hover:border-slate-300 dark:border-[#15253f] hover:shadow-md"
                          >
                            {/* TOP */}

                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="line-clamp-2 font-semibold text-slate-900 dark:text-white">
                                  {assignment.title ||
                                    "Untitled Assignment"}
                                </h3>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  status ===
                                  "active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : status ===
                                      "expired"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {getStatusLabel(
                                  status
                                )}
                              </span>
                            </div>

                            {/* DESCRIPTION */}

                            <p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                              {assignment.description ||
                                "No description provided."}
                            </p>

                            {/* INFO */}

                            <div className="mt-5 space-y-3 border-t border-slate-100 dark:border-[#15253f] pt-4">

                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Users
                                  size={16}
                                  className="text-slate-400"
                                />

                                <span className="truncate">
                                  {getBatchName(
                                    assignment
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <CalendarDays
                                  size={16}
                                  className="text-slate-400"
                                />

                                <span>
                                  {formatDeadline(
                                    assignment.deadline
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                <span>
                                  {assignment.topics
                                    ?.length ||
                                    0}{" "}
                                  topics
                                </span>

                                <span>
                                  {assignment.maxScore ??
                                    0}{" "}
                                  points
                                </span>
                              </div>
                            </div>

                            {/* ACTION */}

                            <button
                              type="button"
                              onClick={() =>
                                openAssignment(
                                  assignment._id
                                )
                              }
                              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f6f5b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185848]"
                            >
                              View Assignment
                              <ChevronRight
                                size={16}
                              />
                            </button>
                          </article>
                        );
                      }
                    )}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorAssignments;