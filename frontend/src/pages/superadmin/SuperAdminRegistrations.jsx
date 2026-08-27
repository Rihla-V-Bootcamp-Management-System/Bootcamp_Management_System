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

  const formatDateTimeLocal = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
  };

  const loadRegistrationSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsError("");

      const response = await fetch(
        "http://localhost:5000/api/registration-settings"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load registration settings"
        );
      }

      setRegistrationOpen(Boolean(data.registrationOpen));
      setOpensAt(formatDateTimeLocal(data.opensAt));
      setClosesAt(formatDateTimeLocal(data.closesAt));
    } catch (err) {
      setSettingsError(
        err.message || "Failed to load registration settings"
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "http://localhost:5000/api/registrations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load registrations"
        );
      }

      setApplications(
        Array.isArray(data.registrations)
          ? data.registrations
          : []
      );
    } catch (err) {
      setError(
        err.message || "Failed to load registrations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrationSettings();
    loadRegistrations();
  }, []);

  const updateRegistrationToggle = async (open) => {
    try {
      setSettingsError("");
      setActionMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "http://localhost:5000/api/registration-settings/toggle",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            registrationOpen: open,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update registration status"
        );
      }

      setRegistrationOpen(Boolean(data.registrationOpen));

      setActionMessage(
        data.message ||
          (open
            ? "Registration opened successfully"
            : "Registration closed successfully")
      );
    } catch (err) {
      setSettingsError(
        err.message || "Failed to update registration status"
      );
    }
  };

  const saveRegistrationPeriod = async () => {
    try {
      setSettingsError("");
      setActionMessage("");

      if (!opensAt || !closesAt) {
        throw new Error(
          "Please select both opening and closing dates"
        );
      }

      const openingDate = new Date(opensAt);
      const closingDate = new Date(closesAt);

      if (openingDate >= closingDate) {
        throw new Error(
          "Opening date must be before closing date"
        );
      }

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        "http://localhost:5000/api/registration-settings/period",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            opensAt: openingDate.toISOString(),
            closesAt: closingDate.toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save registration period"
        );
      }

      setRegistrationOpen(Boolean(data.registrationOpen));
      setOpensAt(formatDateTimeLocal(data.opensAt));
      setClosesAt(formatDateTimeLocal(data.closesAt));

      setActionMessage(
        data.message || "Registration period saved successfully"
      );
    } catch (err) {
      setSettingsError(
        err.message || "Failed to save registration period"
      );
    }
  };

  const updateStatus = async (
    registrationId,
    newStatus
  ) => {
    try {
      setActionId(registrationId);
      setOpenMenuId(null);
      setActionMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:5000/api/registrations/${registrationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update registration status"
        );
      }

      setActionMessage(
        data.message ||
          "Registration updated successfully"
      );

      await loadRegistrations();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update registration status"
      );
    } finally {
      setActionId(null);
    }
  };

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

  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        getDisplayValue(application.fullName)
          .toLowerCase()
          .includes(searchText) ||
        getDisplayValue(application.email)
          .toLowerCase()
          .includes(searchText) ||
        getDisplayValue(application.department)
          .toLowerCase()
          .includes(searchText) ||
        getDisplayValue(application.batchId)
          .toLowerCase()
          .includes(searchText);

      const applicationStatus = normalizeStatus(
        application.status
      );

      const matchesStatus =
        statusFilter === "All" ||
        applicationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const submittedCount = applications.filter(
    (item) =>
      normalizeStatus(item.status) === "Submitted"
  ).length;

  const shortlistedCount = applications.filter(
    (item) =>
      normalizeStatus(item.status) === "Shortlisted"
  ).length;

  const acceptedCount = applications.filter(
    (item) =>
      normalizeStatus(item.status) === "Accepted"
  ).length;

  const rejectedCount = applications.filter(
    (item) =>
      normalizeStatus(item.status) === "Rejected"
  ).length;

  const getAvailableActions = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "Submitted") {
      return ["Shortlisted", "Rejected"];
    }

    if (normalizedStatus === "Shortlisted") {
      return ["Interviewed", "Rejected"];
    }

    if (normalizedStatus === "Interviewed") {
      return ["Accepted", "Rejected"];
    }

    return [];
  };

  if (loading || settingsLoading) {
    return (
      <div className="registrations-page">
        <div className="registrations-heading">
          <div>
            <p className="registrations-eyebrow">
              REGISTRATION MANAGEMENT
            </p>

            <h2>Registrations</h2>

            <p>
              Review and manage bootcamp applications and
              registration status.
            </p>
          </div>
        </div>

        <div className="registration-panel">
          <div className="registration-empty">
            Loading registration management...
          </div>
        </div>
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <div className="registrations-page">
        <div className="registrations-heading">
          <div>
            <p className="registrations-eyebrow">
              REGISTRATION MANAGEMENT
            </p>

            <h2>Registrations</h2>

            <p>
              Review and manage bootcamp applications and
              registration status.
            </p>
          </div>
        </div>

        <div className="registration-panel">
          <div className="registration-empty">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="registrations-page"
      onClick={() => setOpenMenuId(null)}
    >
      <div className="registrations-heading">
        <div>
          <p className="registrations-eyebrow">
            REGISTRATION MANAGEMENT
          </p>

          <h2>Registrations</h2>

          <p>
            Control registration availability and manage
            bootcamp applications.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="registration-action-message">
          {actionMessage}
        </div>
      )}

      {settingsError && (
        <div className="registration-action-error">
          {settingsError}
        </div>
      )}

      {error && applications.length > 0 && (
        <div className="registration-action-error">
          {error}
        </div>
      )}

      <div className="registration-panel registration-control-panel">
        <div className="registration-control-header">
          <div>
            <p className="registrations-eyebrow">
              REGISTRATION CONTROL
            </p>

            <h3>Registration Availability</h3>

            <p>
              Only the Super Admin can open or close
              registration.
            </p>
          </div>

          <div
            className={`registration-control-status ${
              registrationOpen
                ? "registration-open"
                : "registration-closed"
            }`}
          >
            {registrationOpen ? (
              <>
                <Unlock size={18} />
                <span>Registration Open</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Registration Closed</span>
              </>
            )}
          </div>
        </div>

        <div className="registration-control-actions">
          <button
            type="button"
            className="registration-open-button"
            disabled={registrationOpen}
            onClick={(e) => {
              e.stopPropagation();
              updateRegistrationToggle(true);
            }}
          >
            <Unlock size={17} />
            Open Registration
          </button>

          <button
            type="button"
            className="registration-close-button"
            disabled={!registrationOpen}
            onClick={(e) => {
              e.stopPropagation();
              updateRegistrationToggle(false);
            }}
          >
            <Lock size={17} />
            Close Registration
          </button>
        </div>

        <div className="registration-period-section">
          <div className="registration-period-title">
            <CalendarDays size={18} />
            <span>Registration Period</span>
          </div>

          <div className="registration-period-fields">
            <div className="registration-period-field">
              <label htmlFor="registration-opens">
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
              />
            </div>

            <div className="registration-period-field">
              <label htmlFor="registration-closes">
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
              />
            </div>

            <button
              type="button"
              className="registration-save-period-button"
              onClick={(e) => {
                e.stopPropagation();
                saveRegistrationPeriod();
              }}
            >
              Save Registration Period
            </button>
          </div>

          <p className="registration-period-help">
            Registration will only be available between the
            selected opening and closing times when the
            registration switch is enabled.
          </p>
        </div>
      </div>

      <div className="registration-stats">
        <div className="registration-stat">
          <div className="registration-stat-icon">
            <ClipboardList size={19} />
          </div>

          <div>
            <span>Total Applications</span>
            <strong>{applications.length}</strong>
          </div>
        </div>

        <div className="registration-stat">
          <div className="registration-stat-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>Pending Review</span>
            <strong>
              {submittedCount + shortlistedCount}
            </strong>
          </div>
        </div>

        <div className="registration-stat">
          <div className="registration-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Accepted</span>
            <strong>{acceptedCount}</strong>
          </div>
        </div>

        <div className="registration-stat">
          <div className="registration-stat-icon">
            <XCircle size={19} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>
      </div>

      <div className="registration-panel">
        <div className="registration-tabs">
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
              className={
                statusFilter === status
                  ? "active"
                  : ""
              }
              onClick={(e) => {
                e.stopPropagation();
                setStatusFilter(status);
              }}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="registration-toolbar">
          <div className="registration-search">
            <Search size={18} />

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
            />
          </div>

          <button
            className="registration-filter-button"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="registration-table-wrapper">
          <table className="registration-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Batch</th>
                <th>Department</th>
                <th>Submitted</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map(
                (application) => {
                  const availableActions =
                    getAvailableActions(
                      application.status
                    );

                  return (
                    <tr key={application._id}>
                      <td>
                        <div className="application-user">
                          <div className="application-avatar">
                            {getDisplayValue(
                              application.fullName
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getDisplayValue(
                                application.fullName
                              )}
                            </strong>

                            <span>
                              {getDisplayValue(
                                application.email
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {getDisplayValue(
                          application.batchId
                        )}
                      </td>

                      <td>
                        {getDisplayValue(
                          application.department
                        )}
                      </td>

                      <td>
                        {application.submittedAt
                          ? new Date(
                              application.submittedAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <span
                          className={`registration-status status-${String(
                            application.status || ""
                          ).toLowerCase()}`}
                        >
                          {getDisplayValue(
                            application.status
                          )}
                        </span>
                      </td>

                      <td
                        className="registration-action-cell"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <button
                          className="registration-action"
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
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenuId ===
                          application._id && (
                          <div className="registration-action-menu">
                            {availableActions.length ===
                            0 ? (
                              <div className="registration-action-empty">
                                No actions available
                              </div>
                            ) : (
                              availableActions.map(
                                (status) => (
                                  <button
                                    key={status}
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

              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="registration-empty">
                      No applications found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="registration-pagination">
          <span>
            Showing {filteredApplications.length} of{" "}
            {applications.length} applications
          </span>

          <div>
            <button disabled>
              Previous
            </button>

            <button className="active">
              1
            </button>

            <button disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminRegistrations;