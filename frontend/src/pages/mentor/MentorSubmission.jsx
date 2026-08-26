import { useEffect, useState } from "react";
import {
  Eye,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

function MentorSubmission() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD MENTOR SUBMISSIONS
  // GET /api/submissions/mentor
  // ============================================================
  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/submissions/mentor"
      );

      setSubmissions(
        response.data?.submissions || []
      );
    } catch (err) {
      console.error(
        "Load mentor submissions error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // ============================================================
  // STATUS STYLE
  // ============================================================
  const getStatusClass = (status) => {
    if (status === "Graded") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Needs Resubmission") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // ============================================================
  // OPEN REVIEW PAGE
  // ============================================================
  const openReview = (submissionId) => {
    navigate(
      `/mentor/submissions/${submissionId}`
    );
  };

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* ======================================================
            HEADER
        ====================================================== */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Submissions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and grade student submissions.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSubmissions}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ======================================================
            LOADING
        ====================================================== */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <RefreshCw
              className="mx-auto mb-3 animate-spin text-gray-700"
              size={28}
            />

            <p className="text-sm text-slate-500">
              Loading submissions...
            </p>
          </div>
        ) : submissions.length === 0 ? (

          /* ====================================================
              EMPTY STATE
          ==================================================== */
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <Upload
              className="mx-auto mb-3 text-slate-400"
              size={36}
            />

            <h2 className="font-semibold text-slate-800">
              No submissions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              There are no submissions from your
              batches yet.
            </p>
          </div>

        ) : (

          /* ====================================================
              SUBMISSIONS TABLE
          ==================================================== */
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">

                {/* TABLE HEADER */}
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Assignment
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Grade
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody className="divide-y divide-slate-100">
                  {submissions.map(
                    (submission) => (
                      <tr
                        key={submission._id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* STUDENT */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {submission
                              .studentId
                              ?.fullName ||
                              submission
                                .studentId
                                ?.name ||
                              "Unknown Student"}
                          </div>

                          <div className="text-xs text-slate-500">
                            {submission
                              .studentId
                              ?.email || ""}
                          </div>
                        </td>

                        {/* ASSIGNMENT */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-800">
                            {submission
                              .assignmentId
                              ?.title ||
                              "Assignment"}
                          </div>
                        </td>

                        {/* SUBMITTED DATE */}
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {submission.submittedAt
                            ? new Date(
                                submission.submittedAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              submission.status
                            )}`}
                          >
                            {submission.status ||
                              "Submitted"}
                          </span>
                        </td>

                        {/* GRADE */}
                        <td className="px-5 py-4">
                          {submission.grade !==
                            null &&
                          submission.grade !==
                            undefined ? (
                            <span className="font-semibold text-slate-900">
                              {submission.grade}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Not graded
                            </span>
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openReview(
                                submission._id
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                          >
                            <Eye size={16} />

                            Review
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorSubmission;