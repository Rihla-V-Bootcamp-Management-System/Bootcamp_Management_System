import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Megaphone,
  Plus,
  Calendar,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  Tag,
  Users,
  Trash2,
  Send,
  FileText,
  Clock,
  Trophy,
  MessageCircle,
  ChevronRight,
  X,
  Eye,
  CheckCircle2,
  CircleDot,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

function AdminAnnouncements() {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // FILTER
  const [statusFilter, setStatusFilter] = useState("All");

  // SPECIAL EVENT FILTER
  const [specialFilter, setSpecialFilter] = useState("All");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 5;

  // DETAILS MODAL
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState(null);

  // =====================================================
  // LOAD ANNOUNCEMENTS
  // =====================================================

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/announcements/mine"
      );

      setAnnouncements(
        Array.isArray(response.data.announcements)
          ? response.data.announcements
          : []
      );
    } catch (error) {
      console.error(
        "FETCH ANNOUNCEMENTS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // =====================================================
  // DELETE DRAFT ONLY
  // =====================================================

  const handleDelete = async (id) => {
    const announcement = announcements.find(
      (item) => item._id === id
    );

    if (
      !announcement ||
      announcement.status !== "Draft"
    ) {
      setError(
        "Only draft announcements can be deleted."
      );
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      await apiClient.delete(
        `/announcements/${id}`
      );

      setAnnouncements((previous) =>
        previous.filter(
          (announcement) =>
            announcement._id !== id
        )
      );

      setSelectedAnnouncement(null);
      toast.success("Draft announcement deleted successfully");
    } catch (error) {
      console.error(
        "DELETE ANNOUNCEMENT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete draft."
      );
      toast.error(error.response?.data?.message || "Failed to delete draft.");
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // PUBLISH
  // =====================================================

  const handlePublish = async (id) => {
    const announcement = announcements.find(
      (item) => item._id === id
    );

    if (
      !announcement ||
      announcement.status === "Published"
    ) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      const response = await apiClient.post(
        `/announcements/${id}/publish`
      );
      toast.success("Announcement published successfully!");

      const updated =
        response.data.announcement;

      setAnnouncements((previous) =>
        previous.map((announcement) =>
          announcement._id === id
            ? updated
            : announcement
        )
      );

      setSelectedAnnouncement(updated);
    } catch (error) {
      console.error(
        "PUBLISH ANNOUNCEMENT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to publish announcement."
      );
    } finally {
      setActionLoading("");
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // RELATIVE TIME
  // =====================================================

  const getRelativeTime = (date) => {
    if (!date) {
      return "";
    }

    const difference =
      new Date().getTime() -
      new Date(date).getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }

    return formatDate(date);
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const statusStyle = (status) => {
    if (status === "Published") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === "Scheduled") {
      return "border-blue-200 bg-[#e5f1ed] text-[#185848]";
    }

    return "border-slate-200 bg-slate-100 text-slate-600";
  };

  // =====================================================
  // TYPE ICON
  // =====================================================

  const getTypeIcon = (type) => {
    if (type === "Contest") {
      return Trophy;
    }

    if (type === "Experience Sharing") {
      return MessageCircle;
    }

    return Tag;
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const publishedCount = announcements.filter(
    (item) => item.status === "Published"
  ).length;

  const scheduledCount = announcements.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const draftCount = announcements.filter(
    (item) => item.status === "Draft"
  ).length;

  // =====================================================
  // FILTERED ANNOUNCEMENTS
  // =====================================================

  const filteredAnnouncements = useMemo(() => {
    if (statusFilter === "All") {
      return announcements;
    }

    return announcements.filter(
      (announcement) =>
        announcement.status === statusFilter
    );
  }, [
    announcements,
    statusFilter,
  ]);

  // =====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAnnouncements.length /
        announcementsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    announcementsPerPage;

  const endIndex =
    startIndex +
    announcementsPerPage;

  const paginatedAnnouncements =
    filteredAnnouncements.slice(
      startIndex,
      endIndex
    );

  const handlePreviousPage = () => {
    setCurrentPage((previous) =>
      Math.max(previous - 1, 1)
    );
  };

  const handleNextPage = () => {
    setCurrentPage((previous) =>
      Math.min(
        previous + 1,
        totalPages
      )
    );
  };

  // =====================================================
  // CLICKABLE STATUS COUNTER
  // =====================================================

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // =====================================================
  // RECENT ACTIVITY
  // =====================================================

  const recentAnnouncements = useMemo(() => {
    return [...announcements]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      )
      .slice(0, 3);
  }, [announcements]);

  // =====================================================
  // SPECIAL EVENTS
  // =====================================================

  const specialEvents = useMemo(() => {
    return announcements.filter(
      (announcement) =>
        announcement.type === "Contest" ||
        announcement.type ===
          "Experience Sharing"
    );
  }, [announcements]);

  const contestCount = specialEvents.filter(
    (event) => event.type === "Contest"
  ).length;

  const experienceSharingCount =
    specialEvents.filter(
      (event) =>
        event.type ===
        "Experience Sharing"
    ).length;

  const filteredSpecialEvents =
    specialFilter === "All"
      ? specialEvents
      : specialEvents.filter(
          (event) =>
            event.type === specialFilter
        );

  // =====================================================
  // CREATE SPECIAL EVENT
  // =====================================================

  const handleCreateSpecialEvent = () => {
    navigate(
      "/admin/announcements/create-special-event"
    );
  };

  // =====================================================
  // STATUS COUNTER COMPONENT
  // =====================================================

  const StatusCard = ({
    label,
    count,
    icon: Icon,
    status,
    iconClass,
  }) => {
    const isActive =
      statusFilter === status;

    return (
      <button
        type="button"
        onClick={() =>
          handleStatusFilter(status)
        }
        className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition dark:bg-[#0b1528] ${
          isActive
            ? "border-[#1f6f5b] ring-2 ring-emerald-500/20 dark:border-emerald-400"
            : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#15253f]"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={20} />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {count}
            </p>
          </div>
        </div>
      </button>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-blue-950/60 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50">
            <Megaphone size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Announcements
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage updates, events, sessions, deadlines, and important information.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/announcements/create"
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#185848] active:scale-[0.98]"
        >
          <Plus size={18} />
          Create Announcement
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          CLICKABLE STATISTICS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatusCard
          label="Total"
          count={announcements.length}
          icon={Megaphone}
          status="All"
          iconClass="bg-slate-100 text-slate-900 dark:text-white"
        />

        <StatusCard
          label="Published"
          count={publishedCount}
          icon={CheckCircle2}
          status="Published"
          iconClass="bg-green-50 text-green-600"
        />

        <StatusCard
          label="Scheduled"
          count={scheduledCount}
          icon={Clock}
          status="Scheduled"
          iconClass="bg-[#e5f1ed] text-[#1f6f5b]"
        />

        <StatusCard
          label="Drafts"
          count={draftCount}
          icon={FileText}
          status="Draft"
          iconClass="bg-slate-100 text-slate-600"
        />

      </div>

      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      {!loading &&
        recentAnnouncements.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#15253f] px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Recent Activity
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Your latest announcement activity.
                </p>
              </div>

              <Clock
                size={19}
                className="text-slate-400"
              />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#15253f]">

              {recentAnnouncements.map(
                (announcement) => {
                  const ActivityIcon =
                    announcement.status ===
                    "Published"
                      ? CheckCircle2
                      : announcement.status ===
                        "Scheduled"
                      ? Clock
                      : FileText;

                  return (
                    <button
                      key={announcement._id}
                      type="button"
                      onClick={() =>
                        setSelectedAnnouncement(
                          announcement
                        )
                      }
                      className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50 dark:bg-[#070e1b]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#070e1b] text-slate-600 dark:text-slate-300">
                        <ActivityIcon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {announcement.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {announcement.status ===
                          "Published"
                            ? "Published"
                            : announcement.status ===
                              "Scheduled"
                            ? "Scheduled"
                            : "Saved as draft"}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-slate-400">
                        {getRelativeTime(
                          announcement.updatedAt ||
                            announcement.createdAt
                        )}
                      </span>

                      <ChevronRight
                        size={17}
                        className="text-slate-400"
                      />
                    </button>
                  );
                }
              )}

            </div>
          </section>
        )}

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

        {/* =============================================
            ANNOUNCEMENT HISTORY
        ============================================= */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

          {/* HISTORY HEADER */}

          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 dark:border-[#15253f] px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {statusFilter === "All"
                  ? "Announcement History"
                  : `${statusFilter} Announcements`}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {filteredAnnouncements.length}{" "}
                announcement
                {filteredAnnouncements.length !== 1
                  ? "s"
                  : ""}{" "}
                found.
              </p>
            </div>

            {statusFilter !== "All" && (
              <button
                type="button"
                onClick={() =>
                  handleStatusFilter("All")
                }
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-white"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2
                size={24}
                className="animate-spin"
              />
              Loading announcements...
            </div>
          ) : filteredAnnouncements.length === 0 ? (

            /* EMPTY */

            <div className="flex min-h-[400px] flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#070e1b] text-slate-400">
                <Megaphone size={30} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                No announcements found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                There are no announcements in
                this category yet.
              </p>

              {statusFilter === "All" && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/admin/announcements/create"
                    )
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1f6f5b] hover:bg-[#185848] px-5 py-3 text-sm font-semibold text-white"
                >
                  <Plus size={18} />
                  Create Announcement
                </button>
              )}

            </div>
          ) : (

            <>
              {/* =========================================
                  ANNOUNCEMENT CARDS
              ========================================= */}

              <div className="divide-y divide-slate-100 dark:divide-[#15253f]">

                {paginatedAnnouncements.map(
                  (announcement) => {
                    const TypeIcon =
                      getTypeIcon(
                        announcement.type
                      );

                    const isDraft =
                      announcement.status ===
                      "Draft";

                    const canPublish =
                      announcement.status !==
                      "Published";

                    const preview =
                      announcement.content?.length >
                      180
                        ? `${announcement.content.slice(
                            0,
                            180
                          )}...`
                        : announcement.content;

                    return (
                      <article
                        key={announcement._id}
                        className="p-6 transition hover:bg-slate-50 dark:bg-[#070e1b]/70"
                      >

                        <div className="flex flex-col gap-4">

                          {/* TOP */}

                          <div className="flex flex-col justify-between gap-4 lg:flex-row">

                            <div className="min-w-0 flex-1">

                              {/* BADGES */}

                              <div className="flex flex-wrap items-center gap-2">

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                    announcement.type ===
                                    "Contest"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : announcement.type ===
                                        "Experience Sharing"
                                      ? "border-violet-200 bg-violet-50 text-violet-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600"
                                  }`}
                                >
                                  <TypeIcon
                                    size={12}
                                  />

                                  {
                                    announcement.type
                                  }
                                </span>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(
                                    announcement.status
                                  )}`}
                                >
                                  {
                                    announcement.status
                                  }
                                </span>

                              </div>

                              {/* TITLE */}

                              <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                                {
                                  announcement.title
                                }
                              </h3>

                              {/* SHORT PREVIEW */}

                              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {preview}
                              </p>

                              {/* VIEW DETAILS */}

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedAnnouncement(
                                    announcement
                                  )
                                }
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1f6f5b] hover:text-[#185848] dark:text-blue-400 dark:hover:text-blue-300 transition hover:underline"
                              >
                                <Eye size={16} />
                                View Details
                                <ChevronRight
                                  size={16}
                                />
                              </button>

                            </div>

                            {/* ACTIONS */}

                            <div className="flex shrink-0 items-start gap-2">

                              {canPublish && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePublish(
                                      announcement._id
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    announcement._id
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#10243d] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {actionLoading ===
                                  announcement._id ? (
                                    <Loader2
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Send
                                      size={15}
                                    />
                                  )}

                                  Publish
                                </button>
                              )}

                              {/* DELETE ONLY DRAFT */}

                              {isDraft && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      announcement._id
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    announcement._id
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  title="Delete draft"
                                >
                                  <Trash2
                                    size={16}
                                  />
                                </button>
                              )}

                            </div>
                          </div>

                          {/* META */}

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">

                            <span className="inline-flex items-center gap-1.5">
                              <Calendar
                                size={14}
                              />

                              {announcement.eventDate
                                ? formatDate(
                                    announcement.eventDate
                                  )
                                : "No event date"}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Users size={14} />

                              {announcement.recipients?.join(
                                ", "
                              ) ||
                                "No recipients"}
                            </span>

                            <span>
                              Created{" "}
                              {formatDate(
                                announcement.createdAt
                              )}
                            </span>

                          </div>

                        </div>
                      </article>
                    );
                  }
                )}

              </div>

              {/* =========================================
                  PAGINATION
              ========================================= */}

              {filteredAnnouncements.length >
                announcementsPerPage && (
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-[#15253f] px-6 py-4 sm:flex-row">

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing{" "}
                    {startIndex + 1}–
                    {Math.min(
                      endIndex,
                      filteredAnnouncements.length
                    )}{" "}
                    of{" "}
                    {
                      filteredAnnouncements.length
                    }
                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={
                        handlePreviousPage
                      }
                      disabled={
                        safeCurrentPage === 1
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#15253f] text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-[#070e1b] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft
                        size={17}
                      />
                    </button>

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) => {
                        const page =
                          index + 1;

                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() =>
                              setCurrentPage(
                                page
                              )
                            }
                            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                              safeCurrentPage ===
                              page
                                ? "bg-[#1f6f5b] text-white"
                                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#185848]"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    <button
                      type="button"
                      onClick={
                        handleNextPage
                      }
                      disabled={
                        safeCurrentPage ===
                        totalPages
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#15253f] text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-[#070e1b] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRightIcon
                        size={17}
                      />
                    </button>

                  </div>
                </div>
              )}

            </>
          )}
        </section>

        {/* =============================================
            SPECIAL EVENTS SIDEBAR
        ============================================= */}

        <aside className="sticky top-6 space-y-5">

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

            {/* HEADER */}

            <div className="border-b border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b]/70 px-5 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-blue-950/60 dark:text-blue-400 shadow-xs">
                  <Trophy size={19} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Special Events
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Contests and experience-sharing
                    events.
                  </p>
                </div>

              </div>
            </div>

            {/* FILTERS */}

            <div className="p-3">

              <button
                type="button"
                onClick={() =>
                  setSpecialFilter("All")
                }
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                  specialFilter === "All"
                    ? "bg-[#1f6f5b] text-white shadow-xs font-semibold"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#185848]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Megaphone size={15} />

                  <span className="text-sm font-semibold">
                    All Special Events
                  </span>
                </span>

                <span className="text-sm font-bold">
                  {specialEvents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSpecialFilter(
                    "Contest"
                  )
                }
                className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                  specialFilter === "Contest"
                    ? "bg-amber-50 text-amber-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Trophy size={15} />

                  <span className="text-sm font-medium">
                    Contest
                  </span>
                </span>

                <span className="text-sm font-bold">
                  {contestCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSpecialFilter(
                    "Experience Sharing"
                  )
                }
                className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                  specialFilter ===
                  "Experience Sharing"
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <MessageCircle
                    size={15}
                  />

                  <span className="text-sm font-medium">
                    Experience Sharing
                  </span>
                </span>

                <span className="text-sm font-bold">
                  {
                    experienceSharingCount
                  }
                </span>
              </button>

            </div>

            {/* CREATE SPECIAL EVENT */}

            <div className="border-t border-slate-200 dark:border-[#15253f] p-4">

              <button
                type="button"
                onClick={
                  handleCreateSpecialEvent
                }
                className="group w-full rounded-2xl bg-linear-to-r from-[#1f6f5b] to-[#145243] p-5 text-left text-white shadow-md transition hover:from-[#185848] hover:to-[#0f3d32] active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-xs">
                    <Plus size={19} />
                  </div>

                  <ChevronRight
                    size={19}
                    className="text-white/50 group-hover:text-white"
                  />

                </div>

                <h3 className="mt-5 text-sm font-bold">
                  Create Special Event
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Create a contest or an
                  experience-sharing event.
                </p>

              </button>

            </div>
          </section>

          {/* SPECIAL EVENT LIST */}

          <section className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Special Events
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {
                    filteredSpecialEvents.length
                  }
                </p>
              </div>

              <Trophy
                size={20}
                className="text-slate-500 dark:text-slate-400"
              />

            </div>

            <div className="mt-4 space-y-2">

              {filteredSpecialEvents
                .slice(0, 4)
                .map((event) => {
                  const EventIcon =
                    getTypeIcon(event.type);

                  return (
                    <button
                      key={event._id}
                      type="button"
                      onClick={() =>
                        setSelectedAnnouncement(
                          event
                        )
                      }
                      className="flex w-full items-start gap-3 rounded-xl border border-slate-100 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-3 text-left transition hover:bg-slate-100 dark:bg-[#070e1b]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#0b1528] text-slate-600 dark:text-slate-300">
                        <EventIcon size={15} />
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {event.title}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {event.eventDate
                            ? formatDate(
                                event.eventDate
                              )
                            : "No event date"}
                        </p>

                      </div>
                    </button>
                  );
                })}

              {filteredSpecialEvents.length ===
                0 && (
                <p className="rounded-xl bg-slate-50 dark:bg-[#070e1b] px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No special events found.
                </p>
              )}

            </div>
          </section>

        </aside>
      </div>

      {/* ===============================================
          DETAILS MODAL
      =============================================== */}

      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-[#0b1528] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-[#15253f] p-6">

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(
                      selectedAnnouncement.status
                    )}`}
                  >
                    {
                      selectedAnnouncement.status
                    }
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {
                      selectedAnnouncement.type
                    }
                  </span>

                </div>

                <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                  {
                    selectedAnnouncement.title
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAnnouncement(
                    null
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:bg-[#070e1b] hover:text-slate-900 dark:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="p-6">

              <div className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-200">
                {
                  selectedAnnouncement.content
                }
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 dark:border-[#15253f] pt-5 text-sm text-slate-600 dark:text-slate-300">

                <div className="flex items-center gap-3">
                  <Calendar size={17} />

                  <span>
                    {selectedAnnouncement.eventDate
                      ? formatDate(
                          selectedAnnouncement.eventDate
                        )
                      : "No event date"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Users size={17} />

                  <span>
                    {selectedAnnouncement.recipients?.join(
                      ", "
                    ) ||
                      "No recipients"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={17} />

                  <span>
                    Created{" "}
                    {formatDate(
                      selectedAnnouncement.createdAt
                    )}
                  </span>
                </div>

                {selectedAnnouncement.activeLink && (
                  <a
                    href={
                      selectedAnnouncement.activeLink
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-semibold text-[#1f6f5b] hover:underline"
                  >
                    <LinkIcon size={16} />
                    Open attached link
                    <ExternalLink size={14} />
                  </a>
                )}

              </div>

              {/* MODAL ACTIONS */}

              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 dark:border-[#15253f] pt-5">

                {selectedAnnouncement.status !==
                  "Published" && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePublish(
                        selectedAnnouncement._id
                      )
                    }
                    disabled={
                      actionLoading ===
                      selectedAnnouncement._id
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1f6f5b] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#185848] disabled:opacity-60"
                  >
                    {actionLoading ===
                    selectedAnnouncement._id ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={16} />
                    )}

                    Publish
                  </button>
                )}

                {selectedAnnouncement.status ===
                  "Draft" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        selectedAnnouncement._id
                      )
                    }
                    disabled={
                      actionLoading ===
                      selectedAnnouncement._id
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Delete Draft
                  </button>
                )}

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnnouncements;
