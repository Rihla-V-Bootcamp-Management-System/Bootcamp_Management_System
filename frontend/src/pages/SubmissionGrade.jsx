import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

function SubmissionGrade() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  /*
   * Your backend currently does not have
   * GET /submissions/:id.
   *
   * So we get mentor submissions and find
   * the requested submission.
   */
  const fetchSubmission = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/submissions/mentor"
      );

      const allSubmissions =
        response.data.submissions || [];

      const found = allSubmissions.find(
        (item) => item._id === submissionId
      );

      if (!found) {
        setError("Submission not found");
        return;
      }

      setSubmission(found);

      if (
        found.grade !== null &&
        found.grade !== undefined
      ) {
        setGrade(String(found.grade));
      }

      setFeedback(found.feedback || "");
    } catch (err) {
      console.error(
        "Failed to load submission:",
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
    fetchSubmission();
  }, [submissionId]);

  const handleGrade = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (grade === "") {
      setError("Please enter a grade.");
      return;
    }

    const numericGrade = Number(grade);

    if (Number.isNaN(numericGrade)) {
      setError("Grade must be a number.");
      return;
    }

    if (numericGrade < 0) {
      setError(
        "Grade cannot be less than 0."
      );
      return;
    }

    const maxScore =
      submission?.assignmentId?.maxScore;

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

      const response = await apiClient.patch(
        `/submissions/${submissionId}/grade`,
        {
          grade: numericGrade,
          feedback,
        }
      );

      setSubmission(
        response.data.submission
      );

      setSuccess(
        "Submission graded successfully."
      );
    } catch (err) {
      console.error(
        "Grade submission error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to grade submission"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResubmission = async () => {
    setError("");
    setSuccess("");

    if (
      !window.confirm(
        "Request a resubmission from this student?"
      )
    ) {
      return;
    }

    try {
      setSaving(true);

      const response = await apiClient.patch(
        `/submissions/${submissionId}/resubmit`,
        {
          feedback,
        }
      );

      setSubmission(
        response.data.submission
      );

      setGrade("");

      setSuccess(
        "Resubmission requested successfully."
      );
    } catch (err) {
      console.error(
        "Resubmission error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to request resubmission"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-gray-600">
          Loading submission...
        </p>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-full bg-gray-50 p-8">
        <button
          onClick={() =>
            navigate("/mentor/submissions")
          }
          className="mb-6 flex items-center gap-2 rounded-lg border border-transparent px-4 py-2 hover:border-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back to Submissions
        </button>

        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const student =
    submission?.studentId;

  const assignment =
    submission?.assignmentId;

  const submissionData =
    submission?.submissionData || {};

  return (
    <div className="min-h-full bg-gray-50 p-8">
      {/* BACK */}
      <button
        onClick={() =>
          navigate("/mentor/submissions")
        }
        className="mb-6 flex items-center gap-2 rounded-lg border border-transparent px-4 py-2 text-gray-700 hover:border-gray-900 hover:bg-gray-100"
      >
        <ArrowLeft size={18} />
        Back to Submissions
      </button>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Submission Review
        </h1>

        <p className="mt-2 text-gray-600">
          Review the student's work and provide a
          grade.
        </p>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-4 text-green-700">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-2">
          {/* STUDENT + ASSIGNMENT */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Submission Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Student
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {student?.fullName ||
                    student?.name ||
                    "Unknown Student"}
                </p>

                {student?.email && (
                  <p className="text-sm text-gray-500">
                    {student.email}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Assignment
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {assignment?.title ||
                    "Unknown Assignment"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Submitted
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {submission?.submittedAt
                    ? new Date(
                        submission.submittedAt
                      ).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {submission?.status}
                </p>
              </div>
            </div>
          </div>

          {/* SUBMISSION DATA */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Student Submission
            </h2>

            {Object.keys(
              submissionData
            ).length === 0 ? (
              <p className="text-gray-500">
                No submission data available.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  submissionData
                ).map(([key, value]) => {
                  const isUrl =
                    typeof value === "string" &&
                    /^https?:\/\//i.test(value);

                  return (
                    <div
                      key={key}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="mb-2 text-sm font-semibold capitalize text-gray-600">
                        {key.replace(
                          /([A-Z])/g,
                          " $1"
                        )}
                      </p>

                      {isUrl ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 break-all text-gray-900 underline hover:text-gray-600"
                        >
                          {value}
                          <ExternalLink
                            size={16}
                          />
                        </a>
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-gray-800">
                          {String(value)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: GRADING */}
        <div>
          <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Grade Submission
            </h2>

            <form
              onSubmit={handleGrade}
              className="space-y-5"
            >
              {/* GRADE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Grade
                  {assignment?.maxScore !==
                    undefined &&
                    assignment?.maxScore !==
                      null && (
                      <span className="ml-2 font-normal text-gray-500">
                        / {assignment.maxScore}
                      </span>
                    )}
                </label>

                <input
                  type="number"
                  min="0"
                  max={
                    assignment?.maxScore ??
                    undefined
                  }
                  step="0.01"
                  value={grade}
                  onChange={(e) =>
                    setGrade(e.target.value)
                  }
                  placeholder="Enter grade"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* FEEDBACK */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Feedback
                </label>

                <textarea
                  rows={6}
                  value={feedback}
                  onChange={(e) =>
                    setFeedback(e.target.value)
                  }
                  placeholder="Write feedback for the student..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* GRADE BUTTON */}
              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-900 bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle size={19} />

                {saving
                  ? "Saving..."
                  : "Grade Submission"}
              </button>

              {/* RESUBMISSION */}
              <button
                type="button"
                onClick={handleResubmission}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-900 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={19} />
                Request Resubmission
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmissionGrade;