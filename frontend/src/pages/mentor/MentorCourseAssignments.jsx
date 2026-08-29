import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import apiClient from "../../services/apiClient";

function MentorCourseAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/assignments");

      setAssignments(response.data?.assignments || []);
    } catch (err) {
      console.error("Failed to load assignments:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#070e1b]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center justify-center rounded-2xl bg-white dark:bg-[#0b1528] py-20 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading assignments...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070e1b]">
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <BookOpen className="h-6 w-6 text-[#1f6f5b]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                Course Assignments
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review assignments, topics, questions, and student
                submissions.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error && assignments.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#0b1528] px-6 py-16 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

            <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
              No assignments available
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              There are currently no assignments available for review.
            </p>
          </div>
        )}

        {/* ASSIGNMENTS */}
        {assignments.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <article
                key={assignment._id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* CARD HEADER */}
                <div className="border-b border-slate-100 dark:border-[#15253f] p-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-[#e5f1ed] px-3 py-1 text-xs font-semibold text-[#1f6f5b]">
                      {assignment.course || "Course"}
                    </span>

                    {assignment.deadline && (
                      <span className="text-xs text-slate-400">
                        {formatDate(assignment.deadline)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {assignment.title}
                  </h2>

                  {assignment.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {assignment.description}
                    </p>
                  )}
                </div>

                {/* TOPICS */}
                <div className="flex-1 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Topics
                    </h3>

                    <span className="text-xs text-slate-400">
                      {assignment.topics?.length || 0}
                    </span>
                  </div>

                  {assignment.topics?.length > 0 ? (
                    <div className="space-y-2">
                      {assignment.topics.map((topic) => (
                        <button
                          key={topic._id}
                          type="button"
                          onClick={() =>
                            navigate(
                              `/mentor/assignments/${assignment._id}/topics/${topic._id}`
                            )
                          }
                          className="group flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-[#15253f] p-4 text-left transition hover:border-blue-200 hover:bg-[#e5f1ed]"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#185848]">
                              {topic.title}
                            </p>

                            {topic.description && (
                              <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                                {topic.description}
                              </p>
                            )}

                            <p className="mt-2 text-xs text-slate-400">
                              {topic.questions?.length || 0} questions
                            </p>
                          </div>

                          <ChevronRight className="ml-3 h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#15253f] p-5 text-center">
                      <p className="text-sm text-slate-400">
                        No topics added yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="border-t border-slate-100 dark:border-[#15253f] p-6">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/mentor/assignments/${assignment._id}`
                      )
                    }
                    className="w-full rounded-xl bg-[#1f6f5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#185848]"
                  >
                    View Assignment
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MentorCourseAssignments;