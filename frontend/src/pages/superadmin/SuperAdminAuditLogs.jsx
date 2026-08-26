import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  UserCog,
  FileText,
  LogIn,
  Settings,
  MoreHorizontal,
  ShieldCheck,
  X,
} from "lucide-react";

function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          "http://localhost:5000/api/superadmin/audit-logs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load audit logs"
          );
        }

        setLogs(data.logs || []);
      } catch (err) {
        setError(err.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const getType = (action = "") => {
    if (
      action.includes("LOGIN") ||
      action.includes("AUTH")
    ) {
      return "Authentication";
    }

    if (
      action.includes("REGISTRATION") ||
      action.includes("APPLICATION") ||
      action.includes("STATUS_CHANGE")
    ) {
      return "Registration";
    }

    if (
      action.includes("SETTING") ||
      action.includes("SYSTEM")
    ) {
      return "System";
    }

    return "User Management";
  };

  const getIcon = (type) => {
    if (type === "Authentication") {
      return <LogIn size={16} />;
    }

    if (type === "Registration") {
      return <FileText size={16} />;
    }

    if (type === "System") {
      return <Settings size={16} />;
    }

    return <UserCog size={16} />;
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const type = getType(log.action);
      const searchText = search.toLowerCase();

      const matchesSearch =
        (log.actor?.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (log.actor?.email || "")
          .toLowerCase()
          .includes(searchText) ||
        (log.action || "")
          .toLowerCase()
          .includes(searchText) ||
        (log.description || "")
          .toLowerCase()
          .includes(searchText);

      const matchesType =
        typeFilter === "All" || type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [logs, search, typeFilter]);

  const authenticationCount = logs.filter(
    (log) => getType(log.action) === "Authentication"
  ).length;

  const registrationCount = logs.filter(
    (log) => getType(log.action) === "Registration"
  ).length;

  const userManagementCount = logs.filter(
    (log) => getType(log.action) === "User Management"
  ).length;

  const systemCount = logs.filter(
    (log) => getType(log.action) === "System"
  ).length;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="audit-page">
        <div className="audit-heading">
          <div>
            <p className="audit-eyebrow">SYSTEM MONITORING</p>
            <h2>Audit Logs</h2>
            <p>Track important activity across the system.</p>
          </div>
        </div>

        <div className="audit-panel">
          <div className="audit-empty">
            Loading audit logs...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-page">
        <div className="audit-heading">
          <div>
            <p className="audit-eyebrow">SYSTEM MONITORING</p>
            <h2>Audit Logs</h2>
            <p>Track important activity across the system.</p>
          </div>
        </div>

        <div className="audit-panel">
          <div className="audit-empty">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="audit-page"
      onClick={() => setOpenMenuId(null)}
    >
      <div className="audit-heading">
        <div>
          <p className="audit-eyebrow">SYSTEM MONITORING</p>
          <h2>Audit Logs</h2>
          <p>Track important activity across the system.</p>
        </div>
      </div>

      <div className="audit-stats">
        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span>Total Activities</span>
            <strong>{logs.length}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <UserCog size={18} />
          </div>
          <div>
            <span>User Management</span>
            <strong>{userManagementCount}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <FileText size={18} />
          </div>
          <div>
            <span>Registrations</span>
            <strong>{registrationCount}</strong>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <LogIn size={18} />
          </div>
          <div>
            <span>Authentication</span>
            <strong>{authenticationCount}</strong>
          </div>
        </div>
      </div>

      <div className="audit-panel">
        <div className="audit-toolbar">
          <div className="audit-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="audit-filter">
            <Filter size={16} />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="All">All Activity</option>
              <option value="User Management">
                User Management
              </option>
              <option value="Registration">
                Registration
              </option>
              <option value="Authentication">
                Authentication
              </option>
              <option value="System">
                System
              </option>
            </select>
          </div>
        </div>

        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Activity</th>
                <th>Description</th>
                <th>Type</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => {
                const type = getType(log.action);

                return (
                  <tr key={log._id}>
                    <td>
                      <div className="audit-user">
                        <div className="audit-avatar">
                          {(log.actor?.name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {log.actor?.name || "Unknown"}
                          </strong>

                          <span>
                            {log.actor?.email || "—"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="audit-action">
                        <div className="audit-action-icon">
                          {getIcon(type)}
                        </div>

                        <span>
                          {log.action || "Activity"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {log.description || "—"}
                    </td>

                    <td>
                      <span className="audit-type">
                        {type}
                      </span>
                    </td>

                    <td>
                      <div className="audit-date">
                        <strong>
                          {formatDate(log.createdAt)}
                        </strong>

                        <span>
                          {formatTime(log.createdAt)}
                        </span>
                      </div>
                    </td>

                    <td
                      className="audit-action-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="audit-action-button"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === log._id
                              ? null
                              : log._id
                          )
                        }
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenuId === log._id && (
                        <div className="audit-action-menu">
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setOpenMenuId(null);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="audit-empty">
                      No activity found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-pagination">
          <span>
            Showing {filteredLogs.length} of {logs.length} activities
          </span>

          <div>
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button disabled>Next</button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div
          className="audit-details-overlay"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="audit-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="audit-details-header">
              <div>
                <p className="audit-eyebrow">
                  AUDIT ACTIVITY
                </p>
                <h3>Activity Details</h3>
              </div>

              <button
                className="audit-details-close"
                onClick={() => setSelectedLog(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="audit-details-grid">
              <div>
                <span>Administrator</span>
                <strong>
                  {selectedLog.actor?.name || "Unknown"}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedLog.actor?.email || "—"}
                </strong>
              </div>

              <div>
                <span>Action</span>
                <strong>
                  {selectedLog.action || "Activity"}
                </strong>
              </div>

              <div>
                <span>Type</span>
                <strong>
                  {getType(selectedLog.action)}
                </strong>
              </div>

              <div>
                <span>Target Type</span>
                <strong>
                  {selectedLog.targetType || "—"}
                </strong>
              </div>

              <div>
                <span>Target ID</span>
                <strong>
                  {selectedLog.targetId || "—"}
                </strong>
              </div>

              <div>
                <span>Date</span>
                <strong>
                  {formatDate(selectedLog.createdAt)}
                </strong>
              </div>

              <div>
                <span>Time</span>
                <strong>
                  {formatTime(selectedLog.createdAt)}
                </strong>
              </div>
            </div>

            <div className="audit-details-description">
              <span>Description</span>

              <p>
                {selectedLog.description ||
                  "No description available."}
              </p>
            </div>

            {selectedLog.metadata && (
              <div className="audit-details-description">
                <span>Metadata</span>

                <pre>
                  {JSON.stringify(
                    selectedLog.metadata,
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminAuditLogs;