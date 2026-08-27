import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";

function StudentGrades() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading student grades...");

      const response = await apiClient.get("/submissions/my");

      console.log("Student grades response:", response.data);

      setSubmissions(response.data?.submissions || []);
    } catch (err) {
      console.error("Load student grades error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load grades."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  const getAssignmentTitle = (submission) => {
    return (
      submission.assignmentId?.title ||
      "Assignment"
    );
  };

  const getCourse = (submission) => {
    return (
      submission.assignmentId?.course ||
      "-"
    );
  };

  const getStatus = (submission) => {
    if (submission.status === "Needs Resubmission") {
      return "Needs Resubmission";
    }

    if (
      submission.grade !== undefined &&
      submission.grade !== null
    ) {
      return "Graded";
    }

    return "Pending";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-900">
            My Grades
          </h1>

          <p className="mt-4 text-sm text-slate-500">
            Loading your grades...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            My Grades
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View your assignment grades and mentor feedback.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {submissions.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">
              No grades yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your submitted assignments and grades will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {submissions.map((submission) => {
              const assignment =
                submission.assignmentId;

              const status =
                getStatus(submission);

              return (
                <div
                  key={submission._id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >

                  {/* ASSIGNMENT INFO */}
                  <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {getAssignmentTitle(
                          submission
                        )}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-blue-600">
                        {getCourse(submission)}
                      </p>
                    </div>

                    {/* STATUS */}
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        status === "Graded"
                          ? "bg-green-100 text-green-700"
                          : status ===
                            "Needs Resubmission"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* GRADE */}
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Score
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {submission.grade ??
                          "Not graded"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Maximum Score
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {assignment?.maxScore ??
                          "-"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Graded At
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {formatDate(
                          submission.gradedAt
                        )}
                      </p>
                    </div>

                  </div>

                  {/* FEEDBACK */}
                  <div className="mt-5">

                    <h3 className="text-sm font-semibold text-slate-800">
                      Mentor Feedback
                    </h3>

                    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">

                      {submission.feedback ? (
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {submission.feedback}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400">
                          No feedback yet.
                        </p>
                      )}

                    </div>

                  </div>

                  {/* MENTOR */}
                  {submission.gradedBy && (
                    <div className="mt-4 text-xs text-slate-500">
                      Graded by{" "}
                      <span className="font-medium text-slate-700">
                        {submission.gradedBy.name ||
                          submission.gradedBy.email}
                      </span>
                    </div>
                  )}

                  {/* SUBMISSION DATE */}
                  <p className="mt-3 text-xs text-slate-400">
                    Submitted:{" "}
                    {formatDate(
                      submission.submittedAt
                    )}
                  </p>

                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}

export default StudentGrades;