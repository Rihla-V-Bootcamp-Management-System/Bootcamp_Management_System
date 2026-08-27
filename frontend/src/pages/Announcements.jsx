import { useEffect, useState } from "react";
import {
  Megaphone,
  CalendarDays,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

function Announcements() {
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ANNOUNCEMENTS
  // =====================================================

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/announcements");

      setAnnouncements(
        Array.isArray(response.data.announcements)
          ? response.data.announcements
          : []
      );
    } catch (err) {
      console.error("FETCH ANNOUNCEMENTS ERROR:", err);

      setError(
        err.response?.data?.message ||
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
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Not specified";

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
    if (!date) return "Not specified";

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
  // OPEN ANNOUNCEMENT DETAIL
  // =====================================================

  const handleViewDetails = (announcementId) => {
    if (!announcementId) return;

    navigate(`/announcements/${announcementId}`);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />

          <span className="text-sm">
            Loading announcements...
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
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />

          <p className="text-sm font-medium">
            {error}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnnouncements}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071629] text-white">
            <Megaphone size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Announcements
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with the latest bootcamp announcements.
            </p>
          </div>

        </div>
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Megaphone
              size={24}
              className="text-slate-500"
            />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-800">
            No announcements
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            New announcements will appear here.
          </p>

        </div>
      ) : (

        /* =================================================
           ANNOUNCEMENTS
        ================================================= */

        <div className="space-y-4">

          {announcements.map((announcement) => (

            <article
              key={announcement._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >

              {/* =========================================
                  ANNOUNCEMENT HEADER
              ========================================= */}

              <div className="p-5">

                <div className="flex items-start gap-4">

                  {/* ICON */}

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#071629] text-white">
                    <Megaphone size={19} />
                  </div>

                  {/* TITLE */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-lg font-bold text-slate-900">
                        {announcement.title}
                      </h2>

                      {announcement.type && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {announcement.type}
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Published{" "}
                      {formatDateTime(
                        announcement.publishDate
                      )}
                    </p>

                  </div>

                </div>

                {/* =======================================
                    CONTENT PREVIEW
                ======================================= */}

                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {announcement.content}
                  </p>

                </div>

                {/* =======================================
                    EVENT INFORMATION
                ======================================= */}

                {(announcement.eventDate ||
                  announcement.startTime ||
                  announcement.endTime) && (

                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">

                    {announcement.eventDate && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">

                        <CalendarDays
                          size={16}
                        />

                        <span>
                          {formatDate(
                            announcement.eventDate
                          )}
                        </span>

                      </div>
                    )}

                    {(announcement.startTime ||
                      announcement.endTime) && (

                      <div className="flex items-center gap-2 text-sm text-slate-600">

                        <Clock size={16} />

                        <span>
                          {announcement.startTime || ""}

                          {announcement.startTime &&
                          announcement.endTime
                            ? " - "
                            : ""}

                          {announcement.endTime || ""}
                        </span>

                      </div>
                    )}

                  </div>
                )}

                {/* =======================================
                    AUTHOR
                ======================================= */}

                {announcement.authorId && (
                  <div className="mt-5">

                    <p className="text-xs text-slate-400">
                      Posted by{" "}

                      <span className="font-semibold text-slate-600">
                        {announcement.authorId.name ||
                          "Bootcamp Administration"}
                      </span>
                    </p>

                  </div>
                )}

              </div>

              {/* =========================================
                  FOOTER / VIEW DETAILS
              ========================================= */}

              <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center">

                <p className="text-xs text-slate-400">
                  View the complete announcement for
                  more information.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handleViewDetails(
                      announcement._id
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#071629] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10243d]"
                >
                  View Details

                  <ChevronRight size={16} />
                </button>

              </div>

            </article>

          ))}

        </div>
      )}

    </div>
  );
}

export default Announcements;