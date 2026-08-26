import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  ClipboardList,
  Paperclip,
} from "lucide-react";
import apiClient from "../../services/apiClient";

function MentorTopicDetails() {
  const { assignmentId, topicId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [topic, setTopic] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTopic();
  }, [assignmentId, topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/assignments/${assignmentId}`
      );

      const assignmentData =
        response.data?.assignment ||
        response.data?.data;

      if (!assignmentData) {
        setError("Assignment not found.");
        return;
      }

      const selectedTopic = assignmentData.topics?.find(
        (item) => String(item._id) === String(topicId)
      );

      if (!selectedTopic) {
        setError("Topic not found.");
        return;
      }

      setAssignment(assignmentData);
      setTopic(selectedTopic);
    } catch (err) {
      console.error("Mentor topic error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load topic."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToTopic = (id) => {
    navigate(
      `/mentor/assignments/${assignmentId}/topics/${id}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading topic...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment || !topic) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-red-600">
              {error || "Topic not found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/mentor/assignments")
              }
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to Assignments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">

        {/* BACK */}
        <button
          type="button"
          onClick={() =>
            navigate(
              `/mentor/assignments/${assignmentId}`
            )
          }
          className="mb-6 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignment
        </button>

        {/* ASSIGNMENT HEADER */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {assignment.course || "Course"}
          </span>

          <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">
            {assignment.title}
          </h1>

          {assignment.description && (
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
              {assignment.description}
            </p>
          )}
        </section>

        {/* CONTENT */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex min-h-[650px]">

            {/* SIDEBAR */}
            <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-50 p-4 md:block">
              <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Assignment Topics
              </p>

              <div className="space-y-2">
                {assignment.topics?.map((item, index) => {
                  const active =
                    String(item._id) === String(topicId);

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() =>
                        goToTopic(item._id)
                      }
                      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span className="mr-2 opacity-60">
                        {index + 1}.
                      </span>

                      {item.title || `Topic ${index + 1}`}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* MAIN */}
            <div className="min-w-0 flex-1 p-6 md:p-8">

              {/* TOPIC */}
              <section className="border-b border-slate-200 pb-7">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Current Topic
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      {topic.title}
                    </h2>
                  </div>
                </div>

                {topic.description && (
                  <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {topic.description}
                  </p>
                )}
              </section>

              {/* QUESTIONS */}
              <section className="mt-8">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-blue-600" />

                  <h3 className="text-lg font-bold text-slate-900">
                    Questions
                  </h3>
                </div>

                {topic.questions?.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {topic.questions.map(
                      (question, index) => (
                        <div
                          key={question._id}
                          className="rounded-xl border border-slate-200 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase text-slate-400">
                                Question {index + 1}
                              </p>

                              <h4 className="mt-2 font-semibold text-slate-900">
                                {question.title}
                              </h4>
                            </div>

                            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {question.points ?? 0} pts
                            </span>
                          </div>

                          {question.description && (
                            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                              {question.description}
                            </p>
                          )}

                          {question.type && (
                            <p className="mt-4 text-xs text-slate-400">
                              Answer type: {question.type}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                    <p className="text-sm text-slate-400">
                      No questions have been added.
                    </p>
                  </div>
                )}
              </section>

              {/* ATTACHMENTS */}
              <section className="mt-10">
                <div className="flex items-center gap-3">
                  <Paperclip className="h-5 w-5 text-blue-600" />

                  <h3 className="text-lg font-bold text-slate-900">
                    Attachments
                  </h3>
                </div>

                {topic.attachments?.length > 0 ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {topic.attachments.map(
                      (attachment) => (
                        <div
                          key={attachment._id}
                          className="rounded-xl border border-slate-200 p-5"
                        >
                          <h4 className="font-semibold text-slate-900">
                            {attachment.title}
                          </h4>

                          {attachment.type && (
                            <p className="mt-1 text-xs text-slate-400">
                              {attachment.type}
                            </p>
                          )}

                          {attachment.description && (
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                              {attachment.description}
                            </p>
                          )}

                          {attachment.url && (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                            >
                              Open Attachment
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                    <p className="text-sm text-slate-400">
                      No attachments available.
                    </p>
                  </div>
                )}
              </section>

              {/* SUBMISSION REQUIREMENTS */}
              <section className="mt-10">
                <h3 className="text-lg font-bold text-slate-900">
                  Submission Requirements
                </h3>

                {topic.submissionFields?.length > 0 ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {topic.submissionFields.map(
                      (field) => (
                        <div
                          key={field._id}
                          className="rounded-xl border border-slate-200 p-5"
                        >
                          <p className="font-semibold text-slate-900">
                            {field.label}
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            Type: {field.type}
                          </p>

                          <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              field.required
                                ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {field.required
                              ? "Required"
                              : "Optional"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center">
                    <p className="text-sm text-slate-400">
                      No submission requirements.
                    </p>
                  </div>
                )}
              </section>

              {/* SUBMISSIONS */}
              <section className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Student Submissions
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Review and grade submissions for this assignment.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/mentor/assignments/${assignmentId}/submissions`
                      )
                    }
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Submissions
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MentorTopicDetails;