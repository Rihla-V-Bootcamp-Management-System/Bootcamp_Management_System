import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Pencil,
  KeyRound,
  UserX,
  Trash2,
  Plus,
  MoreHorizontal,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // TOKEN
  // =========================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken")
    );
  };

  // =========================================================
  // AXIOS CONFIG
  // =========================================================

  const getConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/users`,
        getConfig()
      );

      console.log("USERS RESPONSE:", response.data);

      setUsers(response.data.users || []);
    } catch (err) {
      console.error("LOAD USERS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        `${user.name || ""} ${user.email || ""} ${
          user.role || ""
        } ${user.batchId?.name || ""}`
          .toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // =========================================================
  // ROLE LABEL
  // =========================================================

  const formatRole = (role) => {
    if (!role) return "User";

    return role
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================================================
  // ROLE DESCRIPTION
  // =========================================================

  const getRoleDescription = (role) => {
    switch (role) {
      case "admin":
        return "Administrator";

      case "superadmin":
        return "Super Administrator";

      case "mentor":
        return "Mentor";

      case "student":
        return "Student";

      default:
        return "User";
    }
  };

  // =========================================================
  // INITIAL
  // =========================================================

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/users/${user._id}`,
        getConfig()
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item._id !== user._id
        )
      );
    } catch (err) {
      console.error("DELETE USER ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete user"
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <p className="text-sm text-slate-500">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage registered users and their accounts.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={17} />

          Add Account
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================
          SEARCH / FILTER BAR
      ===================================================== */}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-md">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />

        </div>

        <div className="flex items-center gap-2">

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400"
          >
            <option value="all">
              All Roles
            </option>

            <option value="student">
              Students
            </option>

            <option value="mentor">
              Mentors
            </option>

            <option value="admin">
              Admins
            </option>

            <option value="superadmin">
              Super Admins
            </option>
          </select>

          <span className="hidden text-sm text-slate-400 sm:block">
            {filteredUsers.length} users
          </span>

        </div>

      </div>

      {/* =====================================================
          USERS TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="grid min-w-[900px] grid-cols-[2fr_1.5fr_1fr_220px] border-b border-slate-200 bg-slate-50 px-8 py-4">

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Identity
          </div>

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Role / Position
          </div>

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </div>

          <div className="text-right text-xs font-bold uppercase tracking-wide text-slate-500">
            Management
          </div>

        </div>

        {/* =================================================
            USERS
        ================================================= */}

        {filteredUsers.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <p className="text-sm font-medium text-slate-700">
              No users found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filter.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {filteredUsers.map((user) => (

              <div
                key={user._id}
                className="group grid min-w-[900px] grid-cols-[2fr_1.5fr_1fr_220px] items-center px-8 py-5 transition hover:bg-slate-50"
              >

                {/* =========================================
                    IDENTITY
                ========================================= */}

                <div className="flex items-center gap-4">

                  {/* AVATAR */}

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 ring-1 ring-slate-200">
                    {getInitial(user.name)}
                  </div>

                  {/* NAME / EMAIL */}

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {user.email}
                    </p>

                  </div>

                </div>

                {/* =========================================
                    ROLE / POSITION
                ========================================= */}

                <div>

                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {formatRole(user.role)}
                  </span>

                  <p className="mt-2 text-sm text-slate-500">
                    {getRoleDescription(user.role)}
                  </p>

                </div>

                {/* =========================================
                    STATUS
                ========================================= */}

                <div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    Active

                  </span>

                </div>

                {/* =========================================
                    MANAGEMENT
                ========================================= */}

                <div className="flex justify-end gap-2">

                  {/* EDIT */}

                  

                  {/* PASSWORD */}

                  <button
                    type="button"
                    title="Reset password"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <KeyRound size={17} />
                  </button>

                  {/* DISABLE */}

                  <button
                    type="button"
                    title="Disable user"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <UserX size={17} />
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    title="Delete user"
                    onClick={() =>
                      handleDelete(user)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={17} />
                  </button>

                  {/* MORE */}

                  <button
                    type="button"
                    title="More options"
                    className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 lg:flex"
                  >
                    <MoreHorizontal size={17} />
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Users;