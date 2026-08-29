import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Paperclip,
  Users,
} from "lucide-react";
import apiClient from "../../services/apiClient";

function MentorAssignmentDetails() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH ASSIGNMENT
  // =========================================================

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "GET:",
          `/assignments/${assignmentId}`
        );

        const response = await apiClient.get(
          `/assignments/${assignmentId}`
        );

        console.log(
          "ASSIGNMENT RESPONSE:",
          response.data
        );

        const data =
          response.data?.assignment ||
          response.data?.data ||
          response.data;

        setAssignment(data);
      } catch (err) {
        console.error(
          "ASSIGNMENT DETAILS ERROR:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load assignment."
        );
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignment();
    } else {
      setError("Assignment ID is missing.");
      setLoading(false);
    }
  }, [assignmentId]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getCourseName = () => {
    if (!assignment?.course) {
      return "General";
    }

    if (typeof assignment.course === "string") {
      return assignment.course;
    }

    return (
      assignment.course.name ||
      assignment.course.title ||
      "General"
    );
  };

  const getBatchName = () => {
    if (!assignment?.batchId) {
      return "All Batches";
    }

    if (typeof assignment.batchId === "string") {
      return "Assigned Batch";
    }

    return (
      assignment.batchId.name ||
      assignment.batchId.batchName ||
      assignment.batchId.title ||
      "Assigned Batch"
    );
  };

  const getStatus = () => {
    if (assignment?.published === false) {
      return {
        label: "Draft",
        className:
          "bg-slate-100 text-slate-700",
      };
    }

    if (!assignment?.deadline) {
      return {
        label: "Active",
        className:
          "bg-emerald-50 text-emerald-700",
      };
    }

    const deadline = new Date(
      assignment.deadline
    );

    if (deadline < new Date()) {
      return {
        label: "Expired",
        className:
          "bg-red-50 text-red-700",
      };
    }

    return {
      label: "Active",
      className:
        "bg-emerald-50 text-emerald-700",
    };
  };

  const formatDeadline = () => {
    if (!assignment?.deadline) {
      return "No deadline";
    }

    const date = new Date(
      assignment.deadline
    );

    if (Number.isNaN(date.getTime())) {
      return "Invalid deadline";
    }

    return date.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString([], {
      dateStyle: "medium",
    });
  };

  const status = getStatus();

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">

            <div className="h-5 w-24 rounded bg-slate-200" />

            <div className="rounded-2xl bg-slate-200 p-8">
              <div className="h-8 w-2/3 rounded bg-slate-300" />
              <div className="mt-4 h-4 w-full max-w-2xl rounded bg-slate-300" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-300" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-xl bg-slate-200"
                />
              ))}
            </div>

            <div className="h-64 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-white"
          >
            <ArrowLeft size={17} />
            Back to Assignments
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load assignment
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!assignment) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-6">
        <div className="mx-auto max-w-7xl">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-10 text-center">
            <ClipboardList
              size={40}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Assignment not found
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This assignment may have been removed or
              you may not have permission to view it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            BACK
        ================================================== */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-white"
        >
          <ArrowLeft size={17} />
          Back to Assignments
        </button>

        {/* =================================================
            HERO
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

          <div className="border-b border-slate-200 dark:border-[#15253f] p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>

                  <span className="rounded-full bg-slate-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Mentor View
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {assignment.title ||
                    "Untitled Assignment"}
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                  {assignment.description ||
                    "No description provided."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/mentor/assignments/${assignment._id}/submissions`
                  )
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1f6f5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#185848]"
              >
                <Users size={17} />
                View Submissions
              </button>
            </div>
          </div>

          {/* =================================================
              ASSIGNMENT META
          ================================================== */}

          <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">

            <div className="bg-white dark:bg-[#0b1528] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 dark:bg-[#070e1b] p-2.5">
                  <BookOpen
                    size={18}
                    className="text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Course
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {getCourseName()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0b1528] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 dark:bg-[#070e1b] p-2.5">
                  <Users
                    size={18}
                    className="text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Batch
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {getBatchName()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0b1528] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 dark:bg-[#070e1b] p-2.5">
                  <CalendarDays
                    size={18}
                    className="text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Deadline
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDeadline()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0b1528] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 dark:bg-[#070e1b] p-2.5">
                  <ClipboardList
                    size={18}
                    className="text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Maximum Score
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {assignment.maxScore ?? 0}{" "}
                    points
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            INSTRUCTIONS
        ================================================== */}

        {assignment.instructions && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">
            <div className="border-b border-slate-200 dark:border-[#15253f] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 dark:bg-[#070e1b] p-2.5">
                  <FileText
                    size={19}
                    className="text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Instructions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Instructions provided to students
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                {assignment.instructions}
              </p>
            </div>
          </section>
        )}

        {/* =================================================
            ASSIGNMENT OVERVIEW
        ================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Topics
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {assignment.topics?.length || 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Questions
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {(assignment.topics || []).reduce(
                (total, topic) =>
                  total +
                  (topic.questions?.length || 0),
                0
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Submission Fields
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {(assignment.topics || []).reduce(
                (total, topic) =>
                  total +
                  (topic.submissionFields
                    ?.length || 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* =================================================
            TOPICS / CONTAINERS
        ================================================== */}

        <section className="mt-8">

          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Topics / Containers
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select a topic to view its questions,
                resources, and submission requirements.
              </p>
            </div>

            <span className="text-sm text-slate-500 dark:text-slate-400">
              {assignment.topics?.length || 0}{" "}
              containers
            </span>
          </div>

          {!assignment.topics ||
          assignment.topics.length === 0 ? (
            <div className="rounded-xl border dark:border-[#15253f] border-dashed border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-10 text-center">
              <BookOpen
                size={36}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                No topics added
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                This assignment does not contain any
                topic containers.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {assignment.topics.map(
                (topic, index) => (
                  <button
                    key={
                      topic._id || `topic-${index}`
                    }
                    type="button"
                    onClick={() =>
                      navigate(
                        `/mentor/assignments/${assignment._id}/topics/${topic._id}`
                      )
                    }
                    className="group rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 text-left shadow-sm transition duration-200 hover:border-slate-300 dark:border-[#15253f] hover:shadow-md"
                  >

                    {/* TOPIC HEADER */}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="rounded-lg bg-slate-100 dark:bg-[#070e1b] p-3">
                          <BookOpen
                            size={19}
                            className="text-slate-700 dark:text-slate-200"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Topic {index + 1}
                          </p>

                          <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                            {topic.title ||
                              `Topic ${
                                index + 1
                              }`}
                          </h3>
                        </div>
                      </div>

                      <ChevronRight
                        size={19}
                        className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700 dark:text-slate-200"
                      />
                    </div>

                    {/* DESCRIPTION */}

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {topic.description ||
                        "No topic description provided."}
                    </p>

                    {/* COUNTS */}

                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-[#15253f] pt-4">

                      <div>
                        <p className="text-xs text-slate-400">
                          Questions
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {topic.questions
                            ?.length || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Resources
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {topic.attachments
                            ?.length || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Submissions
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {topic
                            .submissionFields
                            ?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* VIEW */}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-[#15253f] pt-4">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        View Topic
                      </span>

                      <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition group-hover:text-slate-900 dark:text-white">
                        Open
                        <ChevronRight
                          size={15}
                        />
                      </span>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        {/* =================================================
            QUICK ACTION
        ================================================== */}

        <div className="mt-8 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Student Submissions
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review student work, grade submissions,
                and provide feedback.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/mentor/assignments/${assignment._id}/submissions`
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185848]"
            >
              <Users size={17} />
              Open Submissions
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorAssignmentDetails;