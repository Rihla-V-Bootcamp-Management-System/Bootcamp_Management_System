import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  UserCircle,
  Menu,
  X,
  Check,
  CheckCheck,
  Loader2,
  CalendarDays,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import DualCalendar from "./DualCalendar";
import { getCurrentUserId } from "../utils/getCurrentUser";

function Header({
  title,
  description,
  onMenuClick,
  sidebarOpen,
}) {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [calendarOpen, setCalendarOpen] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const [markingAll, setMarkingAll] =
    useState(false);

  // =========================================================
  // REFS
  // =========================================================

  const notificationRef = useRef(null);
  const calendarRef = useRef(null);

  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await apiClient.get(
        "/notifications"
      );

      setNotifications(
        Array.isArray(
          response.data.notifications
        )
          ? response.data.notifications
          : []
      );

      setUnreadCount(
        Number(response.data.unreadCount) || 0
      );
    } catch (error) {
      console.error(
        "FETCH NOTIFICATIONS ERROR:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  // =========================================================
  // INITIAL LOAD + REFRESH EVERY 30 SECONDS
  // =========================================================

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =========================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationsOpen(false);
      }

      if (
        calendarRef.current &&
        !calendarRef.current.contains(
          event.target
        )
      ) {
        setCalendarOpen(false);
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
  // MARK ONE NOTIFICATION AS READ
  // =========================================================

  const markAsRead = async (
    notificationId
  ) => {
    try {
      await apiClient.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0)
      );
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );
    }
  };


  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);

      await apiClient.patch(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS READ ERROR:",
        error
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // =========================================================
  // NOTIFICATION CLICK
  // =========================================================

  const getStoredRole = () => {
    const directRole = localStorage.getItem("role");
    if (directRole) return directRole.toLowerCase();
    try {
      const saved = JSON.parse(localStorage.getItem("user") || "{}");
      return (saved.role || "").toLowerCase();
    } catch {
      return "";
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    const role = getStoredRole();

    if (role === "admin") {
      navigate("/admin/announcements");
    } else if (role === "superadmin") {
      navigate("/superadmin/audit-logs");
    } else if (role === "mentor") {
      navigate("/mentor/announcements");
    } else {
      navigate("/student/announcements");
    }
  };

  // =========================================================
  // OPEN ANNOUNCEMENTS
  // =========================================================

  const handleViewAnnouncements = () => {
    setNotificationsOpen(false);

    const role = getStoredRole();

    if (role === "admin") {
      navigate("/admin/announcements");
    } else if (role === "superadmin") {
      navigate("/superadmin/audit-logs");
    } else if (role === "mentor") {
      navigate("/mentor/announcements");
    } else {
      navigate("/student/announcements");
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString();
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <header className="relative z-30 shrink-0 bg-[#eef3f2]">
      <div className="flex min-h-[78px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="flex min-w-0 items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1f6f5b] text-white md:hidden"
            aria-label="Open menu"
          >
            {sidebarOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {title}
            </h1>

            {description && (
              <p className="mt-1 hidden truncate text-sm text-slate-500 dark:text-slate-400 sm:block">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">


          {/* ===================================================
              SEARCH
          =================================================== */}

          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-1.5 rounded-xl border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-1.5 shadow-md transition-all">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dashboard..."
                  autoFocus
                  className="w-36 bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none sm:w-48"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-700 dark:text-slate-200"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 transition hover:bg-white dark:bg-[#0b1528]"
                aria-label="Search"
              >
                <Search size={19} />
              </button>
            )}
          </div>

          {/* ===================================================
              CALENDAR
          =================================================== */}

          <div
            ref={calendarRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setCalendarOpen(
                  (previous) => !previous
                );

                setNotificationsOpen(false);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                calendarOpen
                  ? "bg-white text-slate-900"
                  : "text-slate-600 hover:bg-white"
              }`}
              aria-label="Calendar"
            >
              <CalendarDays size={19} />
            </button>

            {calendarOpen && (
              <DualCalendar />
            )}
          </div>

          {/* ===================================================
              NOTIFICATIONS
          =================================================== */}

          <div
            ref={notificationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(
                  (previous) => !previous
                );

                setCalendarOpen(false);
              }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition ${
                notificationsOpen
                  ? "bg-white text-slate-900"
                  : "text-slate-600 hover:bg-white"
              }`}
              aria-label="Notifications"
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[#eef3f2]">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* =================================================
                NOTIFICATION DROPDOWN
            ================================================= */}

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-[350px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] shadow-xl">


                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#15253f] px-4 py-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h2>

                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : "You're all caught up"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      disabled={markingAll}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:bg-[#070e1b] disabled:opacity-50"
                    >
                      {markingAll ? (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCheck
                          size={13}
                        />
                      )}

                      Mark all read
                    </button>
                  )}
                </div>

                {/* NOTIFICATION LIST */}

                <div className="max-h-[420px] overflow-y-auto">

                  {loadingNotifications &&
                  notifications.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500 dark:text-slate-400">
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Loading notifications...
                    </div>
                  ) : notifications.length ===
                    0 ? (
                    <div className="px-4 py-10 text-center">

                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-[#070e1b]">
                        <Bell
                          size={19}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        No notifications
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        New announcements will appear
                        here.
                      </p>
                    </div>
                  ) : (
                    notifications.map(
                      (notification) => (
                        <button
                          key={notification._id}
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                            !notification.isRead
                              ? "bg-slate-50"
                              : "bg-white"
                          }`}
                        >

                          {/* ICON */}


                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              notification.isRead
                                ? "bg-slate-100 text-slate-500"
                                : "bg-[#1f6f5b] hover:bg-[#185848] text-white"
                            }`}
                          >
                            {notification.isRead ? (
                              <Check size={15} />
                            ) : (
                              <Bell size={15} />
                            )}
                          </div>

                          {/* TEXT */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                              <p
                                className={`line-clamp-2 text-xs ${
                                  notification.isRead
                                    ? "font-medium text-slate-700"
                                    : "font-bold text-slate-900"
                                }`}
                              >
                                {notification.title}
                              </p>

                              {!notification.isRead && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[10px] text-slate-400">
                              {formatDate(
                                notification.createdAt
                              )}
                            </p>

                          </div>
                        </button>
                      )
                    )
                  )}
                </div>

                {/* FOOTER */}

                <div className="border-t border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-3">

                  <button
                    type="button"
                    onClick={
                      handleViewAnnouncements
                    }
                    className="w-full rounded-lg bg-[#1f6f5b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185848]"
                  >
                    View All Announcements
                  </button>

                </div>
              </div>
            )}
          </div>

          {/* ===================================================
              PROFILE
          =================================================== */}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 transition hover:bg-white dark:bg-[#0b1528]"
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