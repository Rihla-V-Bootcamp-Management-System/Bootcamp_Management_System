import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  Users,
  UserRound,
  GraduationCap,
  ShieldCheck,
  Trophy,
  Mic2,
  BriefcaseBusiness,
  Code2,
  PartyPopper,
  Clock3,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  MapPin,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

function CreateSpecialAnnouncement() {
  const navigate = useNavigate();

  const [creating, setCreating] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [batches, setBatches] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    eventType: "Special Event",
    recipients: [],
    batchId: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    activeLink: "",
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
          response.data.batches ||
          response.data.data ||
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
  // SPECIAL EVENT TYPES
  // =========================================================

  const eventTypes = [
    {
      value: "Special Event",
      label: "Special Event",
      description: "Important bootcamp-wide events",
      icon: PartyPopper,
    },
    {
      value: "Competition",
      label: "Competition",
      description: "Contests, hackathons and challenges",
      icon: Trophy,
    },
    {
      value: "Guest Speaker",
      label: "Guest Speaker",
      description: "Guest talks and professional sessions",
      icon: Mic2,
    },
    {
      value: "Career Event",
      label: "Career Event",
      description: "Career and professional development",
      icon: BriefcaseBusiness,
    },
    {
      value: "Hackathon",
      label: "Hackathon",
      description: "Coding and project competitions",
      icon: Code2,
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
  // EVENT TYPE
  // =========================================================

  const handleEventTypeChange = (eventType) => {
    setFormData((previous) => ({
      ...previous,
      eventType,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================================
  // RECIPIENT
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
          : [...previous.recipients, recipient],
      };
    });

    setError("");
    setSuccess("");
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Please enter the special event title.";
    }

    if (!formData.content.trim()) {
      return "Please write the special event announcement.";
    }

    if (!formData.eventType) {
      return "Please select an event type.";
    }

    if (formData.recipients.length === 0) {
      return "Please select at least one recipient.";
    }

    if (!formData.batchId) {
      return "Please select a batch.";
    }

    if (!formData.eventDate) {
      return "Please select the event date.";
    }

    if (!formData.startTime) {
      return "Please select the event start time.";
    }

    if (
      formData.endTime &&
      formData.endTime <= formData.startTime
    ) {
      return "End time must be later than the start time.";
    }

    // Location is OPTIONAL.
    // No validation is required here.

    if (
      formData.status === "Scheduled" &&
      !formData.publishDate
    ) {
      return "Please select a publish date for the scheduled announcement.";
    }

    if (
      formData.status === "Scheduled" &&
      formData.publishDate &&
      new Date(formData.publishDate) <= new Date()
    ) {
      return "Scheduled publish date must be in the future.";
    }

    // Active link is optional.
    // Validate it only when the user enters something.
    if (
      formData.activeLink &&
      !/^https?:\/\/.+/i.test(formData.activeLink)
    ) {
      return "Please enter a valid link beginning with http:// or https://.";
    }

    return "";
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setCreating(true);

      const payload = {
        title: formData.title.trim(),

        content: formData.content.trim(),

        // Special announcement identifier
        type: "Special Event",

        eventType: formData.eventType,

        recipients: formData.recipients,

        batchId: formData.batchId,

        eventDate: formData.eventDate || null,

        startTime: formData.startTime || null,

        endTime: formData.endTime || null,

        // LOCATION IS OPTIONAL
        location: formData.location.trim() || null,

        // ACTIVE LINK IS OPTIONAL
        activeLink: formData.activeLink.trim() || null,

        publishDate:
          formData.status === "Scheduled"
            ? formData.publishDate
            : formData.status === "Published"
            ? new Date().toISOString()
            : null,

        status: formData.status,

        // Allows backend/frontend to distinguish
        // special announcements from normal announcements.
        isSpecial: true,
      };

      await apiClient.post(
        "/announcements",
        payload
      );

      setSuccess(
        formData.status === "Published"
          ? "Special announcement published successfully."
          : formData.status === "Scheduled"
          ? "Special announcement scheduled successfully."
          : "Special announcement saved as draft."
      );

      setTimeout(() => {
        navigate("/admin/announcements");
      }, 1200);
    } catch (error) {
      console.error(
        "CREATE SPECIAL ANNOUNCEMENT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create special announcement."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getRecipientLabel = (value) => {
    const recipient = recipientOptions.find(
      (item) => item.value === value
    );

    return recipient?.label || value;
  };

  const selectedEventType = eventTypes.find(
    (item) => item.value === formData.eventType
  );

  const selectedBatch = batches.find(
    (batch) => batch._id === formData.batchId
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">
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
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-white"
          >
            <ArrowLeft size={17} />
            Back to Announcements
          </button>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1f6f5b] hover:bg-[#185848] text-white shadow-lg shadow-slate-200">
                <PartyPopper size={25} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                    Create Special Announcement
                  </h1>

                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Special Event
                  </span>
                </div>

                <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                  Create and publish an important special
                  event announcement for your bootcamp
                  community.
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
                Unable to create special announcement
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

        <form onSubmit={handleSubmit}>

          {/* =================================================
              MAIN CONTENT + PUBLISHING
          ================================================= */}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

            {/* =================================================
                LEFT — CONTENT
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">
              <div className="border-b border-slate-100 dark:border-[#15253f] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#070e1b] text-slate-900 dark:text-white">
                    <FileText size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#0F172A]">
                      Special Event Content
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Write the important information
                      about the special event.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">

                {/* TITLE */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
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
                    placeholder="e.g. Annual Bootcamp Hackathon 2026"
                    className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-slate-300 dark:border-[#15253f] focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                {/* EVENT TYPE */}

                <div>
                  <div className="mb-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Event Type
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Select the type of special event.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
                    {eventTypes.map((eventType) => {
                      const Icon = eventType.icon;

                      const selected =
                        formData.eventType ===
                        eventType.value;

                      return (
                        <button
                          key={eventType.value}
                          type="button"
                          onClick={() =>
                            handleEventTypeChange(
                              eventType.value
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
                                  ? "bg-[#1f6f5b] hover:bg-[#185848] text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                              }`}
                            >
                              <Icon size={17} />
                            </div>

                            <div
                              className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[#071629] bg-[#1f6f5b] hover:bg-[#185848]"
                                  : "border-slate-300"
                              }`}
                            >
                              {selected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#0b1528]" />
                              )}
                            </div>
                          </div>

                          <p className="mt-3 text-xs font-semibold text-slate-900 dark:text-white">
                            {eventType.label}
                          </p>

                          <p className="mt-1 hidden text-[10px] leading-4 text-slate-500 dark:text-slate-400 xl:block">
                            {eventType.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* MESSAGE */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
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
                    placeholder="Write the full special event announcement here..."
                    className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full resize-none rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-3.5 text-sm leading-6 text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Include important information such as
                    event purpose, requirements,
                    instructions, and what participants
                    should prepare.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                RIGHT — PUBLISHING
            ================================================= */}

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">
                <div className="border-b border-slate-100 dark:border-[#15253f] px-5 py-5">
                  <h2 className="font-semibold text-[#0F172A]">
                    Publishing
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Decide when this special announcement
                    becomes visible.
                  </p>
                </div>

                <div className="space-y-5 p-5">

                  {/* STATUS */}

                  <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
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
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData(
                                (previous) => ({
                                  ...previous,
                                  status:
                                    option.value,
                                })
                              )
                            }
                            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                              selected
                                ? "border-[#071629] bg-slate-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[#071629] bg-[#1f6f5b] hover:bg-[#185848]"
                                  : "border-slate-300"
                              }`}
                            >
                              {selected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#0b1528]" />
                              )}
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {option.label}
                              </p>

                              <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                                {option.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SCHEDULE DATE */}

                  {formData.status === "Scheduled" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Publish date
                      </label>

                      <input
                        type="datetime-local"
                        name="publishDate"
                        value={formData.publishDate}
                        onChange={handleChange}
                        className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-3 py-3 text-sm outline-none focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                      />
                    </div>
                  )}

                  {/* SUMMARY */}

                  <div className="border-t border-slate-100 dark:border-[#15253f] pt-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Summary
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Event type
                        </span>

                        <span className="rounded-full bg-slate-100 dark:bg-[#070e1b] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {selectedEventType?.label ||
                            "Not selected"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Batch
                        </span>

                        <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {selectedBatch?.name ||
                            "Not selected"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Event date
                        </span>

                        <span className="text-right text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {formData.eventDate
                            ? new Date(
                                `${formData.eventDate}T00:00:00`
                              ).toLocaleDateString()
                            : "Not set"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Location
                        </span>

                        <span className="max-w-[180px] truncate text-right text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {formData.location ||
                            "Not set"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Recipients
                        </span>

                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {formData.recipients.length ===
                          0
                            ? "None"
                            : `${formData.recipients.length} group${
                                formData.recipients.length >
                                1
                                  ? "s"
                                  : ""
                              }`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* QUICK INFO */}

              <div className="rounded-2xl border border-slate-200 dark:border-[#15253f] bg-[#1f6f5b] hover:bg-[#185848] p-5 text-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#0b1528]/10">
                    <PartyPopper size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Special event tip
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      Make the event date, time,
                      location, and required actions
                      clear so participants know
                      exactly what to expect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              AUDIENCE
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">
            <div className="border-b border-slate-100 dark:border-[#15253f] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#070e1b] text-slate-900 dark:text-white">
                  <Users size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#0F172A]">
                    Audience
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Who should receive this special
                    event announcement?
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {recipientOptions.map(
                  (recipient) => {
                    const Icon = recipient.icon;

                    const selected =
                      formData.recipients.includes(
                        recipient.value
                      );

                    return (
                      <button
                        key={recipient.value}
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
                          <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#1f6f5b] hover:bg-[#185848] text-white">
                            <CheckCircle2 size={15} />
                          </div>
                        )}

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            selected
                              ? "bg-[#1f6f5b] hover:bg-[#185848] text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon size={21} />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                          {recipient.label}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {recipient.description}
                        </p>

                        <div className="mt-4 text-xs font-semibold">
                          {selected ? (
                            <span className="text-slate-900 dark:text-white">
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

              {formData.recipients.length > 0 && (
                <div className="mt-5 rounded-xl bg-slate-50 dark:bg-[#070e1b] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Selected:
                    </span>

                    {formData.recipients.map(
                      (recipient) => (
                        <span
                          key={recipient}
                          className="rounded-full bg-white dark:bg-[#0b1528] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm ring-1 ring-slate-200"
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
              EVENT DETAILS
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">
            <div className="border-b border-slate-100 dark:border-[#15253f] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#070e1b] text-slate-900 dark:text-white">
                  <Calendar size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#0F172A]">
                    Event Details
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Add the batch, date, time, optional
                    location, and optional resource.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">

              {/* BATCH */}

              <div className="mb-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
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
                  className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-4 py-3.5 text-sm outline-none transition hover:border-slate-300 dark:border-[#15253f] focus:border-[#071629] focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 dark:bg-[#070e1b]"
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
                  This special announcement will be
                  associated with the selected batch.
                </p>
              </div>

              {/* DATE + START + END */}

              <div className="grid gap-5 md:grid-cols-3">

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Calendar size={15} />
                    Event date
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-3.5 text-sm outline-none transition hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Clock3 size={15} />
                    Start time
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-3.5 text-sm outline-none transition hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
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
                    className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-3.5 text-sm outline-none transition hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* LOCATION — OPTIONAL */}

              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <MapPin size={15} />
                  Location
                  <span className="font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. ASTU Innovation Center"
                  className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  You can leave this empty if the event
                  does not have a physical location.
                </p>
              </div>

              {/* LINK */}

              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
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
                  className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#071629] focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 dark:bg-[#070e1b] px-4 py-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Special event information:
                </span>{" "}
                The event date and start time are required
                so participants can clearly see when the
                event takes place.
              </div>
            </div>
          </section>

          {/* =================================================
              BOTTOM ACTION BAR
          ================================================= */}

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-end">

            {/* CANCEL */}

            <button
              type="button"
              disabled={creating}
              onClick={() =>
                navigate("/admin/announcements")
              }
              className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-[#070e1b] disabled:opacity-50"
            >
              Cancel
            </button>

            {/* SAVE DRAFT */}

            <button
              type="button"
              disabled={creating}
              onClick={() => {
                setFormData((previous) => ({
                  ...previous,
                  status: "Draft",
                }));

                setTimeout(() => {
                  document
                    .querySelector("form")
                    ?.requestSubmit();
                }, 0);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white transition hover:bg-slate-50 dark:bg-[#070e1b] disabled:cursor-not-allowed disabled:opacity-60"
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
              type="submit"
              disabled={creating}
              onClick={() => {
                setFormData((previous) => ({
                  ...previous,
                  status: "Published",
                }));
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f6f5b] hover:bg-[#185848] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f6f5b] hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Send size={17} />
              )}

              Publish Special Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSpecialAnnouncement;