import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  UserCircle,
  Menu,
  X,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { getCurrentUserId } from "../utils/getCurrentUser";

function Header({
  title,
  description,
  onMenuClick,
  sidebarOpen,
}) {
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [announcements, setAnnouncements] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const role =
        localStorage.getItem("role");

      const userId = getCurrentUserId();

      if (!userId) {
        console.warn(
          "No logged-in user ID found."
        );

        return;
      }

      let response;

      if (role === "mentor") {
        response = await apiClient.get(
          "/announcements/mentor",
          {
            params: {
              mentorId: userId,
            },
          }
        );
      } else if (role === "student") {
        response = await apiClient.get(
          "/announcements/student",
          {
            params: {
              studentId: userId,
            },
          }
        );
      } else {
        return;
      }

      const data = response.data || {};

      setAnnouncements(
        (data.announcements || []).slice(0, 5)
      );

      setUnreadCount(
        data.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Notification loading error:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  // =========================================================
  // LOAD WHEN HEADER MOUNTS
  // =========================================================

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // OPEN ANNOUNCEMENTS
  // =========================================================

  const handleViewAnnouncements = () => {
    setNotificationOpen(false);

    if (
      window.location.pathname.startsWith(
        "/mentor"
      )
    ) {
      navigate("/mentor/announcements");
    } else {
      navigate("/student/announcements");
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <header className="relative z-30 shrink-0 bg-[#eef3f2]">
      <div className="flex min-h-[78px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white md:hidden"
            aria-label="Open menu"
          >
            {sidebarOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {title}
            </h1>

            {description && (
              <p className="mt-1 hidden truncate text-sm text-slate-500 sm:block">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">

          {/* SEARCH */}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white"
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          {/* NOTIFICATION */}

          <div
            ref={notificationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  (previous) => !previous
                )
              }
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition ${
                notificationOpen
                  ? "bg-white text-slate-900"
                  : "text-slate-600 hover:bg-white"
              }`}
              aria-label="Notifications"
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <>
                  <span className="absolute right-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#eef3f2]" />

                  <span className="absolute right-[7px] top-[7px] h-2.5 w-2.5 animate-ping rounded-full bg-red-400 opacity-75" />
                </>
              )}
            </button>

            {/* PANEL */}

            {notificationOpen && (
              <div className="absolute right-0 top-12 w-[340px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Notifications
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {unreadCount > 0
                        ? `${unreadCount} unread announcement${
                            unreadCount === 1
                              ? ""
                              : "s"
                          }`
                        : "You're all caught up"}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Bell
                      size={17}
                      className="text-slate-700"
                    />
                  </div>
                </div>

                {/* CONTENT */}

                <div className="max-h-[360px] overflow-y-auto">

                  {loadingNotifications ? (
                    <div className="px-5 py-8 text-center">
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

                      <p className="mt-3 text-sm text-slate-500">
                        Loading notifications...
                      </p>
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="px-5 py-10 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Megaphone
                          size={21}
                          className="text-slate-400"
                        />
                      </div>

                      <h3 className="mt-3 text-sm font-semibold text-slate-800">
                        No announcements
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        New announcements will appear here.
                      </p>
                    </div>
                  ) : (
                    announcements.map(
                      (announcement) => (
                        <button
                          key={announcement._id}
                          type="button"
                          onClick={() => {
                            setNotificationOpen(
                              false
                            );

                            navigate(
                              window.location.pathname.startsWith(
                                "/mentor"
                              )
                                ? "/mentor/announcements"
                                : "/student/announcements"
                            );
                          }}
                          className="flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50"
                        >
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              announcement.isRead
                                ? "bg-slate-100"
                                : "bg-red-50"
                            }`}
                          >
                            <Megaphone
                              size={17}
                              className={
                                announcement.isRead
                                  ? "text-slate-500"
                                  : "text-red-500"
                              }
                            />
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                              <h3 className="truncate text-sm font-semibold text-slate-900">
                                {announcement.title}
                              </h3>

                              {!announcement.isRead && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                              )}

                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {announcement.message}
                            </p>

                            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                              <span>
                                {formatDate(
                                  announcement.createdAt
                                )}
                              </span>

                              {announcement.batch && (
                                <>
                                  <span>•</span>

                                  <span>
                                    {announcement.batch.name ||
                                      announcement.batch.title}
                                  </span>
                                </>
                              )}
                            </div>

                          </div>
                        </button>
                      )
                    )
                  )}

                </div>

                {/* FOOTER */}

                <div className="border-t border-slate-200 bg-slate-50 p-3">

                  <button
                    type="button"
                    onClick={
                      handleViewAnnouncements
                    }
                    className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View All Announcements
                  </button>

                </div>

              </div>
            )}
          </div>

          {/* PROFILE */}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white"
            aria-label="Profile"
          >
            <UserCircle size={22} />
          </button>

        </div>
      </div>
    </header>
  );
}

export default Header;