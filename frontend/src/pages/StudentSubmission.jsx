import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  StickyNote,
  Send,
} from "lucide-react";
import apiClient from "../services/apiClient";

function StudentSubmission() {
  const navigate = useNavigate();
  const params = useParams();

  const assignmentId = params.assignmentId || params.id;

  const [github, setGithub] = useState("");
  const [liveDemo, setLiveDemo] = useState("");
  const [document, setDocument] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (assignmentId) {
      navigate(`/student/assignments/${assignmentId}`);
    } else {
      navigate("/student/assignments");
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assignmentId) {
      setError("Assignment ID is missing.");
      return;
    }

    if (
      !github.trim() &&
      !liveDemo.trim() &&
      !document.trim() &&
      !notes.trim()
    ) {
      setError("Please provide at least one submission.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const submissionData = {};

      if (github.trim()) {
        submissionData.github = github.trim();
      }

      if (liveDemo.trim()) {
        submissionData.liveDemo = liveDemo.trim();
      }

      if (document.trim()) {
        submissionData.document = document.trim();
      }

      if (notes.trim()) {
        submissionData.notes = notes.trim();
      }

      await apiClient.post(`/submissions/${assignmentId}`, {
        submissionData,
      });

      setSuccess("Assignment submitted successfully.");

      setTimeout(() => {
        navigate("/student/submissions");
      }, 1200);
    } catch (err) {
      console.error("Submission error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-slate-50 p-5 sm:p-6 md:p-8">
      <main className="mx-auto w-full max-w-4xl">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-[#111827] transition hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={17} />
          Back to Assignment
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7">
          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827] text-white shadow-sm">
              <Send size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assignment
              </p>

              <p className="text-sm font-semibold text-[#111827]">
                Submission
              </p>
            </div>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Submit Assignment
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Submit your assignment by providing your project
            links, documentation, and any additional notes for
            your mentor.
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
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-700">
              {success}
            </p>
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >

          {/* FORM HEADER */}

          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-slate-900">
              Your Submission
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the resources related to your assignment.
            </p>
          </div>

          {/* FORM CONTENT */}

          <div className="space-y-6 p-5 sm:p-6">

            {/* =================================================
                GITHUB
            ================================================= */}

            <div>
              <label
                htmlFor="github"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <ExternalLink
                  size={17}
                  className="text-[#111827]"
                />

                GitHub Repository
              </label>

              <input
                id="github"
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-slate-200"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Add the GitHub repository containing your assignment.
              </p>
            </div>

            {/* =================================================
                LIVE DEMO
            ================================================= */}

            <div>
              <label
                htmlFor="liveDemo"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <ExternalLink
                  size={17}
                  className="text-[#111827]"
                />

                Live Demo
              </label>

              <input
                id="liveDemo"
                type="url"
                value={liveDemo}
                onChange={(e) => setLiveDemo(e.target.value)}
                placeholder="https://your-project.vercel.app"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-slate-200"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Add your deployed project link if available.
              </p>
            </div>

            {/* =================================================
                DOCUMENT
            ================================================= */}

            <div>
              <label
                htmlFor="document"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <FileText
                  size={17}
                  className="text-[#111827]"
                />

                Document / Drive Link
              </label>

              <input
                id="document"
                type="url"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="https://docs.google.com/..."
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-slate-200"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Add documentation, reports, or other required files.
              </p>
            </div>

            {/* =================================================
                NOTES
            ================================================= */}

            <div>
              <label
                htmlFor="notes"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <StickyNote
                  size={17}
                  className="text-[#111827]"
                />

                Notes
              </label>

              <textarea
                id="notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your submission..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-slate-200"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Tell your mentor anything important about your submission.
              </p>
            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:justify-end sm:px-6">

            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#111827] hover:bg-slate-100 hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} />

              {loading
                ? "Submitting..."
                : "Submit Assignment"}
            </button>

          </div>
        </form>
      </main>
    </div>
  );
}

export default StudentSubmission;