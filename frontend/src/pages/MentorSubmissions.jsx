import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

function MentorSubmissions() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/submissions/mentor/submissions"
      );

      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  const openSubmission = (submission) => {
    setSelected(submission);
    setGrade(
      submission.grade !== null &&
        submission.grade !== undefined
        ? submission.grade
        : ""
    );
    setFeedback(submission.feedback || "");
  };

  const closeSubmission = () => {
    setSelected(null);
    setGrade("");
    setFeedback("");
  };

  const handleGrade = async (e) => {
    e.preventDefault();

    if (grade === "") {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await apiClient.patch(
        `/submissions/${selected._id}/grade`,
        {
          grade: Number(grade),
          feedback,
        }
      );

      const updated = response.data.submission;

      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === updated._id
            ? updated
            : item
        )
      );

      setSelected(updated);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to grade submission"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center px-8">
        <h1 className="text-[22px] font-bold text-[#0f1b3d]">
          ASTU MSJ
        </h1>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 md:px-8 py-10 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back
        </button>

        <div className="mb-7">
          <h2 className="text-3xl font-bold text-[#0f1b3d] mb-2">
            Submission Review
          </h2>

          <p className="text-sm text-slate-500">
            Review student submissions and provide grades
            and feedback.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading submissions...
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-slate-400">
              No submissions yet.
            </p>
          </div>
        ) : (
          <section className="bg-white rounded-xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500">
                      STUDENT
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500">
                      ASSIGNMENT
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500">
                      SUBMITTED
                    </th>

                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500">
                      STATUS
                    </th>

                    <th className="text-right px-5 py-4 text-xs font-bold text-slate-500">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium">
                          {submission.studentId?.name ||
                            "Unknown Student"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {submission.studentId?.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {submission.assignmentId?.title ||
                          "Assignment"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(
                          submission.submittedAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            submission.grade !== null &&
                            submission.grade !== undefined
                              ? "bg-green-50 text-green-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {submission.grade !== null &&
                          submission.grade !== undefined
                            ? "Graded"
                            : "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            openSubmission(
                              submission
                            )
                          }
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
              <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#0f1b3d]">
                    Review Submission
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {selected.studentId?.name}
                  </p>
                </div>

                <button
                  onClick={closeSubmission}
                  className="text-slate-400 hover:text-slate-700 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">
                    Assignment
                  </p>

                  <p className="font-semibold text-slate-800">
                    {selected.assignmentId?.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-2">
                    GitHub Repository
                  </p>

                  <a
                    href={selected.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline break-all"
                  >
                    {selected.githubUrl}
                  </a>
                </div>

                {selected.liveDemoUrl && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">
                      Live Demo
                    </p>

                    <a
                      href={selected.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline break-all"
                    >
                      {selected.liveDemoUrl}
                    </a>
                  </div>
                )}

                {selected.notes && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2">
                      Student Notes
                    </p>

                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 whitespace-pre-wrap">
                      {selected.notes}
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleGrade}
                  className="border-t border-slate-200 pt-6 space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Grade
                    </label>

                    <input
                      type="number"
                      min="0"
                      max={
                        selected.assignmentId
                          ?.maxScore
                      }
                      value={grade}
                      onChange={(e) =>
                        setGrade(e.target.value)
                      }
                      placeholder={`Maximum: ${
                        selected.assignmentId
                          ?.maxScore || ""
                      }`}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback
                    </label>

                    <textarea
                      rows="5"
                      value={feedback}
                      onChange={(e) =>
                        setFeedback(e.target.value)
                      }
                      placeholder="Write feedback for the student..."
                      className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeSubmission}
                      className="rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {saving
                        ? "Saving..."
                        : "Save Grade & Feedback"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MentorSubmissions;