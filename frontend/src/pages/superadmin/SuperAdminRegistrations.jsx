
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  CalendarDays,
} from "lucide-react";
import apiClient from "../../services/apiClient";

function SuperAdminRegistrations() {
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [error, setError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [actionId, setActionId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");

  // =========================================================
  // FORMAT DATE FOR DATETIME-LOCAL
  // =========================================================

  const formatDateTimeLocal = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const offset = date.getTimezoneOffset();

    const localDate = new Date(
      date.getTime() - offset * 60 * 1000
    );

    return localDate.toISOString().slice(0, 16);
  };

  // =========================================================
  // LOAD REGISTRATION SETTINGS
  // =========================================================

  const loadRegistrationSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError("");

      const response = await apiClient.get(
        "/registration-settings"
      );

      const data = response.data;

      setRegistrationOpen(
        Boolean(data?.registrationOpen)
      );

      setOpensAt(
        formatDateTimeLocal(data?.opensAt)
      );

      setClosesAt(
        formatDateTimeLocal(data?.closesAt)
      );
    } catch (err) {
      console.error(
        "Failed to load registration settings:",
        err
      );

      setSettingsError(
        err.response?.data?.message ||
          "Failed to load registration settings"
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  // =========================================================
  // LOAD APPLICATIONS
  // =========================================================

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/registrations"
      );

      const data = response.data;

      setApplications(
        Array.isArray(data?.registrations)
          ? data.registrations
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load registrations:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load registrations"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadRegistrationSettings();
    loadRegistrations();
  }, []);

  // =========================================================
  // TOGGLE REGISTRATION
  // =========================================================

  const updateRegistrationToggle = async (open) => {
    try {
      setSettingsError("");
      setActionMessage("");

      const response = await apiClient.patch(
        "/registration-settings/toggle",
        {
          registrationOpen: open,
        }
      );

      const data = response.data;

      setRegistrationOpen(
        Boolean(data?.registrationOpen)
      );

      setActionMessage(
        data?.message ||
          (open
            ? "Registration opened successfully."
            : "Registration closed successfully.")
      );
    } catch (err) {
      console.error(
        "Failed to update registration status:",
        err
      );

      setSettingsError(
        err.response?.data?.message ||
          "Failed to update registration status"
      );
    }
  };

  // =========================================================
  // SAVE REGISTRATION PERIOD
  // =========================================================

  const saveRegistrationPeriod = async () => {
    try {
      setSettingsError("");
      setActionMessage("");

      if (!opensAt || !closesAt) {
        setSettingsError(
          "Please select both opening and closing dates."
        );
        return;
      }

      const openingDate = new Date(opensAt);
      const closingDate = new Date(closesAt);

      if (
        Number.isNaN(openingDate.getTime()) ||
        Number.isNaN(closingDate.getTime())
      ) {
        setSettingsError(
          "Please enter valid dates."
        );
        return;
      }

      if (openingDate >= closingDate) {
        setSettingsError(
          "Opening date must be before closing date."
        );
        return;
      }

      const response = await apiClient.patch(
        "/registration-settings/period",
        {
          opensAt: openingDate.toISOString(),
          closesAt: closingDate.toISOString(),
        }
      );

      const data = response.data;

      setRegistrationOpen(
        Boolean(data?.registrationOpen)
      );

      setOpensAt(
        formatDateTimeLocal(data?.opensAt)
      );

      setClosesAt(
        formatDateTimeLocal(data?.closesAt)
      );

      setActionMessage(
        data?.message ||
          "Registration period saved successfully."
      );
    } catch (err) {
      console.error(
        "Failed to save registration period:",
        err
      );

      setSettingsError(
        err.response?.data?.message ||
          "Failed to save registration period"
      );
    }
  };

  // =========================================================
  // UPDATE APPLICATION STATUS
  // =========================================================

  const updateStatus = async (
    registrationId,
    newStatus
  ) => {
    try {
      setActionId(registrationId);
      setOpenMenuId(null);
      setActionMessage("");
      setError("");

      const response = await apiClient.patch(
        `/registrations/${registrationId}/status`,
        {
          status: newStatus,
        }
      );

      setActionMessage(
        response.data?.message ||
          "Registration updated successfully."
      );

      await loadRegistrations();
    } catch (err) {
      console.error(
        "Failed to update registration status:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update registration status"
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================================================
  // DISPLAY VALUE
  // =========================================================

  const getDisplayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return (
        value.name ||
        value.title ||
        value._id ||
        "—"
      );
    }

    return String(value);
  };

  // =========================================================
  // NORMALIZE STATUS
  // =========================================================

  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // =========================================================
  // FILTER APPLICATIONS
  // =========================================================

  const filteredApplications = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return applications.filter((application) => {
      const fullName = getDisplayValue(
        application.fullName
      ).toLowerCase();

      const email = getDisplayValue(
        application.email
      ).toLowerCase();

      const department = getDisplayValue(
        application.department
      ).toLowerCase();

      const batch = getDisplayValue(
        application.batchId
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        fullName.includes(searchText) ||
        email.includes(searchText) ||
        department.includes(searchText) ||
        batch.includes(searchText);

      const applicationStatus =
        normalizeStatus(application.status);

      const matchesStatus =
        statusFilter === "All" ||
        applicationStatus === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    applications,
    search,
    statusFilter,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const submittedCount = applications.filter(
    (item) =>
      normalizeStatus(item.status) ===
      "Submitted"
  ).length;

  const shortlistedCount = applications.filter(
    (item) =>
      normalizeStatus(item.status) ===
      "Shortlisted"
  ).length;

  const acceptedCount = applications.filter(
    (item) =>
      normalizeStatus(item.status) ===
      "Accepted"
  ).length;

  const rejectedCount = applications.filter(
    (item) =>
      normalizeStatus(item.status) ===
      "Rejected"
  ).length;

  const pendingCount =
    submittedCount + shortlistedCount;

  // =========================================================
  // AVAILABLE ACTIONS
  // =========================================================

  const getAvailableActions = (status) => {
    const normalizedStatus =
      normalizeStatus(status);

    if (normalizedStatus === "Submitted") {
      return [
        "Shortlisted",
        "Rejected",
      ];
    }

    if (
      normalizedStatus === "Shortlisted"
    ) {
      return [
        "Interviewed",
        "Rejected",
      ];
    }

    if (
      normalizedStatus === "Interviewed"
    ) {
      return [
        "Accepted",
        "Rejected",
      ];
    }

    return [];
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading || settingsLoading) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6">
            <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />

            <div className="mt-3 h-8 w-56 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex min-h-[350px] items-center justify-center">
              <p className="text-sm text-gray-500">
                Loading registration management...
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      className="min-h-full bg-gray-50 p-6"
      onClick={() => setOpenMenuId(null)}
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            REGISTRATION MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Registrations
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Control registration availability and manage
            bootcamp applications.
          </p>
        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {actionMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {actionMessage}
          </div>
        )}

        {(settingsError ||
          (error && applications.length > 0)) && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {settingsError || error}
          </div>
        )}

        {/* =================================================
            REGISTRATION CONTROL
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  REGISTRATION CONTROL
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Registration Availability
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage when students can submit new
                  applications.
                </p>
              </div>

              {/* STATUS */}

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                  registrationOpen
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    registrationOpen
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />

                {registrationOpen
                  ? "Registration Open"
                  : "Registration Closed"}
              </div>
            </div>
          </div>

          {/* CONTROL BUTTONS */}

          <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                disabled={registrationOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  updateRegistrationToggle(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Unlock size={17} />
                Open Registration
              </button>

              <button
                type="button"
                disabled={!registrationOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  updateRegistrationToggle(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Lock size={17} />
                Close Registration
              </button>

            </div>
          </div>

          {/* REGISTRATION PERIOD */}

          <div className="px-6 py-6">

            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CalendarDays size={18} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Registration Period
                </h3>

                <p className="text-xs text-gray-500">
                  Set the scheduled opening and closing times.
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">

              <div>
                <label
                  htmlFor="registration-opens"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Registration Opens
                </label>

                <input
                  id="registration-opens"
                  type="datetime-local"
                  value={opensAt}
                  onChange={(e) =>
                    setOpensAt(e.target.value)
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label
                  htmlFor="registration-closes"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Registration Closes
                </label>

                <input
                  id="registration-closes"
                  type="datetime-local"
                  value={closesAt}
                  onChange={(e) =>
                    setClosesAt(e.target.value)
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  saveRegistrationPeriod();
                }}
                className="inline-flex h-[46px] items-center justify-center rounded-xl bg-[#071629] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#10263f]"
              >
                Save Period
              </button>

            </div>

            <p className="mt-3 text-xs text-gray-400">
              The opening time must be earlier than the
              closing time.
            </p>

          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={<ClipboardList size={19} />}
            label="Total Applications"
            value={applications.length}
          />

          <StatCard
            icon={<Clock3 size={19} />}
            label="Pending Review"
            value={pendingCount}
          />

          <StatCard
            icon={<CheckCircle2 size={19} />}
            label="Accepted"
            value={acceptedCount}
          />

          <StatCard
            icon={<XCircle size={19} />}
            label="Rejected"
            value={rejectedCount}
          />

        </div>

        {/* =================================================
            APPLICATIONS TABLE
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* TABS */}

          <div className="overflow-x-auto border-b border-gray-200">
            <div className="flex min-w-max px-4">

              {[
                "All",
                "Submitted",
                "Shortlisted",
                "Interviewed",
                "Accepted",
                "Rejected",
              ].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusFilter(status);
                  }}
                  className={`border-b-2 px-4 py-4 text-sm font-medium transition ${
                    statusFilter === status
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {status}
                </button>
              ))}

            </div>
          </div>

          {/* TOOLBAR */}

          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="relative w-full sm:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search applications..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <button
              type="button"
              onClick={(e) =>
                e.stopPropagation()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <Filter size={16} />
              Filter
            </button>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Applicant
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Batch
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredApplications.map(
                  (application) => {
                    const availableActions =
                      getAvailableActions(
                        application.status
                      );

                    const applicantName =
                      getDisplayValue(
                        application.fullName
                      );

                    return (
                      <tr
                        key={application._id}
                        className="border-b border-gray-100 transition hover:bg-gray-50/70"
                      >

                        {/* APPLICANT */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                              {applicantName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {applicantName}
                              </p>

                              <p className="truncate text-xs text-gray-500">
                                {getDisplayValue(
                                  application.email
                                )}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* BATCH */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {getDisplayValue(
                            application.batchId
                          )}
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {getDisplayValue(
                            application.department
                          )}
                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {application.submittedAt
                            ? new Date(
                                application.submittedAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={
                              application.status
                            }
                          />
                        </td>

                        {/* ACTION */}

                        <td
                          className="relative px-5 py-4 text-right"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >

                          <button
                            type="button"
                            disabled={
                              actionId ===
                              application._id
                            }
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId ===
                                  application._id
                                  ? null
                                  : application._id
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                          >
                            <MoreHorizontal
                              size={18}
                            />
                          </button>

                          {openMenuId ===
                            application._id && (
                            <div className="absolute right-5 top-14 z-20 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 text-left shadow-xl">

                              {availableActions.length ===
                              0 ? (
                                <div className="px-4 py-3 text-xs text-gray-500">
                                  No actions available
                                </div>
                              ) : (
                                availableActions.map(
                                  (status) => (
                                    <button
                                      key={status}
                                      type="button"
                                      disabled={
                                        actionId ===
                                        application._id
                                      }
                                      onClick={() =>
                                        updateStatus(
                                          application._id,
                                          status
                                        )
                                      }
                                      className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                                        status ===
                                        "Rejected"
                                          ? "text-red-600 hover:bg-red-50"
                                          : "text-gray-700 hover:bg-gray-50"
                                      }`}
                                    >
                                      {status ===
                                        "Shortlisted" &&
                                        "Shortlist"}

                                      {status ===
                                        "Interviewed" &&
                                        "Mark Interviewed"}

                                      {status ===
                                        "Accepted" &&
                                        "Accept"}

                                      {status ===
                                        "Rejected" &&
                                        "Reject"}
                                    </button>
                                  )
                                )
                              )}

                            </div>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

                {filteredApplications.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto max-w-sm">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                          <ClipboardList
                            size={22}
                          />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-700">
                          No applications found
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Try changing your search or
                          status filter.
                        </p>

                      </div>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>

          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredApplications.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {applications.length}
              </span>{" "}
              applications
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-400"
              >
                Previous
              </button>

              <button
                type="button"
                className="rounded-lg bg-[#071629] px-3 py-2 text-xs font-semibold text-white"
              >
                1
              </button>

              <button
                type="button"
                disabled
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-400"
              >
                Next
              </button>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status }) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  const styles = {
    submitted:
      "bg-blue-50 text-blue-700 border-blue-200",

    shortlisted:
      "bg-purple-50 text-purple-700 border-purple-200",

    interviewed:
      "bg-amber-50 text-amber-700 border-amber-200",

    accepted:
      "bg-green-50 text-green-700 border-green-200",

    rejected:
      "bg-red-50 text-red-700 border-red-200",
  };

  const style =
    styles[normalized] ||
    "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${style}`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default SuperAdminRegistrations