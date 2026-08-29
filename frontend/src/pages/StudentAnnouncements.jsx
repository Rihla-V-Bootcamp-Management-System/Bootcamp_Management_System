import { useEffect, useState } from "react";

import {
  Megaphone,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import apiClient from "../services/apiClient";
import { getCurrentUserId } from "../utils/authUser";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentId = getCurrentUserId();

  // ============================================================
  // LOAD
  // ============================================================

  const loadAnnouncements = async () => {
    if (!studentId) {
      setError(
        "Student ID not found. Please login again."
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/announcements/student",
        {
          params: {
            studentId,
          },
        }
      );

      setAnnouncements(
        response.data?.announcements || []
      );
    } catch (err) {
      console.error(
        "Load student announcements error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load announcements"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [studentId]);

  // ============================================================
  // MARK READ
  // ============================================================

  const markAsRead = async (id) => {
    if (!studentId) return;

    try {
      await apiClient.patch(
        `/announcements/${id}/read`,
        {
          studentId,
        }
      );

      setAnnouncements((previous) =>
        previous.map((item) =>
          item._id === id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Mark announcement as read error:",
        err
      );
    }
  };

  // ============================================================
  // TYPE STYLE
  // ============================================================

  const getTypeStyle = (type) => {
    switch (type) {
      case "assignment":
        return {
          badge:
            "bg-blue-100 text-[#185848]",
          border:
            "border-l-blue-500",
        };

      case "attendance":
        return {
          badge:
            "bg-orange-100 text-orange-700",
          border:
            "border-l-orange-500",
        };

      case "progress":
        return {
          badge:
            "bg-green-100 text-green-700",
          border:
            "border-l-green-500",
        };

      case "custom":
        return {
          badge:
            "bg-purple-100 text-purple-700",
          border:
            "border-l-purple-500",
        };

      default:
        return {
          badge:
            "bg-slate-100 text-slate-700",
          border:
            "border-l-slate-400",
        };
    }
  };

  const unreadCount =
    announcements.filter(
      (item) => !item.isRead
    ).length;

  const [activeTab, setActiveTab] = useState("All");

  const filteredAnnouncements = announcements.filter((item) => {
    const role = (
      item.createdByRole ||
      item.creatorRole ||
      item.senderRole ||
      item.createdBy?.role ||
      ""
    ).toLowerCase();

    if (activeTab === "Admin") {
      return (
        role === "admin" ||
        role === "superadmin" ||
        item.isAdminAnnouncement === true
      );
    }
    if (activeTab === "Mentor") {
      return (
        role === "mentor" ||
        (!role.includes("admin") && item.isAdminAnnouncement !== true)
      );
    }
    return true;
  });

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}


        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="relative rounded-xl bg-[#1f6f5b] p-3 text-white">
              <Megaphone size={22} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Announcements
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Stay updated with announcements from your admins and mentors.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAnnouncements}
            className="flex items-center gap-2 rounded-lg bg-[#1f6f5b] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#185848]"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* TAB FILTERS (All vs Admin vs Mentor) */}

        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-[#15253f] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("All")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "All"
                ? "bg-[#1f6f5b] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            All Announcements ({announcements.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Admin")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "Admin"
                ? "bg-[#1f6f5b] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Admin Announcements
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Mentor")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "Mentor"
                ? "bg-[#1f6f5b] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Mentor Announcements
          </button>
        </div>

        {/* UNREAD */}

        {unreadCount > 0 && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-[#e5f1ed] p-4">
            <div className="rounded-lg bg-blue-100 p-2 text-[#185848]">
              <Megaphone size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-900">
                {unreadCount} new announcement
                {unreadCount !== 1
                  ? "s"
                  : ""}
              </p>

              <p className="text-xs text-[#185848]">
                Review the latest updates from
                your mentor.
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-12 text-center">
            <RefreshCw
              size={30}
              className="mx-auto mb-3 animate-spin text-gray-700 dark:text-slate-200"
            />


            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading announcements...
            </p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-12 text-center">
            <Megaphone
              size={40}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
              No {activeTab !== "All" ? activeTab : ""} announcements found
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeTab === "All"
                ? "You don't have any announcements yet."
                : `No ${activeTab.toLowerCase()} announcements match your filter.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map(
              (announcement) => {
                const style =
                  getTypeStyle(
                    announcement.type
                  );

                return (
                  <article
                    key={announcement._id}
                    onClick={() => {
                      if (
                        !announcement.isRead
                      ) {
                        markAsRead(
                          announcement._id
                        );
                      }
                    }}
                    className={`relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white p-6 shadow-sm transition hover:shadow-md ${style.border} ${
                      !announcement.isRead
                        ? "ring-1 ring-blue-100"
                        : ""
                    }`}
                  >
                    {/* UNREAD DOT */}

                    {!announcement.isRead && (
                      <span className="absolute right-5 top-5 h-3 w-3 rounded-full bg-[#1f6f5b]" />
                    )}

                    {/* TOP */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                          >
                            {announcement.type}
                          </span>

                          {!announcement.isRead && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-[#185848]">
                              New
                            </span>
                          )}

                          {announcement.batch && (
                            <span className="rounded-full bg-slate-100 dark:bg-[#070e1b] px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
                              {announcement.batch.name ||
                                announcement.batch.title}
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          {announcement.title}
                        </h2>
                      </div>

                      <span className="shrink-0 text-xs text-slate-400">
                        {announcement.createdAt
                          ? new Date(
                              announcement.createdAt
                            ).toLocaleString()
                          : ""}
                      </span>
                    </div>

                    {/* MESSAGE */}

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {announcement.message}
                    </p>

                    {/* FOOTER */}


                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-[#15253f] pt-4">
                      <div className="text-xs text-slate-400">
                        From{" "}
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {announcement.sender
                            ?.name ||
                            "Mentor"}
                        </span>
                      </div>

                      {announcement.isRead && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle
                            size={14}
                          />

                          Read
                        </div>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAnnouncements;