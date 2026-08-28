import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

function StudentAssignmentDetails() {
  const params = useParams();
  const navigate = useNavigate();

  // Supports both :id and :assignmentId
  const id = params.id || params.assignmentId;

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD ASSIGNMENT
  // =========================================================
  useEffect(() => {
    if (!id) {
      console.error("Assignment ID is missing:", params);
      setError("Assignment ID is missing.");
      setLoading(false);
      return;
    }

    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading assignment:", id);

      const response = await apiClient.get(`/assignments/${id}`);

      console.log(
        "Student assignment response:",
        response.data
      );

      const data =
        response.data?.assignment ||
        response.data?.data ||
        response.data;

      if (!data || !data._id) {
        setAssignment(null);
        setError("Assignment not found.");
        return;
      }

      setAssignment(data);
    } catch (err) {
      console.error(
        "Failed to load assignment:",
        err
      );

      setAssignment(null);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load assignment."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmitAssignment = () => {
    if (!id) return;

    navigate(
      `/student/assignments/${id}/submit`
    );
  };

  // =========================================================
  // BACK
  // =========================================================
  const handleBack = () => {
    navigate("/student/assignments");
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-5 sm:p-6 md:p-8">
        <main className="mx-auto max-w-6xl">
          <div className="mb-6 h-5 w-40 animate-pulse rounded bg-slate-200" />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-8 w-72 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================
  if (!assignment) {
    return (
      <div className="min-h-full bg-slate-50 p-5 sm:p-6 md:p-8">
        <main className="mx-auto flex max-w-6xl justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-[#111827]">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Assignment Not Found
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error ||
                "We could not find this assignment."}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="mt-6 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2937]"
            >
              Back to Assignments
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // COURSE NAME
  // =========================================================
  const courseName =
    typeof assignment.course === "object"
      ? assignment.course?.name ||
        assignment.course?.title ||
        "Course"
      : assignment.course || "Course";

  // =========================================================
  // TOPICS
  // =========================================================
  const topics = Array.isArray(
    assignment.topics
  )
    ? assignment.topics
    : [];

  // =========================================================
  // PAGE
  // =========================================================
  return (
    <div className="min-h-full bg-slate-50 p-5 text-slate-800 sm:p-6 md:p-8">
      <main className="mx-auto max-w-6xl">

        {/* =================================================
            BACK
        ================================================= */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 text-sm font-semibold text-[#111827] transition hover:text-[#374151]"
        >
          ← Back to Assignments
        </button>

        {/* =================================================
            ERROR
        ================================================= */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* =================================================
            ASSIGNMENT HEADER
        ================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            {/* TITLE */}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#111827]">
                {courseName}
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {assignment.title ||
                  "Untitled Assignment"}
              </h1>

              {assignment.description && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  {assignment.description}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="button"
              onClick={handleSubmitAssignment}
              className="shrink-0 rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f2937]"
            >
              Submit Assignment
            </button>
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">

            {/* DEADLINE */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Deadline
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {assignment.deadline
                  ? new Date(
                      assignment.deadline
                    ).toLocaleString()
                  : "No deadline"}
              </p>
            </div>

            {/* MAX SCORE */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Maximum Score
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {assignment.maxScore ??
                  assignment.totalPoints ??
                  "Not specified"}
              </p>
            </div>

            {/* TOPICS */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Topics
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                {topics.length}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            QUESTIONS
        ================================================= */}
        <section className="mt-7">

          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Assignment Questions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review the questions before submitting your work.
            </p>
          </div>

          {/* =================================================
              NO TOPICS
          ================================================= */}
          {topics.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                No topics or questions have been added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {topics.map(
                (topic, topicIndex) => {
                  const questions =
                    Array.isArray(
                      topic.questions
                    )
                      ? topic.questions
                      : [];

                  return (
                    <div
                      key={
                        topic._id ||
                        `${topic.title}-${topicIndex}`
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >

                      {/* TOPIC HEADER */}
                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-[#111827]">
                          {topicIndex + 1}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-slate-900">
                            {topic.title ||
                              "Topic"}
                          </h3>

                          {topic.description && (
                            <p className="mt-1 text-sm text-slate-500">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* =================================================
                          NO QUESTIONS
                      ================================================= */}
                      {questions.length === 0 ? (
                        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                          No questions in this topic.
                        </div>
                      ) : (
                        <div className="mt-5 space-y-3">

                          {questions.map(
                            (
                              question,
                              questionIndex
                            ) => (
                              <div
                                key={
                                  question._id ||
                                  `${topicIndex}-${questionIndex}`
                                }
                                className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"
                              >

                                <div className="flex gap-3">

                                  {/* QUESTION NUMBER */}
                                  <span className="shrink-0 text-sm font-bold text-[#111827]">
                                    Q
                                    {questionIndex +
                                      1}
                                    .
                                  </span>

                                  <div className="min-w-0">

                                    {/* QUESTION */}
                                    <p className="text-sm font-semibold leading-6 text-slate-800">
                                      {question.question ||
                                        question.text ||
                                        "Question"}
                                    </p>

                                    {/* META */}
                                    <div className="mt-2 flex flex-wrap gap-3">

                                      {question.type && (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-500">
                                          Type:{" "}
                                          {
                                            question.type
                                          }
                                        </span>
                                      )}

                                      {question.points !==
                                        undefined && (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-[#111827]">
                                          {
                                            question.points
                                          }{" "}
                                          points
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* =================================================
            BOTTOM SUBMIT
        ================================================= */}
        {topics.length > 0 && (
          <div className="mt-7 flex justify-end">

            <button
              type="button"
              onClick={handleSubmitAssignment}
              className="rounded-xl bg-[#111827] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f2937]"
            >
              Submit Assignment
            </button>

          </div>
        )}
      </main>
    </div>
  );
}

export default StudentAssignmentDetails;