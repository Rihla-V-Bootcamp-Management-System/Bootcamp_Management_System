import { useEffect, useMemo, useState } from "react";
import apiClient from "../services/apiClient";
import {
  Search,
  Filter,
  MoreHorizontal,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Power,
  Save,
} from "lucide-react";

function SuperAdminRegistrations() {
  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionId, setActionId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  // =====================================================
  // REGISTRATION CONTROL
  // =====================================================

  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // =====================================================
  // FORMAT DATE FOR DATETIME-LOCAL INPUT
  // =====================================================

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // =====================================================
  // LOAD REGISTRATION SETTINGS
  // =====================================================

  const loadRegistrationSettings = async () => {
    try {
      setSettingsLoading(true);

      const response = await apiClient.get("/registration-settings");
      const data = response.data;

      setRegistrationOpen(Boolean(data.registrationOpen));
      setOpensAt(formatDateTimeLocal(data.opensAt));
      setClosesAt(formatDateTimeLocal(data.closesAt));
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load registration settings"
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  // =====================================================
  // LOAD REGISTRATIONS
  // =====================================================

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/registrations");
      const data = response.data;

      const list =
        data.registrations ||
        data.data ||
        (Array.isArray(data) ? data : []);

      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load registrations"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WHEN COMPONENT MOUNT
  // =====================================================

  useEffect(() => {
    loadRegistrationSettings();
    loadRegistrations();
  }, []);

  // =====================================================
  // TOGGLE REGISTRATION OPEN / CLOSE
  // =====================================================

  const handleRegistrationToggle = async () => {
    try {
      setSettingsSaving(true);
      setError("");
      setActionMessage("");

      const newStatus = !registrationOpen;

      const response = await apiClient.patch("/registration-settings/toggle", {
        registrationOpen: newStatus,
      });

      const data = response.data;

      setRegistrationOpen(Boolean(data.registrationOpen));


      setActionMessage(
        data.message ||
          (newStatus
            ? "Registration opened successfully"
            : "Registration closed successfully")
      );
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update registration status"
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  // =====================================================
  // SAVE REGISTRATION PERIOD
  // =====================================================

  const handleSavePeriod = async () => {
    try {
      setSettingsSaving(true);
      setError("");
      setActionMessage("");

      if (!opensAt || !closesAt) {
        throw new Error(
          "Please select both opening and closing dates."
        );
      }

      const openingDate = new Date(opensAt);
      const closingDate = new Date(closesAt);

      if (openingDate >= closingDate) {
        throw new Error(
          "Registration opening time must be before closing time."
        );
      }

      const response = await apiClient.patch("/registration-settings/period", {
        opensAt: openingDate.toISOString(),
        closesAt: closingDate.toISOString(),
      });

      const data = response.data;

      setRegistrationOpen(Boolean(data.registrationOpen));

      setActionMessage(
        data.message ||
          "Registration period saved successfully"
      );
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to save registration period"
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================

  const updateStatus = async (
    registrationId,
    newStatus
  ) => {
    try {
      setActionId(registrationId);
      setOpenMenuId(null);
      setActionMessage("");
      setError("");

      const response = await apiClient.patch(`/registrations/${registrationId}/status`, {
        status: newStatus,
      });

      const data = response.data;

      setActionMessage(
        data.message ||
          "Registration updated successfully"
      );

      await loadRegistrations();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update status"
      );
    } finally {
      setActionId(null);
    }
  };

  // =====================================================
  // SAFE DISPLAY VALUE
  // =====================================================

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

  // =====================================================
  // FILTER APPLICATIONS
  // =====================================================

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

      const matchesStatus =
        statusFilter === "All" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  // =====================================================
  // COUNTS
  // =====================================================


  const submittedCount = applications.filter(
    (item) => item.status === "Submitted"
  ).length;

  const shortlistedCount = applications.filter(
    (item) => item.status === "Shortlisted"
  ).length;

  const acceptedCount = applications.filter(
    (item) => item.status === "Accepted"
  ).length;

  const rejectedCount = applications.filter(
    (item) => item.status === "Rejected"
  ).length;

  // =====================================================
  // AVAILABLE STATUS ACTIONS
  // =====================================================

  const getAvailableActions = (status) => {
    if (
      status === "Submitted" ||
      status === "SUBMITTED"
    ) {
      return ["Shortlisted", "Rejected"];
    }

    if (
      status === "Shortlisted" ||
      status === "SHORTLISTED"
    ) {
      return ["Interviewed", "Rejected"];
    }

    if (
      status === "Interviewed" ||
      status === "INTERVIEWED"
    ) {
      return ["Accepted", "Rejected"];
    }

    return [];
  };

  // =====================================================
  // LOADING
  // =====================================================

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
              Review and manage bootcamp applications
              and registration status.
            </p>
          </div>
        </div>

        <div className="registration-panel">
          <div className="registration-empty">
            Loading registrations...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div
      className="registrations-page"
      onClick={() => setOpenMenuId(null)}
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="registrations-heading">
        <div>
          <p className="registrations-eyebrow">
            REGISTRATION MANAGEMENT
          </p>

          <h2>Registrations</h2>

          <p>
            Review and manage bootcamp applications
            and registration status.
          </p>
        </div>
      </div>

      {/* =================================================
          MESSAGES
      ================================================= */}

      {actionMessage && (
        <div className="registration-action-message">
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="registration-action-error">
          {error}
        </div>
      )}

      {/* =================================================
          REGISTRATION CONTROL
      ================================================= */}

      <div className="registration-control-panel">
        <div className="registration-control-header">
          <div>
            <p className="registration-control-eyebrow">
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
                ? "is-open"
                : "is-closed"
            }`}
          >
            <span className="registration-status-dot"></span>

            {registrationOpen
              ? "Registration Open"
              : "Registration Closed"}
          </div>
        </div>

        <div className="registration-control-divider"></div>

        {/* TOGGLE */}


        <div className="registration-toggle-row">
          <div className="registration-toggle-info">
            <div className="registration-control-icon">
              <Power size={19} />
            </div>

            <div>
              <strong>Registration Status</strong>

              <span>
                {registrationOpen
                  ? "Students can currently access the registration form."
                  : "Students cannot currently access the registration form."}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={`registration-switch ${
              registrationOpen ? "active" : ""
            }`}
            onClick={handleRegistrationToggle}
            disabled={settingsSaving}
            aria-label={
              registrationOpen
                ? "Close registration"
                : "Open registration"
            }
          >
            <span className="registration-switch-knob"></span>
          </button>
        </div>

        {/* PERIOD */}

        <div className="registration-period-section">
          <div className="registration-period-title">
            <CalendarDays size={19} />

            <div>
              <strong>Registration Period</strong>

              <span>
                Registration will only be available
                between the selected opening and
                closing times when the switch is enabled.
              </span>
            </div>
          </div>

          <div className="registration-period-grid">
            <div className="registration-field">
              <label htmlFor="opensAt">
                Registration Opens
              </label>

              <input
                id="opensAt"
                type="datetime-local"
                value={opensAt}
                onChange={(e) =>
                  setOpensAt(e.target.value)
                }
                disabled={settingsSaving}
              />
            </div>

            <div className="registration-field">
              <label htmlFor="closesAt">
                Registration Closes
              </label>

              <input
                id="closesAt"
                type="datetime-local"
                value={closesAt}
                onChange={(e) =>
                  setClosesAt(e.target.value)
                }
                disabled={settingsSaving}
              />
            </div>
          </div>

          <div className="registration-period-actions">
            <button
              type="button"
              className="registration-save-period"
              onClick={handleSavePeriod}
              disabled={settingsSaving}
            >
              <Save size={16} />

              {settingsSaving
                ? "Saving..."
                : "Save Registration Period"}
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          APPLICATION STATISTICS
      ================================================= */}

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

      {/* =================================================
          APPLICATION TABLE
      ================================================= */}

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
                    <tr
                      key={application._id}
                    >
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
                          className={`registration-status status-${(
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