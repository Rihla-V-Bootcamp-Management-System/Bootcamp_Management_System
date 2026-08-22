import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

function StudentAssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    githubUrl: "",
    liveDemoUrl: "",
    notes: "",
  });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/assignments/${id}`
      );

      setAssignment(response.data.assignment);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load assignment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await apiClient.post(
        `/submissions/${id}`,
        {
          githubUrl: form.githubUrl,
          liveDemoUrl: form.liveDemoUrl,
          notes: form.notes,
        }
      );

      setSuccess(
        "Assignment submitted successfully."
      );

      setForm({
        githubUrl: "",
        liveDemoUrl: "",
        notes: "",
      });
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to submit assignment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">
          Loading assignment...
        </p>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-5">
        <div className="bg-white rounded-xl p-8 text-center shadow-sm max-w-md w-full">
          <p className="text-red-600 mb-5">
            {error}
          </p>

          <button
            onClick={() => navigate("/assignments")}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center px-8">
        <h1 className="text-[22px] font-bold text-[#0f1b3d]">
          ASTU MSJ
        </h1>
      </header>

      <main className="max-w-[1000px] mx-auto px-5 md:px-8 py-10 pb-16">
        <button
          onClick={() => navigate("/assignments")}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to Assignments
        </button>

        <section className="bg-white rounded-xl p-6 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.08)] mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">
                Assignment
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-[#0f1b3d] mb-3">
                {assignment.title}
              </h2>

              <p className="text-slate-500 text-sm">
                {assignment.description}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg px-5 py-4 shrink-0">
              <p className="text-xs text-slate-500">
                Maximum Score
              </p>

              <p className="text-2xl font-bold text-[#1e3a5f]">
                {assignment.maxScore}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7 pt-6 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-400 mb-1">
                Course
              </p>

              <p className="text-sm font-medium text-slate-800">
                {assignment.course}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">
                Deadline
              </p>

              <p className="text-sm font-medium text-slate-800">
                {formatDate(assignment.deadline)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">
                Batch
              </p>

              <p className="text-sm font-medium text-slate-800">
                {assignment.batchId?.name || "Assigned Batch"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.08)] mb-6">
          <h3 className="text-xl font-bold text-[#0f1b3d] mb-4">
            Instructions
          </h3>

          <div className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">
            {assignment.instructions}
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#0f1b3d]">
              Submit Assignment
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Submit your project links and notes for review.
            </p>
          </div>

          {success && (
            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                GitHub Repository URL
              </label>

              <input
                type="url"
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                required
                placeholder="https://github.com/username/project"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Live Demo URL
                <span className="text-slate-400 font-normal">
                  {" "}
                  (optional)
                </span>
              </label>

              <input
                type="url"
                name="liveDemoUrl"
                value={form.liveDemoUrl}
                onChange={handleChange}
                placeholder="https://your-project.vercel.app"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes
                <span className="text-slate-400 font-normal">
                  {" "}
                  (optional)
                </span>
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="5"
                placeholder="Add any notes for your mentor..."
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  navigate("/assignments")
                }
                className="sm:w-auto rounded-lg border border-blue-600 px-6 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="sm:w-auto rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Assignment"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default StudentAssignmentDetails;