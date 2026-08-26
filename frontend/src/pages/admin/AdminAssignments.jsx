import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Eye,
  Pencil,
  Search,
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const emptyQuestion = () => ({
  title: "",
  description: "",
  type: "text",
  points: 0,
});

const emptyAttachment = () => ({
  title: "",
  type: "link",
  url: "",
  description: "",
});

const emptySubmissionField = () => ({
  label: "",
  type: "url",
  required: false,
});

const emptyTopic = () => ({
  title: "",
  description: "",
  questions: [],
  attachments: [],
  submissionFields: [],
});

const emptyForm = () => ({
  title: "",
  description: "",
  instructions: "",
  course: "",
  batchId: "",
  deadline: "",
  maxScore: "",
  topics: [],
});

function AdminAssignments() {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [assignments, setAssignments] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  const [showCourseCreator, setShowCourseCreator] =
    useState(false);

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] =
    useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  const [form, setForm] = useState(emptyForm());

  const [expandedTopics, setExpandedTopics] = useState({});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeView, setActiveView] = useState("list");

  const [editingId, setEditingId] = useState(null);

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchCourses();
    fetchBatches();
    fetchAssignments();
  }, []);

  // =========================================================
  // COURSES
  // =========================================================

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);

      const response = await axios.get(
        `${API_URL}/courses`,
        authConfig
      );

      setCourses(response.data.courses || []);
    } catch (err) {
      console.error("Failed to load courses:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load courses."
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  // =========================================================
  // BATCHES
  // =========================================================

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const response = await axios.get(
        `${API_URL}/batches`,
        authConfig
      );

      const data =
        response.data.batches ||
        response.data.data ||
        [];

      setBatches(data);
    } catch (err) {
      console.error("Failed to load batches:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load batches."
      );
    } finally {
      setLoadingBatches(false);
    }
  };

  // =========================================================
  // ASSIGNMENTS
  // =========================================================

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);

      const response = await axios.get(
        `${API_URL}/assignments`,
        authConfig
      );

      const data =
        response.data.assignments ||
        response.data.data ||
        [];

      setAssignments(data);
    } catch (err) {
      console.error(
        "Failed to load assignments:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE COURSE
  // =========================================================

  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) {
      setError("Course name is required.");
      return;
    }

    try {
      setCreatingCourse(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/courses`,
        {
          name: newCourseName.trim(),
          description:
            newCourseDescription.trim(),
        },
        authConfig
      );

      const createdCourse = response.data.course;

      await fetchCourses();

      setForm((prev) => ({
        ...prev,
        course: createdCourse._id,
      }));

      setNewCourseName("");
      setNewCourseDescription("");
      setShowCourseCreator(false);

      showSuccess("Course created successfully.");
    } catch (err) {
      console.error("Create course error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create course."
      );
    } finally {
      setCreatingCourse(false);
    }
  };

  // =========================================================
  // TOPICS
  // =========================================================

  const addTopic = () => {
    const newIndex = form.topics.length;

    setForm((prev) => ({
      ...prev,
      topics: [
        ...prev.topics,
        emptyTopic(),
      ],
    }));

    setExpandedTopics((prev) => ({
      ...prev,
      [newIndex]: true,
    }));
  };

  const removeTopic = (topicIndex) => {
    setForm((prev) => ({
      ...prev,
      topics: prev.topics.filter(
        (_, index) => index !== topicIndex
      ),
    }));

    setExpandedTopics({});
  };

  const updateTopic = (
    topicIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      topics[topicIndex] = {
        ...topics[topicIndex],
        [field]: value,
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  const toggleTopic = (index) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // =========================================================
  // QUESTIONS
  // =========================================================

  const addQuestion = (topicIndex) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      topics[topicIndex] = {
        ...topics[topicIndex],
        questions: [
          ...topics[topicIndex].questions,
          emptyQuestion(),
        ],
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  const updateQuestion = (
    topicIndex,
    questionIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      const questions = [
        ...topics[topicIndex].questions,
      ];

      questions[questionIndex] = {
        ...questions[questionIndex],
        [field]: value,
      };

      topics[topicIndex] = {
        ...topics[topicIndex],
        questions,
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  const removeQuestion = (
    topicIndex,
    questionIndex
  ) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      topics[topicIndex] = {
        ...topics[topicIndex],
        questions:
          topics[topicIndex].questions.filter(
            (_, index) =>
              index !== questionIndex
          ),
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  // =========================================================
  // ATTACHMENTS
  // =========================================================

  const addAttachment = (topicIndex) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      topics[topicIndex] = {
        ...topics[topicIndex],
        attachments: [
          ...topics[topicIndex].attachments,
          emptyAttachment(),
        ],
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  const updateAttachment = (
    topicIndex,
    attachmentIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      const attachments = [
        ...topics[topicIndex].attachments,
      ];

      attachments[attachmentIndex] = {
        ...attachments[attachmentIndex],
        [field]: value,
      };

      topics[topicIndex] = {
        ...topics[topicIndex],
        attachments,
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  const removeAttachment = (
    topicIndex,
    attachmentIndex
  ) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      topics[topicIndex] = {
        ...topics[topicIndex],
        attachments:
          topics[topicIndex].attachments.filter(
            (_, index) =>
              index !== attachmentIndex
          ),
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  // =========================================================
  // SUBMISSION FIELDS
  // =========================================================

  const addSubmissionField = (topicIndex) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      topics[topicIndex] = {
        ...topics[topicIndex],
        submissionFields: [
          ...topics[topicIndex]
            .submissionFields,
          emptySubmissionField(),
        ],
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  const updateSubmissionField = (
    topicIndex,
    fieldIndex,
    field,
    value
  ) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      const submissionFields = [
        ...topics[topicIndex]
          .submissionFields,
      ];

      submissionFields[fieldIndex] = {
        ...submissionFields[fieldIndex],
        [field]: value,
      };

      topics[topicIndex] = {
        ...topics[topicIndex],
        submissionFields,
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  const removeSubmissionField = (
    topicIndex,
    fieldIndex
  ) => {
    setForm((prev) => {
      const topics = [...prev.topics];

      topics[topicIndex] = {
        ...topics[topicIndex],
        submissionFields:
          topics[topicIndex]
            .submissionFields.filter(
              (_, index) =>
                index !== fieldIndex
            ),
      };

      return {
        ...prev,
        topics,
      };
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Assignment title is required.";
    }

    if (!form.description.trim()) {
      return "Description is required.";
    }

    if (!form.instructions.trim()) {
      return "Instructions are required.";
    }

    if (!form.course) {
      return "Please select a course.";
    }

    if (!form.batchId) {
      return "Please select a batch.";
    }

    if (!form.deadline) {
      return "Deadline is required.";
    }

    if (
      form.maxScore === "" ||
      Number(form.maxScore) < 0
    ) {
      return "Maximum score is required.";
    }

    for (
      let i = 0;
      i < form.topics.length;
      i++
    ) {
      const topic = form.topics[i];

      if (!topic.title.trim()) {
        return `Topic ${i + 1} needs a title.`;
      }

      for (
        let q = 0;
        q < topic.questions.length;
        q++
      ) {
        if (
          !topic.questions[q].title.trim()
        ) {
          return `Question ${
            q + 1
          } in Topic ${
            i + 1
          } needs a title.`;
        }
      }

      for (
        let a = 0;
        a < topic.attachments.length;
        a++
      ) {
        const attachment =
          topic.attachments[a];

        if (
          !attachment.title.trim()
        ) {
          return `Attachment ${
            a + 1
          } in Topic ${
            i + 1
          } needs a title.`;
        }

        if (!attachment.url.trim()) {
          return `Attachment ${
            a + 1
          } in Topic ${
            i + 1
          } needs a URL or file location.`;
        }
      }

      for (
        let s = 0;
        s < topic.submissionFields.length;
        s++
      ) {
        const field =
          topic.submissionFields[s];

        // THIS FIXES YOUR PREVIOUS ERROR
        if (!field.label.trim()) {
          return `Submission Field ${
            s + 1
          } in Topic ${
            i + 1
          } needs a label.`;
        }
      }
    }

    return "";
  };

  // =========================================================
  // PAYLOAD
  // =========================================================

  const buildPayload = () => ({
    title: form.title.trim(),

    description:
      form.description.trim(),

    instructions:
      form.instructions.trim(),

    course: form.course,

    batchId: form.batchId,

    deadline: form.deadline,

    maxScore: Number(form.maxScore),

    topics: form.topics.map((topic) => ({
      title: topic.title.trim(),

      description:
        topic.description.trim(),

      questions:
        topic.questions.map(
          (question) => ({
            title:
              question.title.trim(),

            description:
              question.description.trim(),

            type: question.type,

            points: Number(
              question.points || 0
            ),
          })
        ),

      attachments:
        topic.attachments.map(
          (attachment) => ({
            title:
              attachment.title.trim(),

            type: attachment.type,

            url:
              attachment.url.trim(),

            description:
              attachment.description.trim(),
          })
        ),

      submissionFields:
        topic.submissionFields
          .filter(
            (field) =>
              field.label.trim()
          )
          .map((field) => ({
            label:
              field.label.trim(),

            type: field.type,

            required:
              Boolean(field.required),
          })),
    })),
  });

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const payload =
        buildPayload();

      let response;

      if (editingId) {
        response =
          await axios.put(
            `${API_URL}/assignments/${editingId}`,
            payload,
            authConfig
          );

        showSuccess(
          "Assignment updated successfully."
        );
      } else {
        response =
          await axios.post(
            `${API_URL}/assignments`,
            payload,
            authConfig
          );

        showSuccess(
          "Assignment created successfully."
        );
      }

      console.log(
        "Assignment response:",
        response.data
      );

      await fetchAssignments();

      resetForm();

      setActiveView("list");
    } catch (err) {
      console.error(
        "Save assignment error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save assignment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = async (assignment) => {
    try {
      setError("");

      let data = assignment;

      // Get complete assignment
      if (assignment._id) {
        const response =
          await axios.get(
            `${API_URL}/assignments/${assignment._id}`,
            authConfig
          );

        data =
          response.data.assignment ||
          response.data.data ||
          assignment;
      }

      const normalizedTopics = (
        data.topics || []
      ).map((topic) => ({
        title: topic.title || "",

        description:
          topic.description || "",

        questions: (
          topic.questions || []
        ).map((question) => ({
          title:
            question.title || "",

          description:
            question.description || "",

          type:
            question.type || "text",

          points:
            question.points || 0,
        })),

        attachments: (
          topic.attachments || []
        ).map((attachment) => ({
          title:
            attachment.title || "",

          type:
            attachment.type || "link",

          url:
            attachment.url || "",

          description:
            attachment.description || "",
        })),

        submissionFields: (
          topic.submissionFields || []
        ).map((field) => ({
          label:
            field.label || "",

          type:
            field.type || "url",

          required:
            Boolean(field.required),
        })),
      }));

      setForm({
        title: data.title || "",

        description:
          data.description || "",

        instructions:
          data.instructions || "",

        course:
          typeof data.course === "object"
            ? data.course?._id || ""
            : data.course || "",

        batchId:
          data.batchId?._id ||
          data.batchId ||
          "",

        deadline: data.deadline
          ? new Date(data.deadline)
              .toISOString()
              .slice(0, 16)
          : "",

        maxScore:
          data.maxScore ?? "",

        topics:
          normalizedTopics,
      });

      setEditingId(data._id);

      const expanded = {};

      normalizedTopics.forEach(
        (_, index) => {
          expanded[index] = true;
        }
      );

      setExpandedTopics(expanded);

      setActiveView("create");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Load assignment for edit error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load assignment."
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    assignment
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${assignment.title}"? This action cannot be undone.`
      );

    if (!confirmed) return;

    try {
      setDeletingId(
        assignment._id
      );

      setError("");

      await axios.delete(
        `${API_URL}/assignments/${assignment._id}`,
        authConfig
      );

      setAssignments((prev) =>
        prev.filter(
          (item) =>
            item._id !==
            assignment._id
        )
      );

      showSuccess(
        "Assignment deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete assignment error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete assignment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // PUBLISH / UNPUBLISH
  // =========================================================

  const handleTogglePublish = async (
    assignment
  ) => {
    try {
      setPublishingId(
        assignment._id
      );

      setError("");

      const nextPublished =
        !Boolean(
          assignment.published
        );

      await axios.put(
        `${API_URL}/assignments/${assignment._id}`,
        {
          published:
            nextPublished,
        },
        authConfig
      );

      setAssignments((prev) =>
        prev.map((item) =>
          item._id ===
          assignment._id
            ? {
                ...item,
                published:
                  nextPublished,
              }
            : item
        )
      );

      showSuccess(
        nextPublished
          ? "Assignment published."
          : "Assignment unpublished."
      );
    } catch (err) {
      console.error(
        "Publish assignment error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update assignment status."
      );
    } finally {
      setPublishingId(null);
    }
  };

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleView = async (
    assignment
  ) => {
    try {
      setError("");

      const response =
        await axios.get(
          `${API_URL}/assignments/${assignment._id}`,
          authConfig
        );

      const data =
        response.data.assignment ||
        response.data.data ||
        assignment;

      setSelectedAssignment(data);
    } catch (err) {
      console.error(
        "View assignment error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load assignment."
      );
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const resetForm = () => {
    setForm(emptyForm());
    setExpandedTopics({});
    setEditingId(null);
  };

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const getCourseName = (assignment) => {
    if (
      assignment.course &&
      typeof assignment.course === "object"
    ) {
      return (
        assignment.course.name ||
        "Unknown Course"
      );
    }

    const course =
      courses.find(
        (item) =>
          item._id ===
          assignment.course
      );

    return (
      course?.name ||
      assignment.course ||
      "Unknown Course"
    );
  };

  const getBatchName = (assignment) => {
    if (
      assignment.batchId &&
      typeof assignment.batchId ===
        "object"
    ) {
      return (
        assignment.batchId.name ||
        assignment.batchId.batchName ||
        "Unknown Batch"
      );
    }

    const batch =
      batches.find(
        (item) =>
          item._id ===
          assignment.batchId
      );

    return (
      batch?.name ||
      batch?.batchName ||
      assignment.batchId ||
      "Unknown Batch"
    );
  };

  const filteredAssignments =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return assignments;
      }

      return assignments.filter(
        (assignment) =>
          assignment.title
            ?.toLowerCase()
            .includes(value) ||
          getCourseName(
            assignment
          )
            .toLowerCase()
            .includes(value) ||
          getBatchName(
            assignment
          )
            .toLowerCase()
            .includes(value)
      );
    }, [
      assignments,
      search,
      courses,
      batches,
    ]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Assignment Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create, manage, preview and publish assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setActiveView("create");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Create Assignment
          </button>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2
              size={17}
            />
            {success}
          </div>
        )}

        {/* TABS */}

        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200">
          <button
            type="button"
            onClick={() =>
              setActiveView("list")
            }
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeView === "list"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            All Assignments
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveView("create")
            }
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeView === "create"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {editingId
              ? "Edit Assignment"
              : "Create Assignment"}
          </button>
        </div>

        {/* =================================================
            ASSIGNMENT LIST
        ================================================== */}

        {activeView === "list" && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Assignments
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {assignments.length} assignment
                    {assignments.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="relative w-full md:max-w-sm">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search assignments..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
            </div>

            {loadingAssignments ? (
              <div className="flex items-center justify-center p-12">
                <Loader2
                  size={25}
                  className="animate-spin text-slate-500"
                />

                <span className="ml-3 text-sm text-slate-500">
                  Loading assignments...
                </span>
              </div>
            ) : filteredAssignments.length ===
              0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Save
                    size={20}
                    className="text-slate-500"
                  />
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  No assignments found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create your first assignment to get started.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveView(
                      "create"
                    );
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus size={16} />
                  Create Assignment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredAssignments.map(
                  (assignment) => (
                    <div
                      key={
                        assignment._id
                      }
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-slate-900">
                              {assignment.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                assignment.published
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {assignment.published
                                ? "Published"
                                : "Draft"}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {assignment.description ||
                              "No description"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span>
                              Course:{" "}
                              <strong className="text-slate-700">
                                {getCourseName(
                                  assignment
                                )}
                              </strong>
                            </span>

                            <span>
                              Batch:{" "}
                              <strong className="text-slate-700">
                                {getBatchName(
                                  assignment
                                )}
                              </strong>
                            </span>

                            <span>
                              Score:{" "}
                              <strong className="text-slate-700">
                                {assignment.maxScore ??
                                  0}
                              </strong>
                            </span>

                            {assignment.deadline && (
                              <span>
                                Deadline:{" "}
                                <strong className="text-slate-700">
                                  {new Date(
                                    assignment.deadline
                                  ).toLocaleString()}
                                </strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleView(
                                assignment
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Eye size={15} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                assignment
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil
                              size={15}
                            />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              publishingId ===
                              assignment._id
                            }
                            onClick={() =>
                              handleTogglePublish(
                                assignment
                              )
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                              assignment.published
                                ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-slate-900 text-white hover:bg-slate-800"
                            } disabled:opacity-50`}
                          >
                            {publishingId ===
                            assignment._id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : assignment.published ? (
                              <XCircle
                                size={15}
                              />
                            ) : (
                              <CheckCircle2
                                size={15}
                              />
                            )}

                            {assignment.published
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              assignment._id
                            }
                            onClick={() =>
                              handleDelete(
                                assignment
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            {deletingId ===
                            assignment._id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={15}
                              />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            CREATE / EDIT
        ================================================== */}

        {activeView === "create" && (
          <form
            onSubmit={handleSubmit}
          >

            {/* BASIC INFORMATION */}

            <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId
                    ? "Edit Assignment"
                    : "Assignment Information"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure the assignment information and requirements.
                </p>
              </div>

              <div className="grid gap-5 p-6">

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Build a Portfolio Website"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description *
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the assignment..."
                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </div>

                {/* INSTRUCTIONS */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Instructions *
                  </label>

                  <textarea
                    name="instructions"
                    value={
                      form.instructions
                    }
                    onChange={
                      handleChange
                    }
                    rows={5}
                    placeholder="Explain what students need to do..."
                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </div>

                {/* COURSE + BATCH */}

                <div className="grid gap-5 md:grid-cols-2">

                  {/* COURSE */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">
                        Course *
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setShowCourseCreator(
                            !showCourseCreator
                          )
                        }
                        className="text-xs font-semibold text-slate-700 hover:text-slate-950"
                      >
                        + New Course
                      </button>
                    </div>

                    <select
                      name="course"
                      value={
                        form.course
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={
                        loadingCourses
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">
                        {loadingCourses
                          ? "Loading courses..."
                          : "Select course"}
                      </option>

                      {courses.map(
                        (course) => (
                          <option
                            key={
                              course._id
                            }
                            value={
                              course._id
                            }
                          >
                            {course.name}
                          </option>
                        )
                      )}
                    </select>

                    {showCourseCreator && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">

                        <input
                          value={
                            newCourseName
                          }
                          onChange={(e) =>
                            setNewCourseName(
                              e.target.value
                            )
                          }
                          placeholder="Course name"
                          className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none"
                        />

                        <textarea
                          value={
                            newCourseDescription
                          }
                          onChange={(e) =>
                            setNewCourseDescription(
                              e.target.value
                            )
                          }
                          rows={2}
                          placeholder="Course description"
                          className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none"
                        />

                        <button
                          type="button"
                          onClick={
                            handleCreateCourse
                          }
                          disabled={
                            creatingCourse
                          }
                          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          {creatingCourse
                            ? "Creating..."
                            : "Create Course"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* BATCH */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Batch *
                    </label>

                    <select
                      name="batchId"
                      value={
                        form.batchId
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={
                        loadingBatches
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">
                        {loadingBatches
                          ? "Loading batches..."
                          : "Select batch"}
                      </option>

                      {batches.map(
                        (batch) => (
                          <option
                            key={
                              batch._id
                            }
                            value={
                              batch._id
                            }
                          >
                            {batch.name ||
                              batch.batchName ||
                              "Unnamed Batch"}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {/* DEADLINE + SCORE */}

                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Deadline *
                    </label>

                    <input
                      type="datetime-local"
                      name="deadline"
                      value={
                        form.deadline
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Maximum Score *
                    </label>

                    <input
                      type="number"
                      name="maxScore"
                      min="0"
                      value={
                        form.maxScore
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="100"
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TOPICS */}

            <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Topics / Containers
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add unlimited topics, questions, attachments and submission fields.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    addTopic
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  <Plus
                    size={17}
                  />
                  Add Topic
                </button>
              </div>

              <div className="p-6">

                {form.topics.length ===
                0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No topics added
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Topics are optional.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {form.topics.map(
                      (
                        topic,
                        topicIndex
                      ) => {
                        const expanded =
                          expandedTopics[
                            topicIndex
                          ];

                        return (
                          <div
                            key={
                              topicIndex
                            }
                            className="overflow-hidden rounded-xl border border-slate-200"
                          >

                            {/* TOPIC HEADER */}

                            <div className="flex items-center justify-between bg-slate-50 px-5 py-4">

                              <button
                                type="button"
                                onClick={() =>
                                  toggleTopic(
                                    topicIndex
                                  )
                                }
                                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                              >
                                {expanded ? (
                                  <ChevronUp
                                    size={
                                      18
                                    }
                                  />
                                ) : (
                                  <ChevronDown
                                    size={
                                      18
                                    }
                                  />
                                )}

                                <span className="font-semibold text-slate-800">
                                  {topic.title ||
                                    `Topic ${
                                      topicIndex +
                                      1
                                    }`}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeTopic(
                                    topicIndex
                                  )
                                }
                                className="ml-3 rounded-lg p-2 text-red-500 hover:bg-red-50"
                              >
                                <Trash2
                                  size={
                                    17
                                  }
                                />
                              </button>
                            </div>

                            {expanded && (
                              <div className="space-y-7 p-5">

                                {/* TOPIC BASIC */}

                                <div className="grid gap-5">

                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                      Topic Title *
                                    </label>

                                    <input
                                      value={
                                        topic.title
                                      }
                                      onChange={(e) =>
                                        updateTopic(
                                          topicIndex,
                                          "title",
                                          e.target
                                            .value
                                        )
                                      }
                                      placeholder="e.g. HTML Fundamentals"
                                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                      Topic Description
                                    </label>

                                    <textarea
                                      value={
                                        topic.description
                                      }
                                      onChange={(e) =>
                                        updateTopic(
                                          topicIndex,
                                          "description",
                                          e.target
                                            .value
                                        )
                                      }
                                      rows={
                                        3
                                      }
                                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                                    />
                                  </div>
                                </div>

                                {/* QUESTIONS */}

                                <section>

                                  <div className="mb-4 flex items-center justify-between">

                                    <div>
                                      <h3 className="font-semibold text-slate-800">
                                        Questions
                                      </h3>

                                      <p className="text-xs text-slate-500">
                                        Add as many questions as needed.
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        addQuestion(
                                          topicIndex
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                      <Plus
                                        size={
                                          15
                                        }
                                      />
                                      Add Question
                                    </button>
                                  </div>

                                  <div className="space-y-4">

                                    {topic.questions.map(
                                      (
                                        question,
                                        questionIndex
                                      ) => (
                                        <div
                                          key={
                                            questionIndex
                                          }
                                          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                        >

                                          <div className="mb-4 flex items-center justify-between">

                                            <span className="text-sm font-semibold text-slate-700">
                                              Question{" "}
                                              {questionIndex +
                                                1}
                                            </span>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeQuestion(
                                                  topicIndex,
                                                  questionIndex
                                                )
                                              }
                                              className="text-red-500"
                                            >
                                              <Trash2
                                                size={
                                                  16
                                                }
                                              />
                                            </button>
                                          </div>

                                          <div className="grid gap-4 md:grid-cols-3">

                                            <div className="md:col-span-3">
                                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                                Question *
                                              </label>

                                              <input
                                                value={
                                                  question.title
                                                }
                                                onChange={(e) =>
                                                  updateQuestion(
                                                    topicIndex,
                                                    questionIndex,
                                                    "title",
                                                    e.target
                                                      .value
                                                  )
                                                }
                                                placeholder="Enter question"
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                              />
                                            </div>

                                            <div className="md:col-span-3">
                                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                                Description
                                              </label>

                                              <textarea
                                                value={
                                                  question.description
                                                }
                                                onChange={(e) =>
                                                  updateQuestion(
                                                    topicIndex,
                                                    questionIndex,
                                                    "description",
                                                    e.target
                                                      .value
                                                  )
                                                }
                                                rows={
                                                  2
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                              />
                                            </div>

                                            <div>
                                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                                Type
                                              </label>

                                              <select
                                                value={
                                                  question.type
                                                }
                                                onChange={(e) =>
                                                  updateQuestion(
                                                    topicIndex,
                                                    questionIndex,
                                                    "type",
                                                    e.target
                                                      .value
                                                  )
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                              >
                                                <option value="text">
                                                  Text
                                                </option>

                                                <option value="textarea">
                                                  Long Text
                                                </option>

                                                <option value="number">
                                                  Number
                                                </option>

                                                <option value="url">
                                                  URL
                                                </option>
                                              </select>
                                            </div>

                                            <div>
                                              <label className="mb-1 block text-xs font-medium text-slate-600">
                                                Points
                                              </label>

                                              <input
                                                type="number"
                                                min="0"
                                                value={
                                                  question.points
                                                }
                                                onChange={(e) =>
                                                  updateQuestion(
                                                    topicIndex,
                                                    questionIndex,
                                                    "points",
                                                    e.target
                                                      .value
                                                  )
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                              />
                                            </div>

                                          </div>
                                        </div>
                                      )
                                    )}

                                  </div>
                                </section>

                                {/* ATTACHMENTS */}

                                <section>

                                  <div className="mb-4 flex items-center justify-between">

                                    <div>
                                      <h3 className="font-semibold text-slate-800">
                                        Attachments
                                      </h3>

                                      <p className="text-xs text-slate-500">
                                        Add links, files, images, documents or videos.
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        addAttachment(
                                          topicIndex
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                      <Plus
                                        size={
                                          15
                                        }
                                      />
                                      Add Attachment
                                    </button>
                                  </div>

                                  <div className="space-y-3">

                                    {topic.attachments.map(
                                      (
                                        attachment,
                                        attachmentIndex
                                      ) => (
                                        <div
                                          key={
                                            attachmentIndex
                                          }
                                          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                        >

                                          <div className="grid gap-4 md:grid-cols-2">

                                            <input
                                              value={
                                                attachment.title
                                              }
                                              onChange={(e) =>
                                                updateAttachment(
                                                  topicIndex,
                                                  attachmentIndex,
                                                  "title",
                                                  e.target
                                                    .value
                                                )
                                              }
                                              placeholder="Attachment title"
                                              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                            />

                                            <select
                                              value={
                                                attachment.type
                                              }
                                              onChange={(e) =>
                                                updateAttachment(
                                                  topicIndex,
                                                  attachmentIndex,
                                                  "type",
                                                  e.target
                                                    .value
                                                )
                                              }
                                              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                            >
                                              <option value="link">
                                                Link
                                              </option>

                                              <option value="file">
                                                File
                                              </option>

                                              <option value="image">
                                                Image
                                              </option>

                                              <option value="document">
                                                Document
                                              </option>

                                              <option value="video">
                                                Video
                                              </option>
                                            </select>

                                            <input
                                              value={
                                                attachment.url
                                              }
                                              onChange={(e) =>
                                                updateAttachment(
                                                  topicIndex,
                                                  attachmentIndex,
                                                  "url",
                                                  e.target
                                                    .value
                                                )
                                              }
                                              placeholder="URL / file location"
                                              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm md:col-span-2"
                                            />

                                            <input
                                              value={
                                                attachment.description
                                              }
                                              onChange={(e) =>
                                                updateAttachment(
                                                  topicIndex,
                                                  attachmentIndex,
                                                  "description",
                                                  e.target
                                                    .value
                                                )
                                              }
                                              placeholder="Description"
                                              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                            />

                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeAttachment(
                                                  topicIndex,
                                                  attachmentIndex
                                                )
                                              }
                                              className="justify-self-start rounded-lg px-3 py-2 text-red-500 hover:bg-red-50"
                                            >
                                              <Trash2
                                                size={
                                                  16
                                                }
                                              />
                                            </button>

                                          </div>
                                        </div>
                                      )
                                    )}

                                  </div>
                                </section>

                                {/* SUBMISSION FIELDS */}

                                <section>

                                  <div className="mb-4 flex items-center justify-between">

                                    <div>
                                      <h3 className="font-semibold text-slate-800">
                                        Submission Fields
                                      </h3>

                                      <p className="text-xs text-slate-500">
                                        Define what students must submit.
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        addSubmissionField(
                                          topicIndex
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                      <Plus
                                        size={
                                          15
                                        }
                                      />
                                      Add Field
                                    </button>
                                  </div>

                                  <div className="space-y-3">

                                    {topic.submissionFields.map(
                                      (
                                        field,
                                        fieldIndex
                                      ) => (
                                        <div
                                          key={
                                            fieldIndex
                                          }
                                          className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center"
                                        >

                                          <div className="flex-1">
                                            <label className="mb-1 block text-xs font-medium text-slate-600">
                                              Field Label *
                                            </label>

                                            <input
                                              value={
                                                field.label
                                              }
                                              onChange={(e) =>
                                                updateSubmissionField(
                                                  topicIndex,
                                                  fieldIndex,
                                                  "label",
                                                  e.target
                                                    .value
                                                )
                                              }
                                              placeholder="e.g. GitHub Repository"
                                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                            />
                                          </div>

                                          <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">
                                              Type
                                            </label>

                                            <select
                                              value={
                                                field.type
                                              }
                                              onChange={(e) =>
                                                updateSubmissionField(
                                                  topicIndex,
                                                  fieldIndex,
                                                  "type",
                                                  e.target
                                                    .value
                                                )
                                              }
                                              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                                            >
                                              <option value="url">
                                                URL
                                              </option>

                                              <option value="text">
                                                Text
                                              </option>

                                              <option value="file">
                                                File
                                              </option>

                                              <option value="document">
                                                Document
                                              </option>

                                              <option value="image">
                                                Image
                                              </option>
                                            </select>
                                          </div>

                                          <label className="flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                              type="checkbox"
                                              checked={
                                                field.required
                                              }
                                              onChange={(e) =>
                                                updateSubmissionField(
                                                  topicIndex,
                                                  fieldIndex,
                                                  "required",
                                                  e.target
                                                    .checked
                                                )
                                              }
                                            />
                                            Required
                                          </label>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeSubmissionField(
                                                topicIndex,
                                                fieldIndex
                                              )
                                            }
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                          >
                                            <Trash2
                                              size={
                                                16
                                              }
                                            />
                                          </button>

                                        </div>
                                      )
                                    )}

                                  </div>
                                </section>

                              </div>
                            )}
                          </div>
                        );
                      }
                    )}

                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveView(
                    "list"
                  );
                }}
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    {editingId
                      ? "Updating..."
                      : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    {editingId
                      ? "Update Assignment"
                      : "Create Assignment"}
                  </>
                )}
              </button>

            </div>
          </form>
        )}

      </div>

      {/* =====================================================
          ASSIGNMENT DETAILS / PREVIEW MODAL
      ====================================================== */}

      {selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 sm:p-6">

          <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assignment Preview
                </h2>

                <p className="text-xs text-slate-500">
                  Student-facing assignment details
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAssignment(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="space-y-7 p-5 sm:p-7">

              <div>
                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl font-bold text-slate-900">
                    {
                      selectedAssignment.title
                    }
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedAssignment.published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {selectedAssignment.published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {
                    selectedAssignment.description
                  }
                </p>
              </div>

              <div className="grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-3">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Course
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {getCourseName(
                      selectedAssignment
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Batch
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {getBatchName(
                      selectedAssignment
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Maximum Score
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {
                      selectedAssignment.maxScore
                    }
                  </p>
                </div>

              </div>

              {selectedAssignment.instructions && (
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Instructions
                  </h3>

                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                    {
                      selectedAssignment.instructions
                    }
                  </div>
                </div>
              )}

              {/* TOPICS */}

              <div>
                <h3 className="mb-4 text-base font-semibold text-slate-900">
                  Topics
                </h3>

                {(
                  selectedAssignment.topics ||
                  []
                ).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    No topics configured.
                  </div>
                ) : (
                  <div className="space-y-5">

                    {selectedAssignment.topics.map(
                      (
                        topic,
                        topicIndex
                      ) => (
                        <div
                          key={
                            topic._id ||
                            topicIndex
                          }
                          className="rounded-xl border border-slate-200 p-5"
                        >

                          <h4 className="text-lg font-semibold text-slate-900">
                            {topic.title}
                          </h4>

                          {topic.description && (
                            <p className="mt-1 text-sm text-slate-500">
                              {
                                topic.description
                              }
                            </p>
                          )}

                          {/* QUESTIONS */}

                          {(
                            topic.questions ||
                            []
                          ).length > 0 && (
                            <div className="mt-5">

                              <h5 className="mb-3 text-sm font-semibold text-slate-800">
                                Questions
                              </h5>

                              <div className="space-y-3">

                                {topic.questions.map(
                                  (
                                    question,
                                    questionIndex
                                  ) => (
                                    <div
                                      key={
                                        question._id ||
                                        questionIndex
                                      }
                                      className="rounded-lg bg-slate-50 p-4"
                                    >

                                      <div className="flex items-start justify-between gap-4">

                                        <div>
                                          <p className="text-sm font-medium text-slate-800">
                                            {questionIndex +
                                              1}
                                            .{" "}
                                            {
                                              question.title
                                            }
                                          </p>

                                          {question.description && (
                                            <p className="mt-1 text-xs text-slate-500">
                                              {
                                                question.description
                                              }
                                            </p>
                                          )}
                                        </div>

                                        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                          {
                                            question.points
                                          }{" "}
                                          pts
                                        </span>

                                      </div>

                                    </div>
                                  )
                                )}

                              </div>
                            </div>
                          )}

                          {/* ATTACHMENTS */}

                          {(
                            topic.attachments ||
                            []
                          ).length > 0 && (
                            <div className="mt-5">

                              <h5 className="mb-3 text-sm font-semibold text-slate-800">
                                Attachments
                              </h5>

                              <div className="space-y-2">

                                {topic.attachments.map(
                                  (
                                    attachment,
                                    attachmentIndex
                                  ) => (
                                    <a
                                      key={
                                        attachment._id ||
                                        attachmentIndex
                                      }
                                      href={
                                        attachment.url ||
                                        "#"
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                                    >

                                      <div>
                                        <p className="text-sm font-medium text-slate-800">
                                          {
                                            attachment.title
                                          }
                                        </p>

                                        <p className="text-xs text-slate-500">
                                          {
                                            attachment.type
                                          }
                                        </p>
                                      </div>

                                      <ExternalLink
                                        size={
                                          16
                                        }
                                        className="text-slate-400"
                                      />
                                    </a>
                                  )
                                )}

                              </div>
                            </div>
                          )}

                          {/* SUBMISSION FIELDS */}

                          {(
                            topic.submissionFields ||
                            []
                          ).length > 0 && (
                            <div className="mt-5">

                              <h5 className="mb-3 text-sm font-semibold text-slate-800">
                                Required Submissions
                              </h5>

                              <div className="space-y-2">

                                {topic.submissionFields.map(
                                  (
                                    field,
                                    fieldIndex
                                  ) => (
                                    <div
                                      key={
                                        field._id ||
                                        fieldIndex
                                      }
                                      className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                                    >

                                      <span className="text-sm text-slate-700">
                                        {
                                          field.label
                                        }
                                      </span>

                                      <span className="text-xs font-medium text-slate-500">
                                        {
                                          field.type
                                        }

                                        {field.required &&
                                          " • Required"}
                                      </span>

                                    </div>
                                  )
                                )}

                              </div>
                            </div>
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAssignments;