import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import apiClient from "../services/apiClient";

function MentorSubmissionReview() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD SUBMISSION
  // ============================================================
  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/submissions/mentor"
      );

      const list =
        response.data?.submissions || [];

      const found = list.find(
        (item) =>
          String(item._id) === String(submissionId)
      );

      if (!found) {
        setSubmission(null);
        setError("Submission not found");
        return;
      }

      setSubmission(found);

      if (
        found.grade !== null &&
        found.grade !== undefined
      ) {
        setGrade(String(found.grade));
      } else {
        setGrade("");
      }

      setFeedback(found.feedback || "");
    } catch (err) {
      console.error(
        "Load submission error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load submission"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  // ============================================================
  // GRADE SUBMISSION
  // ============================================================
  const handleGrade = async () => {
    setError("");
    setSuccess("");

    // Validate grade
    if (
      grade === "" ||
      grade === null ||
      grade === undefined
    ) {
      setError("Please enter a grade.");
      return;
    }

    const numericGrade = Number(grade);

    if (
      Number.isNaN(numericGrade) ||
      numericGrade < 0
    ) {
      setError("Please enter a valid grade.");
      return;
    }

    // Check maximum score
    const maxScore = submission?.assignmentId?.maxScore;

    if (
      maxScore !== undefined &&
      maxScore !== null &&
      numericGrade > Number(maxScore)
    ) {
      setError(
        `Grade cannot be greater than ${maxScore}.`
      );
      return;
    }

    try {
      setSaving(true);

      console.log(
        "================================"
      );
      console.log("GRADING SUBMISSION");
      console.log("Submission ID:", submissionId);
      console.log("Grade:", numericGrade);
      console.log("Feedback:", feedback);
      console.log(
        "================================"
      );

      const response = await apiClient.patch(
        `/submissions/${submissionId}/grade`,
        {
          grade: numericGrade,
          feedback: feedback.trim(),
        }
      );

      console.log(
        "Grade response:",
        response.data
      );

      // Backend returns updated submission
      const updatedSubmission =
        response.data?.submission;

      if (updatedSubmission) {
        setSubmission(updatedSubmission);

        setGrade(
          updatedSubmission.grade !== null &&
          updatedSubmission.grade !== undefined
            ? String(updatedSubmission.grade)
            : ""
        );

        setFeedback(
          updatedSubmission.feedback || ""
        );
      } else {
        // Fallback if backend does not return submission
        setSubmission((prev) => ({
          ...prev,
          grade: numericGrade,
          feedback: feedback.trim(),
          status: "Graded",
          gradedAt: new Date().toISOString(),
        }));
      }

      setSuccess(
        "Submission graded successfully."
      );
    } catch (err) {
      console.error(
        "Grade submission error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to grade submission."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // REQUEST RESUBMISSION
  // ============================================================
  const handleResubmission = async () => {
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      console.log(
        "Requesting resubmission:",
        submissionId
      );

      const response = await apiClient.patch(
        `/submissions/${submissionId}/resubmit`,
        {
          feedback: feedback.trim(),
        }
      );

      console.log(
        "Resubmission response:",
        response.data
      );

      const updatedSubmission =
        response.data?.submission;

      if (updatedSubmission) {
        setSubmission(updatedSubmission);

        setGrade(
          updatedSubmission.grade !== null &&
          updatedSubmission.grade !== undefined
            ? String(updatedSubmission.grade)
            : ""
        );

        setFeedback(
          updatedSubmission.feedback || ""
        );
      } else {
        setSubmission((prev) => ({
          ...prev,
          grade: null,
          feedback: feedback.trim(),
          status: "Needs Resubmission",
          gradedAt: new Date().toISOString(),
        }));

        setGrade("");
      }

      setSuccess(
        "Resubmission requested successfully."
      );
    } catch (err) {
      console.error(
        "Request resubmission error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to request resubmission."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] p-6">
        <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-10 text-center">
          <RefreshCw
            className="mx-auto mb-3 animate-spin text-gray-700 dark:text-slate-200"
            size={30}
          />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading submission...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // NOT FOUND
  // ============================================================
  if (!submission) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] p-6">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              navigate("/mentor/submissions")
            }
            className="mb-5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            <ArrowLeft size={17} />
            Back to Submissions
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Submission not found"}
          </div>
        </div>
      </div>
    );
  }

  const assignment =
    submission.assignmentId;

  const student =
    submission.studentId;

  const submissionData =
    submission.submissionData || {};

  // ============================================================
  // MAIN UI
  // ============================================================
  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] p-6">
      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            BACK BUTTON
        ====================================================== */}
        <button
          type="button"
          onClick={() =>
            navigate("/mentor/submissions")
          }
          className="mb-5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200"
        >
          <ArrowLeft size={17} />
          Back to Submissions
        </button>

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}
        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

            <div>
              <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
                Assignment Submission
              </p>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {assignment?.title || "Assignment"}
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Student:{" "}
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {student?.fullName ||
                    student?.name ||
                    "Unknown Student"}
                </span>
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {student?.email || ""}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                submission.status === "Graded"
                  ? "bg-green-100 text-green-700"
                  : submission.status ===
                    "Needs Resubmission"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {submission.status}
            </span>
          </div>
        </div>

        {/* =====================================================
            STUDENT SUBMISSION
        ====================================================== */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            Student Submission
          </h2>

          <div className="space-y-4">
            {Object.keys(submissionData).length ===
            0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No submission data available.
              </p>
            ) : (
              Object.entries(submissionData).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-4"
                  >
                    <p className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      {key}
                    </p>

                    <p className="break-words text-sm text-slate-800 dark:text-slate-100">
                      {String(value)}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* =====================================================
            GRADING
        ====================================================== */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6">

          <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
            Grade Submission
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* GRADE */}
            <div>
              <label
                htmlFor="grade"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Grade
              </label>

              <input
                id="grade"
                type="number"
                min="0"
                max={
                  assignment?.maxScore !== undefined
                    ? assignment.maxScore
                    : undefined
                }
                value={grade}
                onChange={(e) =>
                  setGrade(e.target.value)
                }
                placeholder={
                  assignment?.maxScore
                    ? `Maximum ${assignment.maxScore}`
                    : "Enter grade"
                }
                className="w-full rounded-lg border border-slate-300 dark:border-[#15253f] px-4 py-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            {/* MAX SCORE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Maximum Score
              </label>

              <div className="rounded-lg border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-4 py-3 text-slate-700 dark:text-slate-200">
                {assignment?.maxScore ??
                  "Not specified"}
              </div>
            </div>
          </div>

          {/* FEEDBACK */}
          <div className="mt-5">
            <label
              htmlFor="feedback"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Feedback
            </label>

            <textarea
              id="feedback"
              rows="5"
              value={feedback}
              onChange={(e) =>
                setFeedback(e.target.value)
              }
              placeholder="Write feedback for the student..."
              className="w-full resize-none rounded-lg border border-slate-300 dark:border-[#15253f] px-4 py-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex flex-wrap gap-3">

            {/* GRADE */}
            <button
              type="button"
              disabled={saving}
              onClick={handleGrade}
              className="flex items-center gap-2 rounded-lg bg-[#1f6f5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle size={18} />
              )}

              {saving
                ? "Saving..."
                : submission.status === "Graded"
                ? "Update Grade"
                : "Grade Submission"}
            </button>

            {/* REQUEST RESUBMISSION */}
            <button
              type="button"
              disabled={saving}
              onClick={handleResubmission}
              className="flex items-center gap-2 rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-5 py-3 text-sm font-semibold text-gray-800 dark:text-slate-100 transition hover:bg-gray-100 dark:bg-[#070e1b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <RotateCcw size={18} />
              )}

              Request Resubmission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorSubmissionReview;