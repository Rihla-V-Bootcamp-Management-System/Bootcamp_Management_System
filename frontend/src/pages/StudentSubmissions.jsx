import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

function StudentSubmission() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    githubUrl: "",
    liveDemoUrl: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      await apiClient.post(
        `/submissions/${assignmentId}`,
        {
          githubUrl: form.githubUrl,
          liveDemoUrl: form.liveDemoUrl,
          notes: form.notes,
        }
      );

      setSuccess("Assignment submitted successfully.");

      setForm({
        githubUrl: "",
        liveDemoUrl: "",
        notes: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to submit assignment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center px-8">
        <h1 className="text-[22px] font-bold text-[#0f1b3d]">
          ASTU MSJ
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>

        <div className="bg-white rounded-xl p-6 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-bold text-[#0f1b3d]">
            Submit Assignment
          </h2>

          <p className="mt-2 mb-7 text-sm text-slate-500">
            Submit your completed project for mentor review.
          </p>

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                GitHub Repository URL
              </label>

              <input
                type="url"
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                required
                placeholder="https://github.com/username/project"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Live Demo URL
                <span className="ml-1 text-slate-400">
                  (optional)
                </span>
              </label>

              <input
                type="url"
                name="liveDemoUrl"
                value={form.liveDemoUrl}
                onChange={handleChange}
                placeholder="https://your-project.vercel.app"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes
                <span className="ml-1 text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={5}
                placeholder="Add notes about your submission..."
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-blue-600 px-6 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Assignment"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default StudentSubmission;