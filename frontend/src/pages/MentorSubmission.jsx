import { useState } from "react";
import {
  Calendar,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Save,
  RotateCcw,
  ExternalLink,
  History,
  Plus,
} from "lucide-react";

function MentorSubmission() {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [openHistory, setOpenHistory] = useState(null);

  // Temporary data for UI testing
  const submission = {
    studentName: "Amina Mohammed",
    githubLink: "https://github.com/amina/react-task-manager",
    submittedAt: "2026-08-20",
  };

  const history = [
    {
      id: 1,
      studentName: "Amina Mohammed",
      date: "2026-08-18",
      score: 82,
      feedback: "Good work. Improve the responsive design.",
    },
    {
      id: 2,
      studentName: "Amina Mohammed",
      date: "2026-08-12",
      score: 76,
      feedback:
        "Good progress. Keep improving your React structure.",
    },
  ];

  // Increase score
  const increaseScore = () => {
    setScore((prev) => {
      const current = Number(prev) || 0;
      return Math.min(current + 1, 100);
    });
  };

  // Decrease score
  const decreaseScore = () => {
    setScore((prev) => {
      const current = Number(prev) || 0;
      return Math.max(current - 1, 0);
    });
  };

  // Manually type score
  const handleScoreChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setScore("");
      return;
    }

    let number = Number(value);

    if (Number.isNaN(number)) return;

    if (number > 100) number = 100;
    if (number < 0) number = 0;

    setScore(number);
  };

  // Save grade
  const handleSaveGrade = () => {
    if (score === "" || score === null) {
      alert("Please enter a score.");
      return;
    }

    console.log("Grade:", {
      student: submission.studentName,
      score: Number(score),
      feedback,
    });

    alert("Grade saved successfully!");
  };

  // Request resubmission
  const handleRequestResubmission = () => {
    console.log("Resubmission requested:", {
      student: submission.studentName,
      feedback,
    });

    alert("Resubmission requested!");
  };

  // New form
  const handleNewForm = () => {
    setScore(0);
    setFeedback("");
    setOpenHistory(null);
  };

  // Open / close history
  const toggleHistory = (id) => {
    setOpenHistory((current) =>
      current === id ? null : id
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-6">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Submissions
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review and grade your students' submissions.
        </p>
      </div>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <div className="grid max-w-6xl grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">

        {/* =================================
            LEFT CARD - GRADE SUBMISSION
        ================================== */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md">

          {/* HEADER */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">

              {/* Dark Blue Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 shadow-sm">
                <Save size={19} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Grade Submission
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  Review the student's work and provide feedback.
                </p>
              </div>

            </div>
          </div>

          {/* BODY */}
          <div className="p-6">

            {/* =========================
                STUDENT INFORMATION
            ========================== */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* Student */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Student
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {submission.studentName}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Submitted
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-800">

                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-600 shadow-sm">
                    <Calendar size={14} />
                  </span>

                  {new Date(
                    submission.submittedAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}

                </div>
              </div>

            </div>

            {/* =========================
                GITHUB
            ========================== */}
            <div className="mt-5">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Repository
              </p>

              <a
                href={submission.githubLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ExternalLink size={15} />
                View GitHub Repository
              </a>

            </div>

            {/* DIVIDER */}
            <div className="my-6 border-t border-gray-100" />

            {/* =========================
                SCORE + FEEDBACK
            ========================== */}
            <div className="grid gap-6 md:grid-cols-[150px_minmax(0,1fr)]">

              {/* SCORE */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Score
                </label>

                <div className="flex items-center gap-2">

                  {/* SCORE BOX */}
                  <div className="flex h-11 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">

                    {/* NUMBER */}
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={handleScoreChange}
                      className="w-20 text-center text-base font-semibold text-gray-900 outline-none"
                    />

                    {/* ARROWS */}
                    <div className="flex w-8 flex-col border-l border-gray-300">

                      {/* UP */}
                      <button
                        type="button"
                        onClick={increaseScore}
                        aria-label="Increase score"
                        className="flex flex-1 items-center justify-center border-b border-gray-300 text-gray-500 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <ChevronUp size={14} />
                      </button>

                      {/* DOWN */}
                      <button
                        type="button"
                        onClick={decreaseScore}
                        aria-label="Decrease score"
                        className="flex flex-1 items-center justify-center text-gray-500 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <ChevronDown size={14} />
                      </button>

                    </div>
                  </div>

                  <span className="text-xs font-medium text-gray-400">
                    / 100
                  </span>

                </div>
              </div>

              {/* FEEDBACK */}
              <div>

                <label
                  htmlFor="feedback"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
                >

                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700 shadow-sm">
                    <MessageSquare size={14} />
                  </span>

                  Feedback

                </label>

                <textarea
                  id="feedback"
                  rows={3}
                  value={feedback}
                  onChange={(event) =>
                    setFeedback(event.target.value)
                  }
                  placeholder="Write feedback for the student..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none shadow-sm transition placeholder:text-gray-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-100"
                />

              </div>

            </div>

            {/* =========================
                ACTION BUTTONS
            ========================== */}
            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

              {/* REQUEST RESUBMISSION */}
              <button
                type="button"
                onClick={handleRequestResubmission}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 shadow-sm transition hover:bg-orange-100"
              >
                <RotateCcw size={15} />
                Request Resubmission
              </button>

              {/* SAVE GRADE */}
              <button
                type="button"
                onClick={handleSaveGrade}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800"
              >
                <Save size={15} />
                Save Grade
              </button>

            </div>

          </div>
        </div>

        {/* =================================
            RIGHT SIDE
        ================================== */}
        <div className="space-y-4">

          {/* =========================
              NEW FORM
          ========================== */}
          <button
            type="button"
            onClick={handleNewForm}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
          >
            <Plus size={17} />
            New Form
          </button>

          {/* =========================
              HISTORY CARD
          ========================== */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-md">

            {/* HISTORY HEADER */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">

              {/* History Icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 shadow-sm">
                <History size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Grade History
                </h2>

                <p className="text-xs text-gray-500">
                  Previous submissions
                </p>
              </div>

            </div>

            {/* HISTORY LIST */}
            <div className="divide-y divide-gray-100">

              {history.length > 0 ? (
                history.map((item) => (

                  <div key={item.id}>

                    {/* HISTORY ITEM */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleHistory(item.id)
                      }
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
                    >

                      <div>

                        <p className="text-sm font-semibold text-gray-800">
                          {item.studentName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {new Date(
                            item.date
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>

                      </div>

                      <ChevronRight
                        size={17}
                        className={`text-gray-400 transition-transform ${
                          openHistory === item.id
                            ? "rotate-90"
                            : ""
                        }`}
                      />

                    </button>

                    {/* HISTORY DETAILS */}
                    {openHistory === item.id && (

                      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">

                        <div className="flex items-center justify-between">

                          <span className="text-xs font-medium text-gray-500">
                            Score
                          </span>

                          <span className="text-sm font-bold text-gray-900">
                            {item.score}/100
                          </span>

                        </div>

                        <p className="mt-2 text-xs leading-5 text-gray-600">
                          {item.feedback}
                        </p>

                      </div>

                    )}

                  </div>

                ))
              ) : (

                <div className="px-5 py-8 text-center">

                  <History
                    size={28}
                    className="mx-auto mb-2 text-gray-300"
                  />

                  <p className="text-sm text-gray-500">
                    No grading history yet.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default MentorSubmission;