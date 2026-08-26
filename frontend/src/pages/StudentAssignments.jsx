import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  ArrowRight,
  CalendarDays,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import apiClient from "../services/apiClient";

function StudentAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ASSIGNMENTS
  // =====================================================

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/assignments");

      console.log("Assignments response:", response.data);

      const data =
        response.data?.assignments ||
        response.data?.data ||
        response.data;

      if (Array.isArray(data)) {
        setAssignments(data);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error("Failed to load assignments:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  // =====================================================
  // OPEN ASSIGNMENT
  // =====================================================

  const openAssignment = (assignmentId) => {
    if (!assignmentId) return;

    navigate(`/student/assignments/${assignmentId}`);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "No deadline";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No deadline";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =====================================================
  // COURSE NAME
  // =====================================================

  const getCourseName = (assignment) => {
    if (!assignment?.course) {
      return "Course";
    }

    if (typeof assignment.course === "object") {
      return (
        assignment.course.name ||
        assignment.course.title ||
        "Course"
      );
    }

    return assignment.course;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-5 sm:p-6 md:p-8">
        <main className="mx-auto w-full max-w-6xl">

          <div className="mb-8">
            <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="mt-6 h-10 w-full animate-pulse rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>

        </main>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-slate-50 p-5 sm:p-6 md:p-8">
      <main className="mx-auto w-full max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827] text-white">
                <ClipboardList size={20} />
              </div>

              <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Student
              </span>

            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Assignments
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View your assignments and open an assignment to see its details.
            </p>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={loadAssignments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={loadAssignments}
                className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-800"
              >
                Try again
              </button>
            </div>

          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!error && assignments.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <ClipboardList size={26} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              No Assignments
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don't have any assignments available right now.
            </p>

          </div>
        )}

        {/* =================================================
            ASSIGNMENT CARDS
        ================================================= */}

        {assignments.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {assignments.map((assignment) => {

              const assignmentId =
                assignment._id || assignment.id;

              const courseName =
                getCourseName(assignment);

              return (
                <div
                  key={assignmentId}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >

                  {/* CARD ICON */}

                  <div className="flex items-start justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <ClipboardList size={20} />
                    </div>

                    {assignment.published && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Published
                      </span>
                    )}

                  </div>

                  {/* TITLE */}

                  <h2 className="mt-5 line-clamp-2 text-lg font-bold text-slate-900">
                    {assignment.title || "Untitled Assignment"}
                  </h2>

                  {/* DESCRIPTION */}

                  <p className="mt-2 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">
                    {assignment.description ||
                      "No description provided for this assignment."}
                  </p>

                  {/* COURSE */}

                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">

                    <BookOpen
                      size={16}
                      className="shrink-0 text-slate-400"
                    />

                    <span className="truncate">
                      {courseName}
                    </span>

                  </div>

                  {/* DEADLINE */}

                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">

                    <CalendarDays
                      size={16}
                      className="shrink-0 text-slate-400"
                    />

                    <span>
                      {formatDate(assignment.deadline)}
                    </span>

                  </div>

                  {/* SPACER */}

                  <div className="flex-1" />

                  {/* OPEN BUTTON */}

                  <button
                    type="button"
                    onClick={() => openAssignment(assignmentId)}
                    disabled={!assignmentId}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View Assignment
                    <ArrowRight size={16} />
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </main>
    </div>
  );
}

export default StudentAssignments;