import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react";
import apiClient from "../services/apiClient";

function StudentSubmissions() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD SUBMISSIONS
  // =====================================================

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/submissions/my");

      setSubmissions(
        response.data?.submissions || []
      );
    } catch (err) {
      console.error("Get submissions error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Graded":
        return {
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
        };

      case "Needs Resubmission":
        return {
          className:
            "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
        };

      case "Submitted":
      default:
        return {
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
        };
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] p-5 sm:p-6 md:p-8">
      <main className="mx-auto w-full max-w-5xl">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() => navigate("/student/assignments")}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-[#111827] transition hover:text-slate-500 dark:text-slate-400"
        >
          <ArrowLeft size={17} />
          Back to Assignments
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">
          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f6f5b] hover:bg-[#185848] text-white shadow-sm">
              <FileText size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Student
              </p>

              <p className="text-sm font-semibold text-[#111827]">
                Submissions
              </p>
            </div>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            My Submissions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            View the assignments you have submitted and
            their grades.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchSubmissions}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#185848]"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-8 text-center shadow-sm">
            <RefreshCw
              size={24}
              className="mx-auto animate-spin text-[#111827]"
            />

            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading submissions...
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          submissions.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-10 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#070e1b] text-[#111827]">
                <FileText size={22} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                No submissions yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                You have not submitted any assignments yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/assignments")
                }
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185848]"
              >
                View Assignments
              </button>
            </div>
          )}

        {/* =================================================
            SUBMISSIONS
        ================================================= */}

        {!loading &&
          !error &&
          submissions.length > 0 && (
            <div className="space-y-4">

              {submissions.map((submission) => {
                const assignment =
                  submission.assignmentId;

                const status =
                  getStatusStyle(
                    submission.status
                  );

                const StatusIcon =
                  status.icon;

                return (
                  <div
                    key={submission._id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm"
                  >

                    {/* CARD HEADER */}

                    <div className="border-b border-slate-200 dark:border-[#15253f] px-5 py-5 sm:px-6">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0">

                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {assignment?.title ||
                              "Assignment"}
                          </h2>

                          {assignment?.description && (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                              {assignment.description}
                            </p>
                          )}

                        </div>

                        {/* STATUS */}

                        <div
                          className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                        >
                          <StatusIcon size={14} />
                          {submission.status ||
                            "Submitted"}
                        </div>

                      </div>

                    </div>

                    {/* CARD BODY */}

                    <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">

                      {/* SUBMITTED */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {formatDate(
                            submission.submittedAt
                          )}
                        </p>
                      </div>

                      {/* GRADE */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Grade
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {submission.grade !==
                            null &&
                          submission.grade !==
                            undefined
                            ? `${submission.grade}${
                                assignment?.maxScore
                                  ? ` / ${assignment.maxScore}`
                                  : ""
                              }`
                            : "Not graded"}
                        </p>
                      </div>

                      {/* DEADLINE */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Deadline
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {formatDate(
                            assignment?.deadline
                          )}
                        </p>
                      </div>

                    </div>

                    {/* FEEDBACK */}

                    {submission.feedback && (
                      <div className="border-t border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-5 py-5 sm:px-6">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Mentor Feedback
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                          {submission.feedback}
                        </p>

                      </div>
                    )}

                    {/* CARD FOOTER */}

                    <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                      <p className="text-xs text-slate-400">
                        Submission ID:{" "}
                        {submission._id}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          assignment?._id &&
                          navigate(
                            `/student/assignments/${assignment._id}`
                          )
                        }
                        className="inline-flex items-center justify-center rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185848]"
                      >
                        View Assignment
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </main>
    </div>
  );
}

export default StudentSubmissions;