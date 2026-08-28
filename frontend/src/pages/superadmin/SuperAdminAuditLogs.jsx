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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  // =========================================================
  // LOAD AUDIT LOGS
  // =========================================================
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        setError("");

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
        console.error("LOAD AUDIT LOGS ERROR:", err);

        setError(
          err.message || "Failed to load audit logs"
        );
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  // =========================================================
  // ACTIVITY TYPE
  // =========================================================
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

  // =========================================================
  // ACTIVITY ICON
  // =========================================================
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

  // =========================================================
  // FILTER LOGS
  // =========================================================
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const type = getType(log.action);

      const searchText = search.toLowerCase().trim();

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
        typeFilter === "All" ||
        type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [logs, search, typeFilter]);

  // =========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =========================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  // =========================================================
  // PAGINATION
  // =========================================================
  const totalPages =
    Math.ceil(filteredLogs.length / pageSize) || 1;

  const startIndex =
    (currentPage - 1) * pageSize;

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [filteredLogs, startIndex, pageSize]);

  // =========================================================
  // STATISTICS
  // =========================================================
  const authenticationCount = logs.filter(
    (log) =>
      getType(log.action) === "Authentication"
  ).length;

  const registrationCount = logs.filter(
    (log) =>
      getType(log.action) === "Registration"
  ).length;

  const userManagementCount = logs.filter(
    (log) =>
      getType(log.action) === "User Management"
  ).length;

  const systemCount = logs.filter(
    (log) =>
      getType(log.action) === "System"
  ).length;

  // =========================================================
  // DATE FORMAT
  // =========================================================
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  };

  // =========================================================
  // TIME FORMAT
  // =========================================================
  const formatTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="audit-page">
        <div className="audit-heading">
          <div>
            <p className="audit-eyebrow">
              SYSTEM MONITORING
            </p>

            <h2>Audit Logs</h2>

            <p>
              Track important activity across the system.
            </p>
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

  // =========================================================
  // ERROR
  // =========================================================
  if (error) {
    return (
      <div className="audit-page">
        <div className="audit-heading">
          <div>
            <p className="audit-eyebrow">
              SYSTEM MONITORING
            </p>

            <h2>Audit Logs</h2>

            <p>
              Track important activity across the system.
            </p>
          </div>
        </div>

        <div className="audit-panel">
          <div className="audit-empty">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div
      className="audit-page"
      onClick={() => setOpenMenuId(null)}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="audit-heading">
        <div>
          <p className="audit-eyebrow">
            SYSTEM MONITORING
          </p>

          <h2>Audit Logs</h2>

          <p>
            Track important activity across the system.
          </p>
        </div>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}
      <div className="audit-stats">
        {/* TOTAL */}
        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span>Total Activities</span>
            <strong>{logs.length}</strong>
          </div>
        </div>

        {/* USER MANAGEMENT */}
        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <UserCog size={18} />
          </div>

          <div>
            <span>User Management</span>
            <strong>
              {userManagementCount}
            </strong>
          </div>
        </div>

        {/* REGISTRATION */}
        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <FileText size={18} />
          </div>

          <div>
            <span>Registrations</span>
            <strong>
              {registrationCount}
            </strong>
          </div>
        </div>

        {/* AUTHENTICATION */}
        <div className="audit-stat-card">
          <div className="audit-stat-icon">
            <LogIn size={18} />
          </div>

          <div>
            <span>Authentication</span>
            <strong>
              {authenticationCount}
            </strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          AUDIT PANEL
      ===================================================== */}
      <div className="audit-panel">

        {/* ===================================================
            TOOLBAR
        =================================================== */}
        <div className="audit-toolbar">

          {/* SEARCH */}
          <div className="audit-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search activity..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onClick={(e) =>
                e.stopPropagation()
              }
            />
          </div>

          {/* FILTER */}
          <div className="audit-filter">
            <Filter size={16} />

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <option value="All">
                All Activity
              </option>

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

        {/* ===================================================
            TABLE
        =================================================== */}
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
              {paginatedLogs.map((log) => {
                const type = getType(log.action);

                return (
                  <tr key={log._id}>

                    {/* ADMINISTRATOR */}
                    <td>
                      <div className="audit-user">

                        <div className="audit-avatar">
                          {(log.actor?.name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {log.actor?.name ||
                              "Unknown"}
                          </strong>

                          <span>
                            {log.actor?.email ||
                              "—"}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* ACTIVITY */}
                    <td>
                      <div className="audit-action">

                        <div className="audit-action-icon">
                          {getIcon(type)}
                        </div>

                        <span>
                          {log.action ||
                            "Activity"}
                        </span>

                      </div>
                    </td>

                    {/* DESCRIPTION */}
                    <td>
                      {log.description || "—"}
                    </td>

                    {/* TYPE */}
                    <td>
                      <span className="audit-type">
                        {type}
                      </span>
                    </td>

                    {/* DATE */}
                    <td>
                      <div className="audit-date">

                        <strong>
                          {formatDate(
                            log.createdAt
                          )}
                        </strong>

                        <span>
                          {formatTime(
                            log.createdAt
                          )}
                        </span>

                      </div>
                    </td>

                    {/* ACTION */}
                    <td
                      className="audit-action-cell"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <button
                        type="button"
                        className="audit-action-button"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId ===
                              log._id
                              ? null
                              : log._id
                          )
                        }
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>

                      {openMenuId === log._id && (
                        <div className="audit-action-menu">

                          <button
                            type="button"
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

              {/* EMPTY */}
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

        {/* ===================================================
            PAGINATION
        =================================================== */}
        <div className="audit-pagination">

          <span>
            Showing{" "}
            {filteredLogs.length === 0
              ? 0
              : startIndex + 1}{" "}
            to{" "}
            {Math.min(
              startIndex + pageSize,
              filteredLogs.length
            )}{" "}
            of {filteredLogs.length} activities
          </span>

          <div className="flex items-center gap-1">

            {/* PREVIOUS */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              className="flex items-center gap-1"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            {/* PAGE NUMBERS */}
            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={
                  currentPage === pageNum
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(pageNum)
                }
              >
                {pageNum}
              </button>
            ))}

            {/* NEXT */}
            <button
              type="button"
              disabled={
                currentPage >= totalPages
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    totalPages
                  )
                )
              }
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight size={15} />
            </button>

          </div>
        </div>
      </div>

      {/* =====================================================
          ACTIVITY DETAILS MODAL
      ===================================================== */}
      {selectedLog && (
        <div
          className="audit-details-overlay"
          onClick={() =>
            setSelectedLog(null)
          }
        >
          <div
            className="audit-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}
            <div className="audit-details-header">

              <div>
                <p className="audit-eyebrow">
                  AUDIT ACTIVITY
                </p>

                <h3>
                  Activity Details
                </h3>
              </div>

              <button
                type="button"
                className="audit-details-close"
                onClick={() =>
                  setSelectedLog(null)
                }
              >
                <X size={18} />
              </button>

            </div>

            {/* DETAILS GRID */}
            <div className="audit-details-grid">

              <div>
                <span>
                  Administrator
                </span>

                <strong>
                  {selectedLog.actor?.name ||
                    "Unknown"}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {selectedLog.actor?.email ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>Action</span>

                <strong>
                  {selectedLog.action ||
                    "Activity"}
                </strong>
              </div>

              <div>
                <span>Type</span>

                <strong>
                  {getType(
                    selectedLog.action
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Target Type
                </span>

                <strong>
                  {selectedLog.targetType ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Target ID
                </span>

                <strong>
                  {selectedLog.targetId ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>Date</span>

                <strong>
                  {formatDate(
                    selectedLog.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Time</span>

                <strong>
                  {formatTime(
                    selectedLog.createdAt
                  )}
                </strong>
              </div>

            </div>

            {/* DESCRIPTION */}
            <div className="audit-details-description">

              <span>
                Description
              </span>

              <p>
                {selectedLog.description ||
                  "No description available."}
              </p>

            </div>

            {/* METADATA */}
            {selectedLog.metadata && (
              <div className="audit-details-description">

                <span>
                  Metadata
                </span>

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