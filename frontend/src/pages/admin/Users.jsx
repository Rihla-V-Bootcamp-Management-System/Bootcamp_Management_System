import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  Plus,
  Edit2,
  Layers,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import useAuth from "../../context/useAuth";

function Users() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "superadmin";

  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // MODALS
  // =========================================================
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToWarn, setUserToWarn] = useState(null);
  const [userToSuspend, setUserToSuspend] = useState(null);

  // =========================================================
  // REASONS
  // =========================================================
  const [warningReason, setWarningReason] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");

  // =========================================================
  // FORMS
  // =========================================================
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    gender: "Male",
    batchId: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [warningSubmitting, setWarningSubmitting] = useState(false);
  const [suspendingSubmitting, setSuspendingSubmitting] = useState(false);

  // =========================================================
  // LOAD USERS & BATCHES
  // =========================================================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [usersRes, batchesRes] = await Promise.allSettled([
        apiClient.get("/users?limit=100"),
        apiClient.get("/batches"),
      ]);

      // USERS
      if (usersRes.status === "fulfilled") {
        const userData = usersRes.value.data;

        setUsers(
          userData?.users ||
            userData?.data ||
            (Array.isArray(userData) ? userData : [])
        );
      } else {
        throw new Error(
          usersRes.reason?.response?.data?.message ||
            usersRes.reason?.message ||
            "Failed to load users"
        );
      }

      // BATCHES
      if (batchesRes.status === "fulfilled") {
        const batchData = batchesRes.value.data;

        const batchList =
          batchData?.batches ||
          batchData?.data ||
          (Array.isArray(batchData) ? batchData : []);

        setBatches(batchList);
      } else {
        console.warn(
          "BATCHES LOAD ERROR:",
          batchesRes.reason?.response?.data?.message ||
            batchesRes.reason?.message
        );

        setBatches([]);
      }
    } catch (err) {
      console.error("LOAD DATA ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =========================================================
  // FILTER USERS
  // =========================================================
  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) => {
      const batchName =
        user.batchId?.name ||
        (typeof user.batchId === "string" ? user.batchId : "");

      const matchesSearch =
        !query ||
        `${user.name || ""} ${user.email || ""} ${
          user.role || ""
        } ${batchName}`
          .toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const userBatchId =
        user.batchId?._id || user.batchId || "";

      const matchesBatch =
        batchFilter === "all" ||
        (batchFilter === "unassigned"
          ? !userBatchId
          : userBatchId === batchFilter);

      return matchesSearch && matchesRole && matchesBatch;
    });
  }, [users, search, roleFilter, batchFilter]);

  // =========================================================
  // ADD USER
  // =========================================================
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (
      !addForm.name.trim() ||
      !addForm.email.trim() ||
      !addForm.password.trim()
    ) {
      toast.error("Name, email, and password are required.");
      return;
    }

    if (addForm.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await apiClient.post("/users", {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        password: addForm.password,
        role: addForm.role,
        gender: addForm.gender,
        batchId: addForm.batchId || undefined,
      });

      toast.success("User account created successfully!");

      setShowAddModal(false);

      setAddForm({
        name: "",
        email: "",
        password: "",
        role: "student",
        gender: "Male",
        batchId: "",
      });

      if (res.data?.user) {
        setUsers((prev) => [res.data.user, ...prev]);
      } else {
        await loadData();
      }
    } catch (err) {
      console.error("ADD USER ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to create user"
      );
    } finally {
      setSubmitting(false);
    }
  };



  // =========================================================
  // SUSPEND / ACTIVATE USER (WITH MANDATORY REASON FOR SUSPEND)
  // =========================================================
  const handleToggleStatusClick = (user) => {
    const isCurrentlyDisabled = user.accountStatus === "suspended" || user.accountStatus === "disabled";
    if (isCurrentlyDisabled) {
      // Direct activate
      handleConfirmStatusChange(user, "active", "Account reactivated by administrator");
    } else {
      // Open modal to get mandatory suspension reason
      setUserToSuspend(user);
      setSuspensionReason("");
    }
  };

  const handleConfirmStatusChange = async (user, targetStatus, reasonText) => {
    try {
      setSuspendingSubmitting(true);

      const res = await apiClient.patch(
        `/users/${user._id}/status`,
        {
          status: targetStatus,
          reason: reasonText,
        }
      );

      setUsers((prev) =>
        prev.map((item) =>
          item._id === user._id
            ? {
                ...item,
                accountStatus: targetStatus,
                suspensionReason: targetStatus === "suspended" || targetStatus === "disabled" ? reasonText : "",
              }
            : item
        )
      );

      toast.success(
        res.data?.message || `User account ${targetStatus === "active" ? "activated" : "suspended"} successfully.`
      );

      setUserToSuspend(null);
      setSuspensionReason("");
    } catch (err) {
      console.error("TOGGLE STATUS ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to update status"
      );
    } finally {
      setSuspendingSubmitting(false);
    }
  };

  // =========================================================
  // ISSUE WARNING (WITH MANDATORY REASON & EMAIL NOTIFICATION)
  // =========================================================
  const handleIssueWarning = async (e) => {
    e.preventDefault();
    if (!userToWarn) return;

    if (!warningReason.trim()) {
      toast.error("A reason is mandatory when issuing an official warning.");
      return;
    }

    try {
      setWarningSubmitting(true);

      const res = await apiClient.post(`/users/${userToWarn._id}/warn`, {
        reason: warningReason.trim(),
      });

      toast.success(
        res.data?.message || "Official warning issued and notification email sent."
      );

      setUserToWarn(null);
      setWarningReason("");
      await loadData();
    } catch (err) {
      console.error("ISSUE WARNING ERROR:", err);
      toast.error(
        err.response?.data?.message || "Failed to issue warning"
      );
    } finally {
      setWarningSubmitting(false);
    }
  };



  // =========================================================
  // HELPERS
  // =========================================================
  const formatRole = (role) => {
    if (!role) return "User";

    return role
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2
            size={20}
            className="animate-spin text-slate-700 dark:text-slate-200"
          />
          Loading users...
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage users, assign batches, reset passwords,
            and control accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#185848]"
        >
          <Plus size={17} />
          Add Account
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* SEARCH / FILTER BAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-4 shadow-sm md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search by name, email, role, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:bg-[#0b1528]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* ROLE FILTER */}
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-slate-400"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="mentor">Mentors</option>
            <option value="admin">Admins</option>
            <option value="superadmin">
              Super Admins
            </option>
          </select>

          {/* BATCH FILTER */}
          <select
            value={batchFilter}
            onChange={(e) =>
              setBatchFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-slate-400"
          >
            <option value="all">All Batches</option>
            <option value="unassigned">
              Unassigned
            </option>

            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>

          <span className="hidden text-xs font-semibold text-slate-400 sm:block">
            {filteredUsers.length} users
          </span>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

        <div className="grid min-w-[900px] grid-cols-[2fr_1.5fr_1.2fr_1fr_180px] border-b border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-8 py-4">

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Identity
          </div>

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Role & Position
          </div>

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Assigned Batch
          </div>

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Status
          </div>

          <div className="text-right text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Actions
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              No users found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#15253f]">

            {filteredUsers.map((user) => {
              const isDisabled =
                user.accountStatus === "disabled";

              const batchName =
                user.batchId?.name ||
                (typeof user.batchId === "string"
                  ? user.batchId
                  : null);

              return (
                <div
                  key={user._id}
                  className="group grid min-w-[900px] grid-cols-[2fr_1.5fr_1.2fr_1fr_180px] items-center px-8 py-4 transition hover:bg-slate-50 dark:bg-[#070e1b]"
                >

                  {/* IDENTITY */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#070e1b] text-sm font-bold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200">
                      {getInitial(user.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* ROLE */}
                  <div>
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                        user.role === "admin" ||
                        user.role === "superadmin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "mentor"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {formatRole(user.role)}
                    </span>
                  </div>

                  {/* BATCH */}
                  <div>
                    {batchName ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-[#e5f1ed] px-2.5 py-1 text-xs font-semibold text-[#185848]">
                        <Layers size={13} />
                        {batchName}
                      </span>
                    ) : (
                      <span className="text-xs italic text-slate-400">
                        Unassigned
                      </span>
                    )}
                  </div>

                  {/* STATUS */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isDisabled
                          ? "border border-amber-200 bg-amber-50 text-amber-700"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isDisabled
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />

                      {isDisabled ? "Disabled" : "Active"}
                    </span>
                  </div>

                  {/* ACTIONS: WARNING, SUSPEND/ACTIVATE */}
                  <div className="flex justify-end gap-1.5">

                    {/* ISSUE WARNING */}
                    <button
                      type="button"
                      title={`Issue Official Warning (${user.warnings?.length || 0} issued)`}
                      onClick={() => {
                        setUserToWarn(user);
                        setWarningReason("");
                      }}
                      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                      <AlertTriangle size={15} />
                      {user.warnings?.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                          {user.warnings.length}
                        </span>
                      )}
                    </button>

                    {/* SUSPEND / ACTIVATE */}
                    <button
                      type="button"
                      title={
                        isDisabled
                          ? "Reactivate account"
                          : "Suspend account (Reason required)"
                      }
                      onClick={() =>
                        handleToggleStatusClick(user)
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                        isDisabled
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-[#15253f] dark:bg-[#0b1528] dark:text-slate-300"
                      }`}
                    >
                      {isDisabled ? (
                        <UserCheck size={15} />
                      ) : (
                        <UserX size={15} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          ADD USER MODAL
      ========================================================= */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b1528] p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#15253f] pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add User Account
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:bg-[#070e1b] hover:text-slate-700 dark:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleAddUser}
              className="mt-5 space-y-4"
            >

              {/* NAME */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Full Name *
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Kebede"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      name: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-3.5 text-xs text-slate-800 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Email Address *
                </label>

                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      email: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-3.5 text-xs text-slate-800 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Initial Password *
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={addForm.password}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      password: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-3.5 text-xs text-slate-800 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* ROLE + GENDER */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Role *
                  </label>

                  <select
                    value={addForm.role}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        role: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-3 text-xs text-slate-800 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="student">
                      Student
                    </option>
                    <option value="mentor">
                      Mentor
                    </option>
                    <option value="admin">
                      Admin
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Gender *
                  </label>

                  <select
                    value={addForm.gender}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        gender: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-3 text-xs text-slate-800 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">
                      Female
                    </option>
                  </select>
                </div>
              </div>

              {/* BATCH */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Assign to Batch (Optional)
                </label>

                <select
                  value={addForm.batchId}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      batchId: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#15253f] px-3 text-xs text-slate-800 dark:text-slate-100 focus:border-slate-900 focus:outline-none"
                >
                  <option value="">
                    No Batch Assigned
                  </option>

                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2.5 border-t border-slate-100 dark:border-[#15253f] pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#070e1b]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1f6f5b] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#185848] disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Plus size={14} />
                  )}

                  {submitting
                    ? "Creating..."
                    : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* =========================================================
          ISSUE WARNING MODAL (MANDATORY REASON + EMAIL NOTIFICATION)
      ========================================================= */}
      {userToWarn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setUserToWarn(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0b1528] p-6 shadow-2xl border border-amber-200 dark:border-amber-900/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#15253f] pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Issue Official Warning
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setUserToWarn(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#070e1b]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Issuing an official warning to <strong>{userToWarn.name}</strong> ({userToWarn.email}).
              A formal notice with the reason below will be emailed directly to the student.
            </p>

            <form onSubmit={handleIssueWarning} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Mandatory Warning Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Unexcused absence from mandatory bootcamp session, missed assignment deadline..."
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-3 text-xs text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 dark:border-[#15253f] pt-3">
                <button
                  type="button"
                  onClick={() => setUserToWarn(null)}
                  disabled={warningSubmitting}
                  className="rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#070e1b]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={warningSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                >
                  {warningSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  {warningSubmitting ? "Dispatching..." : "Send Warning Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          SUSPEND USER MODAL (MANDATORY REASON + EMAIL NOTIFICATION)
      ========================================================= */}
      {userToSuspend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setUserToSuspend(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0b1528] p-6 shadow-2xl border border-red-200 dark:border-red-900/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#15253f] pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <UserX size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Suspend User Account
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setUserToSuspend(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#070e1b]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Suspending <strong>{userToSuspend.name}</strong> will revoke access to sessions, assignments, and curriculum.
              A formal suspension email will be sent with your reason.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!suspensionReason.trim()) {
                  toast.error("Please enter a mandatory suspension reason.");
                  return;
                }
                handleConfirmStatusChange(userToSuspend, "suspended", suspensionReason.trim());
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Mandatory Reason for Suspension *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Code of conduct violation, multiple unanswered warnings, non-attendance..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-3 text-xs text-slate-800 dark:text-slate-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 dark:border-[#15253f] pt-3">
                <button
                  type="button"
                  onClick={() => setUserToSuspend(null)}
                  disabled={suspendingSubmitting}
                  className="rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#070e1b]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={suspendingSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {suspendingSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserX size={14} />
                  )}
                  {suspendingSubmitting ? "Suspending..." : "Confirm Suspension"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;