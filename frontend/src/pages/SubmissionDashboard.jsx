import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";

function SubmissionDashboard() {
  const [search, setSearch] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD STUDENT SUBMISSIONS
  // ==========================================
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Loading student submissions...");

        const response = await apiClient.get("/submissions/my");

        console.log(
          "Submissions response:",
          response.data
        );

        setSubmissions(
          response.data?.submissions || []
        );
      } catch (err) {
        console.error(
          "Failed to load submissions:",
          err
        );

        console.error(
          "Backend response:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            "Failed to load submissions"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================
  const filteredSubmissions = submissions.filter(
    (submission) => {
      const title =
        submission.assignmentId?.title || "";

      return title
        .toLowerCase()
        .includes(search.toLowerCase());
    }
  );

  // ==========================================
  // STATUS STYLE
  // ==========================================
  const getStatusStyle = (status) => {
    switch (status) {
      case "Graded":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";

      case "Needs Resubmission":
        return "bg-red-50 text-red-700 border border-red-200";

      case "Submitted":
      default:
        return "bg-[#e5f1ed] text-[#185848] border border-blue-200";
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading submissions...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error) {
    return (
      <div className="rounded-2xl border dark:border-[#15253f] border-red-200 bg-white dark:bg-[#0b1528] p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
          ⚠️
        </div>

        <h2 className="text-xl font-bold text-red-600">
          Failed to load submissions
        </h2>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {error}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-[#1f6f5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#185848]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ======================================
          PAGE HEADER
      ====================================== */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Submissions
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Track your submitted assignments and
          feedback.
        </p>
      </div>

      {/* ======================================
          SEARCH
      ====================================== */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search submissions..."
          className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
        />
      </div>

      {/* ======================================
          SUBMISSIONS TABLE
      ====================================== */}
      {filteredSubmissions.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              {/* TABLE HEADER */}
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] text-left">
                  <th className="px-6 py-4 text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                    ASSIGNMENT
                  </th>

                  <th className="px-6 py-4 text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                    SUBMITTED
                  </th>

                  <th className="px-6 py-4 text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                    STATUS
                  </th>

                  <th className="px-6 py-4 text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                    GRADE
                  </th>

                  <th className="px-6 py-4 text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">
                    FEEDBACK
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>
                {filteredSubmissions.map(
                  (submission) => {
                    const status =
                      submission.status ||
                      "Submitted";

                    return (
                      <tr
                        key={submission._id}
                        className="border-b border-slate-100 dark:border-[#15253f] transition hover:bg-slate-50 dark:bg-[#070e1b] last:border-0"
                      >
                        {/* ASSIGNMENT */}
                        <td className="px-6 py-5">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {submission
                              .assignmentId
                              ?.title ||
                              "Assignment"}
                          </div>

                          {submission
                            .assignmentId
                            ?.course && (
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {
                                submission
                                  .assignmentId
                                  .course
                              }
                            </div>
                          )}
                        </td>

                        {/* SUBMITTED DATE */}
                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                          {submission.submittedAt
                            ? new Date(
                                submission.submittedAt
                              ).toLocaleDateString()
                            : submission.createdAt
                            ? new Date(
                                submission.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* GRADE */}
                        <td className="px-6 py-5">
                          {submission.grade !==
                            null &&
                          submission.grade !==
                            undefined ? (
                            <span className="font-bold text-[#185848]">
                              {submission.grade}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* FEEDBACK */}
                        <td className="max-w-xs px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                          {submission.feedback ||
                            "Waiting for review"}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================================
           EMPTY STATE
        ====================================== */
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-12 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e5f1ed] text-2xl">
            📋
          </div>

          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {search
              ? "No matching submissions"
              : "No submissions yet"}
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {search
              ? "Try a different assignment name."
              : "Your submitted assignments will appear here."}
          </p>

          {!search && (
            <Link
              to="/student/assignments"
              className="mt-6 inline-flex rounded-lg bg-[#1f6f5b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#185848]"
            >
              View Assignments
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default SubmissionDashboard;