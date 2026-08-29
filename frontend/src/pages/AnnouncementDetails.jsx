import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Megaphone,
  CalendarDays,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Users,
  Link as LinkIcon,
  Tag,
} from "lucide-react";
import apiClient from "../services/apiClient";

function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ANNOUNCEMENT DETAIL
  // =====================================================

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      setError("");

      if (!id) {
        setError("Announcement ID is missing.");
        return;
      }

      const response = await apiClient.get(
        `/announcements/${id}`
      );

      const data = response.data;

      if (!data?.announcement) {
        setError("Announcement not found.");
        return;
      }

      setAnnouncement(data.announcement);
    } catch (err) {
      console.error(
        "FETCH ANNOUNCEMENT DETAIL ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load announcement."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

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

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =====================================================
  // DATE + TIME FORMAT
  // =====================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // RECIPIENT FORMAT
  // =====================================================

  const formatRecipients = (recipients) => {
    if (!Array.isArray(recipients)) {
      return "All eligible users";
    }

    if (recipients.length === 0) {
      return "All eligible users";
    }

    return recipients.join(", ");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2
            size={24}
            className="animate-spin"
          />

          <span className="text-sm">
            Loading announcement...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="space-y-5">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-white"
        >
          <ArrowLeft size={17} />
          Back to Announcements
        </button>

        {/* ERROR */}

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-3 text-red-700">

            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0"
            />

            <div>
              <h2 className="font-semibold">
                Unable to load announcement
              </h2>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={fetchAnnouncement}
            className="mt-5 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!announcement) {
    return (
      <div className="space-y-5">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-white"
        >
          <ArrowLeft size={17} />
          Back to Announcements
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-10 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-[#070e1b]">
            <Megaphone
              size={24}
              className="text-slate-400"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Announcement not found
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This announcement may have been removed
            or is no longer available.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-white"
      >
        <ArrowLeft size={17} />
        Back to Announcements
      </button>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="border-b border-slate-200 dark:border-[#15253f] p-6 sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

            {/* ICON */}

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1f6f5b] hover:bg-[#185848] text-white shadow-sm">
              <Megaphone size={25} />
            </div>

            {/* TITLE AREA */}

            <div className="min-w-0 flex-1">

              {/* BADGES */}

              <div className="flex flex-wrap items-center gap-2">

                {announcement.type && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-[#070e1b] px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Tag size={13} />
                    {announcement.type}
                  </span>
                )}

                {announcement.status && (
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      announcement.status ===
                      "Published"
                        ? "bg-green-50 text-green-700"
                        : announcement.status ===
                          "Scheduled"
                        ? "bg-[#e5f1ed] text-[#185848]"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {announcement.status}
                  </span>
                )}

              </div>

              {/* TITLE */}

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {announcement.title}
              </h1>

              {/* PUBLISHED DATE */}

              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Published{" "}
                {formatDateTime(
                  announcement.publishDate ||
                    announcement.createdAt
                )}
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-6 sm:p-8">

          <div className="rounded-2xl bg-slate-50 dark:bg-[#070e1b] p-5 sm:p-6">

            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-base">
              {announcement.content}
            </p>

          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="mt-8">

            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Announcement Information
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              {/* EVENT DATE */}

              <div className="rounded-xl border border-slate-200 dark:border-[#15253f] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#070e1b] text-slate-600 dark:text-slate-300">
                    <CalendarDays size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-slate-400">
                      Event Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {announcement.eventDate
                        ? formatDate(
                            announcement.eventDate
                          )
                        : "No event date"}
                    </p>

                  </div>

                </div>

              </div>

              {/* EVENT TIME */}

              <div className="rounded-xl border border-slate-200 dark:border-[#15253f] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#070e1b] text-slate-600 dark:text-slate-300">
                    <Clock size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-slate-400">
                      Event Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {announcement.startTime ||
                      announcement.endTime
                        ? `${announcement.startTime || ""}${
                            announcement.startTime &&
                            announcement.endTime
                              ? " - "
                              : ""
                          }${
                            announcement.endTime ||
                            ""
                          }`
                        : "No event time"}
                    </p>

                  </div>

                </div>

              </div>

              {/* RECIPIENTS */}

              <div className="rounded-xl border border-slate-200 dark:border-[#15253f] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#070e1b] text-slate-600 dark:text-slate-300">
                    <Users size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-slate-400">
                      Recipients
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {formatRecipients(
                        announcement.recipients
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* AUTHOR */}

              <div className="rounded-xl border border-slate-200 dark:border-[#15253f] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#070e1b] text-slate-600 dark:text-slate-300">
                    <Megaphone size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-slate-400">
                      Posted By
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {announcement.authorId?.name ||
                        "Bootcamp Administration"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ATTACHED LINK
          ================================================= */}

          {announcement.activeLink && (
            <div className="mt-8">

              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Related Link
              </h2>

              <div className="mt-4 rounded-xl border border-slate-200 dark:border-[#15253f] p-4">

                <a
                  href={announcement.activeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10243d]"
                >
                  <LinkIcon size={16} />

                  Open Attached Link

                  <ExternalLink size={15} />
                </a>

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="border-t border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b]/70 px-6 py-4 sm:px-8">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Announcement ID:{" "}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {announcement._id}
              </span>
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:bg-[#070e1b]"
            >
              <ArrowLeft size={16} />
              Back
            </button>

          </div>

        </div>

      </article>

    </div>
  );
}

export default AnnouncementDetail;