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
  const [editingUser, setEditingUser] = useState(null);
  const [passwordResetUser, setPasswordResetUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

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

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "student",
    gender: "Male",
    batchId: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  // OPEN EDIT MODAL
  // =========================================================
  const openEditModal = (user) => {
    setEditingUser(user);

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student",
      gender: user.gender || "Male",
      batchId: user.batchId?._id || user.batchId || "",
    });
  };

  // =========================================================
  // EDIT USER
  // =========================================================
  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!editingUser) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await apiClient.put(
        `/users/${editingUser._id}`,
        {
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          role: editForm.role,
          gender: editForm.gender,
          batchId: editForm.batchId || null,
        }
      );

      toast.success("User details updated successfully!");

      setEditingUser(null);

      const updated = res.data?.user;

      if (updated) {
        setUsers((prev) =>
          prev.map((item) =>
            item._id === updated._id ? updated : item
          )
        );
      } else {
        await loadData();
      }
    } catch (err) {
      console.error("EDIT USER ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to update user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // RESET PASSWORD
  // =========================================================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!passwordResetUser) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      await apiClient.patch(
        `/users/${passwordResetUser._id}/reset-password`,
        {
          password: newPassword,
        }
      );

      toast.success(
        `Password for ${
          passwordResetUser.name || "user"
        } has been reset!`
      );

      setPasswordResetUser(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // TOGGLE USER STATUS
  // =========================================================
  const handleToggleStatus = async (user) => {
    const targetStatus =
      user.accountStatus === "disabled"
        ? "active"
        : "disabled";

    try {
      await apiClient.patch(
        `/users/${user._id}/status`,
        {
          status: targetStatus,
        }
      );

      setUsers((prev) =>
        prev.map((item) =>
          item._id === user._id
            ? {
                ...item,
                accountStatus: targetStatus,
              }
            : item
        )
      );

      toast.success(
        `User ${
          targetStatus === "active"
            ? "enabled"
            : "disabled"
        } successfully`
      );
    } catch (err) {
      console.error("TOGGLE STATUS ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================
  const confirmDelete = async () => {
    if (!userToDelete) return;

    const user = userToDelete;

    try {
      setDeleting(true);

      await apiClient.delete(`/users/${user._id}`);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item._id !== user._id
        )
      );

      toast.success(
        `${user.name || "User"} deleted successfully`
      );

      setUserToDelete(null);
    } catch (err) {
      console.error("DELETE USER ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to delete user"
      );
    } finally {
      setDeleting(false);
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
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2
            size={20}
            className="animate-spin text-slate-700"
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
          <h1 className="text-2xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage users, assign batches, reset passwords,
            and control accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
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
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">

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
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* ROLE FILTER */}
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400"
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400"
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
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="grid min-w-[900px] grid-cols-[2fr_1.5fr_1.2fr_1fr_180px] border-b border-slate-200 bg-slate-50 px-8 py-4">

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Identity
          </div>

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Role & Position
          </div>

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Assigned Batch
          </div>

          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </div>

          <div className="text-right text-xs font-bold uppercase tracking-wide text-slate-500">
            Actions
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">
              No users found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

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
                  className="group grid min-w-[900px] grid-cols-[2fr_1.5fr_1.2fr_1fr_180px] items-center px-8 py-4 transition hover:bg-slate-50"
                >

                  {/* IDENTITY */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                      {getInitial(user.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
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
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
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

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-1.5">

                    {/* EDIT */}
                    <button
                      type="button"
                      title="Edit user & assign batch"
                      onClick={() => openEditModal(user)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Edit2 size={15} />
                    </button>

                    {/* RESET PASSWORD */}
                    <button
                      type="button"
                      title="Reset password"
                      onClick={() => {
                        setPasswordResetUser(user);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <KeyRound size={15} />
                    </button>

                    {/* TOGGLE STATUS */}
                    <button
                      type="button"
                      title={
                        isDisabled
                          ? "Enable account"
                          : "Disable account"
                      }
                      onClick={() =>
                        handleToggleStatus(user)
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                        isDisabled
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      {isDisabled ? (
                        <UserCheck size={15} />
                      ) : (
                        <UserX size={15} />
                      )}
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      title="Delete user"
                      onClick={() =>
                        setUserToDelete(user)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
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
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Add User Account
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* ROLE + GENDER */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
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
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
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
                <label className="mb-1 block text-xs font-semibold text-slate-700">
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
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
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
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
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
          EDIT USER MODAL
      ========================================================= */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit User & Batch
                </h3>

                <p className="text-xs text-slate-500">
                  Update account details or assign/reassign batch
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingUser(null)
                }
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* PRIVILEGE ALERT */}
            {(editingUser?.role === "admin" ||
              editingUser?.role === "superadmin") &&
              !isSuperAdmin && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <ShieldAlert
                    size={16}
                    className="shrink-0 text-amber-600"
                  />

                  <span>
                    <strong>
                      Superadmin Privilege:
                    </strong>{" "}
                    Updating the role or assigned batch
                    for Admin accounts requires
                    Superadmin privilege.
                  </span>
                </div>
              )}

            <form
              onSubmit={handleEditUser}
              className="mt-4 space-y-4"
            >

              {/* NAME */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      email: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* ROLE + GENDER */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Role
                  </label>

                  <select
                    value={editForm.role}
                    disabled={
                      !isSuperAdmin &&
                      (editingUser?.role === "admin" ||
                        editingUser?.role ===
                          "superadmin")
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                    <option value="superadmin">
                      Superadmin
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Gender
                  </label>

                  <select
                    value={editForm.gender}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        gender: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
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
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Assigned Batch{" "}
                  {!isSuperAdmin &&
                  (editingUser?.role === "admin" ||
                    editingUser?.role === "superadmin")
                    ? "(Superadmin Only)"
                    : ""}
                </label>

                <select
                  value={editForm.batchId}
                  disabled={
                    !isSuperAdmin &&
                    (editingUser?.role === "admin" ||
                      editingUser?.role === "superadmin")
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      batchId: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-800 focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">
                    No Batch (Unassigned)
                  </option>

                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setEditingUser(null)
                  }
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}

                  {submitting
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          RESET PASSWORD MODAL
      ========================================================= */}
      {passwordResetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setPasswordResetUser(null)
          }
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">

              <div className="flex items-center gap-2 text-slate-900">
                <KeyRound
                  size={18}
                  className="text-blue-600"
                />

                <h3 className="text-base font-bold">
                  Reset User Password
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPasswordResetUser(null)
                }
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Set a new password for{" "}
              <strong>
                {passwordResetUser.name}
              </strong>{" "}
              ({passwordResetUser.email}).
            </p>

            <form
              onSubmit={handleResetPassword}
              className="mt-4 space-y-3"
            >

              {/* NEW PASSWORD */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  New Password *
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* CONFIRM */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Confirm Password *
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-800 focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">

                <button
                  type="button"
                  onClick={() =>
                    setPasswordResetUser(null)
                  }
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <KeyRound size={14} />
                  )}

                  {submitting
                    ? "Resetting..."
                    : "Set Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          DELETE CONFIRMATION MODAL
      ========================================================= */}
      {userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setUserToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center gap-3 text-red-600">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle size={24} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete User
                </h3>

                <p className="text-xs text-slate-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">
                {userToDelete.name}
              </strong>{" "}
              ({formatRole(userToDelete.role)})?
              All access and related data for this
              user will be removed.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setUserToDelete(null)
                }
                disabled={deleting}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;