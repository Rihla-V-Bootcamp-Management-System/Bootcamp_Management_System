import { useEffect, useState } from "react";
import {
  Megaphone,
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  Users,
  UserRound,
  GraduationCap,
  ShieldCheck,
  Trophy,
  BookOpen,
  MessageCircle,
  Clock3,
  MoreHorizontal,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

function CreateAnnouncement() {
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "Session",
    recipients: [],
    batchId: "",
    activeLink: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    publishDate: "",
    status: "Draft",
  });

  // =========================================================
  // LOAD BATCHES
  // =========================================================
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);

        const response = await apiClient.get("/batches");

        const loadedBatches =
          response.data?.batches ||
          response.data?.data ||
          response.data ||
          [];

        setBatches(
          Array.isArray(loadedBatches)
            ? loadedBatches
            : []
        );
      } catch (error) {
        console.error("FETCH BATCHES ERROR:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load batches."
        );
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, []);

  // =========================================================
  // CATEGORIES
  // =========================================================
  const categories = [
    {
      value: "Contest",
      label: "Contest",
      description: "Competitions and coding challenges",
      icon: Trophy,
    },
    {
      value: "Session",
      label: "Session",
      description: "Classes, workshops and training",
      icon: BookOpen,
    },
    {
      value: "Experience Sharing",
      label: "Experience Sharing",
      description: "Talks, discussions and insights",
      icon: MessageCircle,
    },
    {
      value: "Deadline",
      label: "Deadline",
      description: "Important submission deadlines",
      icon: Clock3,
    },
    {
      value: "Other",
      label: "Other",
      description: "General bootcamp announcements",
      icon: MoreHorizontal,
    },
  ];

  // =========================================================
  // RECIPIENTS
  // =========================================================
  const recipientOptions = [
    {
      value: "Superadmin",
      label: "Super Admin",
      description: "System administrators",
      icon: ShieldCheck,
    },
    {
      value: "Mentor",
      label: "Mentors",
      description: "Mentors assigned to this batch",
      icon: UserRound,
    },
    {
      value: "Student",
      label: "Students",
      description: "Students in this batch",
      icon: GraduationCap,
    },
  ];

  // =========================================================
  // INPUT CHANGE
  // =========================================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================
  const handleCategoryChange = (category) => {
    setFormData((previous) => ({
      ...previous,
      type: category,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // RECIPIENT TOGGLE
  // =========================================================
  const toggleRecipient = (recipient) => {
    setFormData((previous) => {
      const exists =
        previous.recipients.includes(recipient);

      return {
        ...previous,
        recipients: exists
          ? previous.recipients.filter(
              (item) => item !== recipient
            )
          : [
              ...previous.recipients,
              recipient,
            ],
      };
    });

    setError("");
    setSuccess("");
  };

  // =========================================================
  // VALIDATION
  // =========================================================
  const validateForm = (
    submitStatus = formData.status
  ) => {
    if (!formData.title.trim()) {
      return "Please enter an announcement title.";
    }

    if (!formData.content.trim()) {
      return "Please write the announcement message.";
    }

    if (!formData.type) {
      return "Please select an announcement category.";
    }

    if (formData.recipients.length === 0) {
      return "Please select at least one recipient.";
    }

    if (!formData.batchId) {
      return "Please select a batch.";
    }

    // Scheduled validation
    if (
      submitStatus === "Scheduled" &&
      !formData.publishDate
    ) {
      return "Please select a publish date for the scheduled announcement.";
    }

    if (
      submitStatus === "Scheduled" &&
      formData.publishDate &&
      new Date(formData.publishDate) <= new Date()
    ) {
      return "Scheduled publish date must be in the future.";
    }

    // Link validation
    if (formData.activeLink) {
      try {
        const url = new URL(formData.activeLink);

        if (
          url.protocol !== "http:" &&
          url.protocol !== "https:"
        ) {
          return "Please enter a valid link beginning with http:// or https://.";
        }
      } catch {
        return "Please enter a valid link beginning with http:// or https://.";
      }
    }

    // Event date/time validation
    if (
      formData.eventDate &&
      !formData.startTime
    ) {
      return "Please select a start time for the event.";
    }

    if (
      formData.startTime &&
      !formData.eventDate
    ) {
      return "Please select an event date.";
    }

    if (
      formData.endTime &&
      formData.startTime &&
      formData.endTime <= formData.startTime
    ) {
      return "End time must be later than the start time.";
    }

    return "";
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (
    event,
    submitStatus = formData.status
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm(submitStatus);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setCreating(true);

      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        recipients: formData.recipients,
        batchId: formData.batchId,

        activeLink:
          formData.activeLink.trim() || "",

        eventDate:
          formData.eventDate || null,

        startTime:
          formData.startTime || null,

        endTime:
          formData.endTime || null,

        publishDate:
          submitStatus === "Scheduled"
            ? formData.publishDate
            : submitStatus === "Published"
            ? new Date().toISOString()
            : null,

        status: submitStatus,
      };

      console.log(
        "CREATING ANNOUNCEMENT:",
        payload
      );

      await apiClient.post(
        "/announcements",
        payload
      );

      setSuccess(
        submitStatus === "Published"
          ? "Announcement published successfully."
          : submitStatus === "Scheduled"
          ? "Announcement scheduled successfully."
          : "Announcement saved as draft."
      );

      setTimeout(() => {
        navigate("/admin/announcements");
      }, 1200);
    } catch (error) {
      console.error(
        "CREATE ANNOUNCEMENT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create announcement."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================
  const getRecipientLabel = (value) => {
    const recipient =
      recipientOptions.find(
        (item) => item.value === value
      );

    return recipient?.label || value;
  };

  const selectedCategory =
    categories.find(
      (item) =>
        item.value === formData.type
    );

  const selectedBatch =
    batches.find(
      (batch) =>
        batch._id === formData.batchId
    );

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="min-h-full bg-[#F8FAFC] pb-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/announcements")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#071629]"
          >
            <ArrowLeft size={17} />
            Back to Announcements
          </button>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#071629] text-white shadow-lg shadow-slate-200">
                <Megaphone size={25} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                    Create Announcement
                  </h1>

                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {formData.status}
                  </span>

                </div>

                <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                  Create and publish an announcement to
                  your bootcamp community.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to create announcement
              </p>

              <p className="mt-0.5">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
            <CheckCircle2 size={19} />

            <span className="font-medium">
              {success}
            </span>
          </div>
        )}

        <form
          onSubmit={(event) =>
            handleSubmit(
              event,
              formData.status
            )
          }
        >

          {/* =================================================
              MAIN CONTENT + PUBLISHING
          ================================================= */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

            {/* =================================================
                LEFT — CONTENT
            ================================================= */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#071629]">
                    <FileText size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#0F172A]">
                      Announcement Content
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Write the information you want to
                      share.
                    </p>
                  </div>

                </div>

              </div>

              <div className="space-y-6 p-6">

                {/* TITLE */}
                <div>
                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Title
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <span className="text-xs text-slate-400">
                      {formData.title.length}/200
                    </span>

                  </div>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={200}
                    placeholder="e.g. JavaScript Session Tomorrow"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                {/* CATEGORY */}
                <div>

                  <div className="mb-3">

                    <label className="text-sm font-semibold text-slate-700">
                      Category
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <p className="mt-1 text-xs text-slate-500">
                      Choose the type that best describes
                      this announcement.
                    </p>

                  </div>

                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">

                    {categories.map(
                      (category) => {
                        const Icon =
                          category.icon;

                        const selected =
                          formData.type ===
                          category.value;

                        return (
                          <button
                            key={
                              category.value
                            }
                            type="button"
                            onClick={() =>
                              handleCategoryChange(
                                category.value
                              )
                            }
                            className={`group rounded-xl border p-3 text-left transition ${
                              selected
                                ? "border-[#071629] bg-[#F1F5F9] shadow-sm ring-2 ring-slate-100"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >

                            <div className="flex items-start justify-between">

                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                                  selected
                                    ? "bg-[#071629] text-white"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                }`}
                              >
                                <Icon size={17} />
                              </div>

                              <div
                                className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-[#071629] bg-[#071629]"
                                    : "border-slate-300"
                                }`}
                              >
                                {selected && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </div>

                            </div>

                            <p className="mt-3 text-xs font-semibold text-slate-900">
                              {category.label}
                            </p>

                            <p className="mt-1 hidden text-[10px] leading-4 text-slate-500 xl:block">
                              {
                                category.description
                              }
                            </p>

                          </button>
                        );
                      }
                    )}

                  </div>
                </div>

                {/* MESSAGE */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Message
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <span className="text-xs text-slate-400">
                      {formData.content.length}
                    </span>

                  </div>

                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={10}
                    placeholder="Write the full announcement here..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Keep your message clear and include
                    important details such as location,
                    requirements, or instructions.
                  </p>

                </div>

              </div>
            </section>

            {/* =================================================
                RIGHT — PUBLISHING
            ================================================= */}
            <div className="space-y-6">

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5">

                  <h2 className="font-semibold text-[#0F172A]">
                    Publishing
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Decide when this announcement becomes
                    visible.
                  </p>

                </div>

                <div className="space-y-5 p-5">

                  {/* STATUS */}
                  <div>

                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <div className="space-y-2">

                      {[
                        {
                          value: "Draft",
                          label: "Save as Draft",
                          description:
                            "Only admins can see it.",
                        },
                        {
                          value: "Scheduled",
                          label: "Schedule",
                          description:
                            "Publish automatically later.",
                        },
                        {
                          value: "Published",
                          label: "Publish Now",
                          description:
                            "Make it visible immediately.",
                        },
                      ].map((option) => {

                        const selected =
                          formData.status ===
                          option.value;

                        return (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            onClick={() => {
                              setFormData(
                                (previous) => ({
                                  ...previous,
                                  status:
                                    option.value,
                                })
                              );

                              setError("");
                              setSuccess("");
                            }}
                            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                              selected
                                ? "border-[#071629] bg-slate-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >

                            <div
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[#071629] bg-[#071629]"
                                  : "border-slate-300"
                              }`}
                            >
                              {selected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </div>

                            <div>

                              <p className="text-xs font-semibold text-slate-900">
                                {option.label}
                              </p>

                              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                                {
                                  option.description
                                }
                              </p>

                            </div>

                          </button>
                        );
                      })}

                    </div>
                  </div>

                  {/* SCHEDULE DATE */}
                  {formData.status ===
                    "Scheduled" && (
                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Publish date
                      </label>

                      <input
                        type="datetime-local"
                        name="publishDate"
                        value={
                          formData.publishDate
                        }
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                      />

                    </div>
                  )}

                  {/* SUMMARY */}
                  <div className="border-t border-slate-100 pt-5">

                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Summary
                    </h3>

                    <div className="space-y-3">

                      <div className="flex items-center justify-between gap-4">

                        <span className="text-xs text-slate-500">
                          Category
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {selectedCategory?.label ||
                            "Not selected"}
                        </span>

                      </div>

                      <div className="flex items-center justify-between gap-4">

                        <span className="text-xs text-slate-500">
                          Batch
                        </span>

                        <span className="text-right text-xs font-semibold text-slate-700">
                          {selectedBatch?.name ||
                            "Not selected"}
                        </span>

                      </div>

                      <div className="flex items-center justify-between gap-4">

                        <span className="text-xs text-slate-500">
                          Recipients
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          {formData.recipients
                            .length === 0
                            ? "None"
                            : `${formData.recipients.length} group${
                                formData.recipients
                                  .length > 1
                                  ? "s"
                                  : ""
                              }`}
                        </span>

                      </div>

                      <div className="flex items-center justify-between gap-4">

                        <span className="text-xs text-slate-500">
                          Event
                        </span>

                        <span className="text-right text-xs font-semibold text-slate-700">
                          {formData.eventDate
                            ? new Date(
                                `${formData.eventDate}T00:00:00`
                              ).toLocaleDateString()
                            : "Not set"}
                        </span>

                      </div>

                    </div>
                  </div>

                </div>
              </section>

              {/* QUICK INFO */}
              <div className="rounded-2xl border border-slate-200 bg-[#071629] p-5 text-white shadow-sm">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Megaphone size={17} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Announcement tip
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      Use a clear title and make sure
                      recipients understand what action
                      they need to take.
                    </p>

                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* =================================================
              AUDIENCE
          ================================================= */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#071629]">
                  <Users size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-[#0F172A]">
                    Audience
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Who should receive this announcement?
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              <div className="grid gap-4 md:grid-cols-3">

                {recipientOptions.map(
                  (recipient) => {

                    const Icon =
                      recipient.icon;

                    const selected =
                      formData.recipients.includes(
                        recipient.value
                      );

                    return (
                      <button
                        key={
                          recipient.value
                        }
                        type="button"
                        onClick={() =>
                          toggleRecipient(
                            recipient.value
                          )
                        }
                        className={`relative rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-[#071629] bg-slate-50 shadow-sm ring-2 ring-slate-100"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >

                        {selected && (
                          <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#071629] text-white">
                            <CheckCircle2
                              size={15}
                            />
                          </div>
                        )}

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            selected
                              ? "bg-[#071629] text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon size={21} />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          {recipient.label}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {
                            recipient.description
                          }
                        </p>

                        <div className="mt-4 text-xs font-semibold">

                          {selected ? (
                            <span className="text-[#071629]">
                              Selected
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Select recipient
                            </span>
                          )}

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

              {formData.recipients.length >
                0 && (
                <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="text-xs font-semibold text-slate-500">
                      Selected:
                    </span>

                    {formData.recipients.map(
                      (recipient) => (
                        <span
                          key={recipient}
                          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"
                        >
                          {getRecipientLabel(
                            recipient
                          )}
                        </span>
                      )
                    )}

                  </div>
                </div>
              )}

            </div>
          </section>

          {/* =================================================
              EVENT & RESOURCE
          ================================================= */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#071629]">
                  <Calendar size={19} />
                </div>

                <div>

                  <h2 className="font-semibold text-[#0F172A]">
                    Event & Resource
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Add the batch, date, time, and optional
                    resource for this announcement.
                  </p>

                </div>

              </div>
            </div>

            <div className="p-6">

              {/* BATCH */}
              <div className="mb-5">

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                  <Layers size={15} />

                  Batch

                  <span className="text-red-500">
                    *
                  </span>

                </label>

                <select
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleChange}
                  disabled={loadingBatches}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                >

                  <option value="">
                    {loadingBatches
                      ? "Loading batches..."
                      : "Select a batch"}
                  </option>

                  {batches.map((batch) => (
                    <option
                      key={batch._id}
                      value={batch._id}
                    >
                      {batch.name}
                      {batch.year
                        ? ` — ${batch.year}`
                        : ""}
                      {batch.season
                        ? ` ${batch.season}`
                        : ""}
                    </option>
                  ))}

                </select>

                <p className="mt-2 text-xs text-slate-400">
                  This announcement will be associated
                  with the selected batch.
                </p>

              </div>

              {/* DATE + START + END */}
              <div className="grid gap-5 md:grid-cols-3">

                {/* EVENT DATE */}
                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                    <Calendar size={15} />

                    Event date

                    <span className="font-normal text-slate-400">
                      Optional
                    </span>

                  </label>

                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />

                </div>

                {/* START TIME */}
                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                    <Clock3 size={15} />

                    Start time

                    <span className="font-normal text-slate-400">
                      Optional
                    </span>

                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />

                </div>

                {/* END TIME */}
                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                    <Clock3 size={15} />

                    End time

                    <span className="font-normal text-slate-400">
                      Optional
                    </span>

                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />

                </div>

              </div>

              {/* LINK */}
              <div className="mt-5">

                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                  <LinkIcon size={15} />

                  Active link

                  <span className="font-normal text-slate-400">
                    Optional
                  </span>

                </label>

                <input
                  type="url"
                  name="activeLink"
                  value={formData.activeLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                />

              </div>

              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">

                <span className="font-semibold text-slate-700">
                  Event information:
                </span>{" "}
                The date is selected separately from the
                start and end times. The end time is optional,
                so an announcement can represent an event
                with only a starting time.

              </div>

            </div>
          </section>

          {/* =================================================
              BOTTOM ACTION BAR
          ================================================= */}
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">

            {/* CANCEL */}
            <button
              type="button"
              disabled={creating}
              onClick={() =>
                navigate("/admin/announcements")
              }
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              Cancel
            </button>

            {/* SAVE DRAFT */}
            <button
              type="button"
              disabled={creating}
              onClick={(event) =>
                handleSubmit(
                  event,
                  "Draft"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-200 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
            >

              {creating &&
              formData.status === "Draft" ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              Save Draft

            </button>

            {/* PUBLISH */}
            <button
              type="button"
              disabled={creating}
              onClick={(event) =>
                handleSubmit(
                  event,
                  "Published"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1769e0] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#2878ed] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >

              {creating &&
              formData.status ===
                "Published" ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Send size={17} />
              )}

              Publish

            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateAnnouncement;