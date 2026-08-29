import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  UserRound,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("mentor");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/superadmin/users");
      const data = response.data;

      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAssignUser = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    try {
      setSaving(true);

      const response = await apiClient.post("/superadmin/assign", {
        name: name.trim(),
        email: email.trim(),
        role,
      });

      const data = response.data;

      setMessage(
        data.emailSent
          ? `${role} assigned successfully and invitation email sent.`
          : `${role} assigned successfully, but invitation email failed.`
      );

      setName("");
      setEmail("");
      setRole("mentor");

      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to assign user"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (user.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (user.email || "")
          .toLowerCase()
          .includes(searchText);

      const displayRole =
        user.role === "admin"
          ? "Admin"
          : user.role === "mentor"
            ? "Mentor"
            : user.role === "superadmin"
              ? "Super Admin"
              : "Student";

      const displayStatus = user.mustResetPassword
        ? "Pending"
        : "Active";


      return (
        matchesSearch &&
        (roleFilter === "All" ||
          displayRole === roleFilter) &&
        (statusFilter === "All" ||
          displayStatus === statusFilter)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, startIndex, pageSize]);

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  const mentorCount = users.filter(
    (user) => user.role === "mentor"
  ).length;

  const superAdminCount = users.filter(
    (user) => user.role === "superadmin"
  ).length;

  const studentCount = users.filter(
    (user) => user.role === "student"
  ).length;

  const getRoleIcon = (roleValue) => {
    if (roleValue === "admin") {
      return <ShieldCheck size={16} />;
    }

    if (roleValue === "superadmin") {
      return <ShieldCheck size={16} />;
    }

    if (roleValue === "mentor") {
      return <UserRound size={16} />;
    }

    return <GraduationCap size={16} />;
  };

  const getRoleName = (roleValue) => {
    if (roleValue === "admin") return "Admin";
    if (roleValue === "mentor") return "Mentor";
    if (roleValue === "superadmin") return "Super Admin";
    return "Student";
  };

  return (
    <div className="users-page">
      <div className="users-heading">
        <div>
          <p className="users-eyebrow">
            USER MANAGEMENT
          </p>

          <h2>Users</h2>

          <p>
            Manage administrators, mentors, super administrators,
            and students in the system.
          </p>
        </div>
      </div>

      <div className="users-assign-panel">
        <div className="users-assign-header">
          <div>
            <h3>Assign User</h3>

            <p>
              Create an Admin, Mentor, or Super Admin account
              and send an invitation.
            </p>
          </div>

          <div className="users-assign-icon">
            <UserPlus size={19} />
          </div>
        </div>

        <form
          className="users-assign-form"
          onSubmit={handleAssignUser}
        >
          <div className="users-assign-field">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="users-assign-field">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="users-assign-field">
            <label>Role</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="mentor">
                Mentor
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="superadmin">
                Super Admin
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="users-assign-button"
            disabled={saving}
          >
            <UserPlus size={16} />

            {saving
              ? "Assigning..."
              : "Assign User"}
          </button>
        </form>

        {message && (
          <div className="users-assign-message">
            {message}
          </div>
        )}

        {error && (
          <div className="users-assign-error">
            {error}
          </div>
        )}
      </div>


      <div className="users-summary">
        <div className="users-summary-card">
          <div className="users-summary-icon">
            <UserRound size={18} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span>Admins</span>
            <strong>{adminCount}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon">
            <UserRound size={18} />
          </div>

          <div>
            <span>Mentors</span>
            <strong>{mentorCount}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span>Super Admins</span>
            <strong>{superAdminCount}</strong>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon">
            <GraduationCap size={18} />
          </div>

          <div>
            <span>Students</span>
            <strong>{studentCount}</strong>
          </div>
        </div>
      </div>

      <div className="users-panel">
        <div className="users-toolbar">
          <div className="users-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="users-filters">
            <div className="users-filter">
              <Filter size={16} />

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">
                  All Roles
                </option>

                <option value="Admin">
                  Admin
                </option>

                <option value="Mentor">
                  Mentor
                </option>

                <option value="Super Admin">
                  Super Admin
                </option>

                <option value="Student">
                  Student
                </option>
              </select>
            </div>

            <select
              className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] users-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Pending">
                Pending
              </option>
            </select>
          </div>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>User ID</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">
                    <div className="users-empty">
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedUsers.map((user) => {
                    const displayRole =
                      getRoleName(user.role);
                      

                    const displayStatus =
                      user.mustResetPassword
                        ? "Pending"
                        : "Active";

                    return (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {getInitials(
                                user.name
                              )}
                            </div>

                            <div className="user-details">
                              <strong>
                                {user.name}
                              </strong>

                              <span>
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`user-role role-${user.role}`}
                          >
                            {getRoleIcon(
                              user.role
                            )}

                            {displayRole}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`user-status status-${displayStatus.toLowerCase()}`}
                          >
                            <span></span>
                            {displayStatus}
                          </span>
                        </td>

                        <td>
                          {user.userID || "—"}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4">
                        <div className="users-empty">
                          No users found.
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>


        <div className="users-pagination">
          <span>
            Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="flex items-center gap-1"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={currentPage === pageNum ? "active" : ""}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminUsers;