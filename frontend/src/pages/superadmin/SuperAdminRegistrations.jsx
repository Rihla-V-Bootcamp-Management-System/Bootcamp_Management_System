import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
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

      setApplications(data.registrations || []);
    } catch (err) {
      setError(err.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const updateStatus = async (registrationId, newStatus) => {
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
          data.message || "Failed to update registration status"
        );
      }

      setActionMessage(
        data.emailSent
          ? data.message
          : `${data.message}`
      );

      await loadRegistrations();
    } catch (err) {
      setError(
        err.message || "Failed to update registration status"
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (application.fullName || "")
          .toLowerCase()
          .includes(searchText) ||
        (application.email || "")
          .toLowerCase()
          .includes(searchText) ||
        (application.department || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

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

  const getAvailableActions = (status) => {
    if (status === "Submitted") {
      return ["Shortlisted", "Rejected"];
    }

    if (status === "Shortlisted") {
      return ["Interviewed", "Rejected"];
    }

    if (status === "Interviewed") {
      return ["Accepted", "Rejected"];
    }

    return [];
  };

  if (loading) {
    return (
      <div className="registrations-page">
        <div className="registrations-heading">
          <div>
            <p className="registrations-eyebrow">
              REGISTRATION MANAGEMENT
            </p>
            <h2>Registrations</h2>
            <p>Review and manage bootcamp applications.</p>
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

  if (error && applications.length === 0) {
    return (
      <div className="registrations-page">
        <div className="registrations-heading">
          <div>
            <p className="registrations-eyebrow">
              REGISTRATION MANAGEMENT
            </p>
            <h2>Registrations</h2>
            <p>Review and manage bootcamp applications.</p>
          </div>
        </div>

        <div className="registration-panel">
          <div className="registration-empty">{error}</div>
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
            Review and manage bootcamp applications and registration status.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="registration-action-message">
          {actionMessage}
        </div>
      )}

      {error && applications.length > 0 && (
        <div className="registration-action-error">
          {error}
        </div>
      )}

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
            <strong>{submittedCount + shortlistedCount}</strong>
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
              className={statusFilter === status ? "active" : ""}
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
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <button
            className="registration-filter-button"
            onClick={(e) => e.stopPropagation()}
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
              {filteredApplications.map((application) => {
                const availableActions = getAvailableActions(
                  application.status
                );

                return (
                  <tr key={application._id}>
                    <td>
                      <div className="application-user">
                        <div className="application-avatar">
                          {(application.fullName || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{application.fullName}</strong>
                          <span>{application.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{application.batchId || "—"}</td>

                    <td>{application.department || "—"}</td>

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
                        {application.status}
                      </span>
                    </td>

                    <td
                      className="registration-action-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="registration-action"
                        disabled={actionId === application._id}
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === application._id
                              ? null
                              : application._id
                          )
                        }
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenuId === application._id && (
                        <div className="registration-action-menu">
                          {availableActions.length === 0 ? (
                            <div className="registration-action-empty">
                              No actions available
                            </div>
                          ) : (
                            availableActions.map((status) => (
                              <button
                                key={status}
                                disabled={actionId === application._id}
                                onClick={() =>
                                  updateStatus(
                                    application._id,
                                    status
                                  )
                                }
                              >
                                {status === "Shortlisted" &&
                                  "Shortlist"}
                                {status === "Interviewed" &&
                                  "Mark Interviewed"}
                                {status === "Accepted" &&
                                  "Accept"}
                                {status === "Rejected" &&
                                  "Reject"}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

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
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminRegistrations;