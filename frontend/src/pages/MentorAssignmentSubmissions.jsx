import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCcw,
  User,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import apiClient from "../services/apiClient";

function MentorAssignmentSubmissions() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(
    async (isRefresh = false) => {
      if (!assignmentId) {
        setError("Assignment ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        console.log(
          "Loading submissions for assignment:",
          assignmentId
        );

        const response = await apiClient.get(
          `/submissions/assignment/${assignmentId}`
        );

        console.log(
          "Assignment submissions response:",
          response.data
        );

        const data = response.data || {};

        setSubmissions(
          Array.isArray(data.submissions)
            ? data.submissions
            : []
        );

        setAssignment(
          data.assignment ||
            data.assignmentId ||
            null
        );
      } catch (err) {
        console.error(
          "Load assignment submissions error:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your session has expired. Please log in again."
          );
        } else if (err.response?.status === 403) {
          setError(
            "You are not authorized to view these submissions."
          );
        } else if (err.response?.status === 404) {
          setError(
            "Assignment or submissions not found."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load submissions."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [assignmentId]
  );

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const getStudentName = (submission) => {
    return (
      submission?.studentId?.name ||
      submission?.student?.name ||
      submission?.user?.name ||
      "Unknown Student"
    );
  };

  const getStudentEmail = (submission) => {
    return (
      submission?.studentId?.email ||
      submission?.student?.email ||
      submission?.user?.email ||
      ""
    );
  };

  const getGrade = (submission) => {
    if (
      submission?.grade === null ||
      submission?.grade === undefined ||
      submission?.grade === ""
    ) {
      return null;
    }

    return submission.grade;
  };

  const getStatus = (submission) => {
    const grade = getGrade(submission);

    if (submission?.status) {
      return String(submission.status).toLowerCase();
    }

    if (
      submission?.resubmissionRequested === true ||
      submission?.requiresResubmission === true
    ) {
      return "resubmit";
    }

    if (grade !== null) {
      return "graded";
    }

    return "pending";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString();
  };

  const stats = useMemo(() => {
    const total = submissions.length;

    const graded = submissions.filter(
      (submission) =>
        getGrade(submission) !== null
    ).length;

    const pending = submissions.filter(
      (submission) =>
        getGrade(submission) === null &&
        getStatus(submission) !== "resubmit"
    ).length;

    const resubmissions = submissions.filter(
      (submission) =>
        getStatus(submission) === "resubmit"
    ).length;

    return {
      total,
      graded,
      pending,
      resubmissions,
    };
  }, [submissions]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "graded":
        return "bg-green-50 text-green-700 border-green-200";

      case "resubmit":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "pending":
      default:
        return "bg-[#e5f1ed] text-[#185848] border-blue-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "graded":
        return "Graded";

      case "resubmit":
        return "Resubmission Requested";

      case "pending":
      default:
        return "Pending Review";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white dark:bg-[#0b1528] shadow-sm">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#1f6f5b]" />

              <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                Loading submissions...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please wait
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/mentor/assignments/${assignmentId}`
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:text-[#1f6f5b]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignment
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-medium text-[#1f6f5b]">
                Mentor
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                Assignment Submissions
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Review and grade student submissions.
              </p>

              {assignment?.title && (
                <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
                  {assignment.title}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => loadSubmissions(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:bg-[#070e1b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="font-medium text-red-800">
                Unable to load submissions
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Graded
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.graded}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1f6f5b]">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Resubmissions
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {stats.resubmissions}
            </p>
          </div>
        </div>

        {/* EMPTY */}
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-[#070e1b]">
              <User className="h-7 w-7 text-slate-400" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No submissions yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Students have not submitted this assignment yet.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm md:block">
              <div className="border-b border-slate-100 dark:border-[#15253f] px-6 py-4">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Student Submissions
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select a submission to review.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Student
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Submitted
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Grade
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {submissions.map((submission) => {
                      const status =
                        getStatus(submission);

                      const grade =
                        getGrade(submission);

                      return (
                        <tr
                          key={submission._id}
                          className="border-b border-slate-100 dark:border-[#15253f] last:border-0 hover:bg-slate-50 dark:bg-[#070e1b]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f1ed]">
                                <User className="h-5 w-5 text-[#1f6f5b]" />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {getStudentName(
                                    submission
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {getStudentEmail(
                                    submission
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <Clock3 className="h-4 w-4" />

                              {formatDate(
                                submission.submittedAt
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            {grade !== null ? (
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {grade}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">
                                Not graded
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(
                                status
                              )}`}
                            >
                              {status === "graded" && (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}

                              {status === "pending" && (
                                <Clock3 className="h-3.5 w-3.5" />
                              )}

                              {status === "resubmit" && (
                                <RefreshCcw className="h-3.5 w-3.5" />
                              )}

                              {getStatusLabel(status)}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/mentor/submissions/${submission._id}`
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-[#1f6f5b] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#185848]"
                            >
                              <Eye className="h-4 w-4" />
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}
            <div className="space-y-4 md:hidden">
              {submissions.map((submission) => {
                const status =
                  getStatus(submission);

                const grade =
                  getGrade(submission);

                return (
                  <div
                    key={submission._id}
                    className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f1ed]">
                          <User className="h-5 w-5 text-[#1f6f5b]" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {getStudentName(
                              submission
                            )}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {getStudentEmail(
                              submission
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-[#15253f] pt-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                          {formatDate(
                            submission.submittedAt
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Grade
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {grade !== null
                            ? grade
                            : "Not graded"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/mentor/submissions/${submission._id}`
                        )
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f6f5b] px-4 py-3 text-sm font-medium text-white hover:bg-[#185848]"
                    >
                      <Eye className="h-4 w-4" />
                      Review Submission
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MentorAssignmentSubmissions;