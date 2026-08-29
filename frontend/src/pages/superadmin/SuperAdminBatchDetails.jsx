import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Users,
  UserCheck,
  Mail,
  CalendarDays,
  Layers,
  ShieldCheck,
  RefreshCw,
  Edit,
  Save,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Mars,
  Venus,
  UsersRound,
} from "lucide-react";

import apiClient from "../../services/apiClient";

// =========================================================
// SUPER ADMIN BATCH DETAILS
// =========================================================

function SuperAdminBatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [batch, setBatch] = useState(null);

  const [statistics, setStatistics] = useState({
    totalUsers: 0,

    students: {
      total: 0,
      male: 0,
      female: 0,
    },

    mentors: {
      total: 0,
      male: 0,
      female: 0,
    },

    admins: {
      total: 0,
      male: 0,
      female: 0,
    },

    gender: {
      male: 0,
      female: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // =========================================================
  // USER FILTERS
  // =========================================================

  const [userSearch, setUserSearch] = useState("");
  const [activeRole, setActiveRole] = useState("students");
  const [activeGender, setActiveGender] = useState("all");

  // =========================================================
  // PAGINATION
  // =========================================================

  const [userPage, setUserPage] = useState(1);

  const USER_LIMIT = 8;

  // =========================================================
  // FORM
  // =========================================================

  const [form, setForm] = useState({
    name: "",
    year: "",
    season: "",
    startDate: "",
    endDate: "",

    // Batch status
    status: "Upcoming",
  });

  // =========================================================
  // LOAD BATCH
  // =========================================================

  const loadBatch = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(`/batches/${id}`);

      const batchData =
        response.data?.batch ||
        response.data?.data ||
        response.data;

      setBatch(batchData);

      if (response.data?.statistics) {
        setStatistics({
          totalUsers:
            response.data.statistics.totalUsers || 0,

          students: {
            total:
              response.data.statistics.students?.total || 0,
            male:
              response.data.statistics.students?.male || 0,
            female:
              response.data.statistics.students?.female || 0,
          },

          mentors: {
            total:
              response.data.statistics.mentors?.total || 0,
            male:
              response.data.statistics.mentors?.male || 0,
            female:
              response.data.statistics.mentors?.female || 0,
          },

          admins: {
            total:
              response.data.statistics.admins?.total || 0,
            male:
              response.data.statistics.admins?.male || 0,
            female:
              response.data.statistics.admins?.female || 0,
          },

          gender: {
            male:
              response.data.statistics.gender?.male || 0,
            female:
              response.data.statistics.gender?.female || 0,
          },
        });
      }

      // Fill edit form
      setForm({
        name: batchData?.name || "",
        year: batchData?.year || "",
        season: batchData?.season || "",
        startDate: formatDateForInput(batchData?.startDate),
        endDate: formatDateForInput(batchData?.endDate),

        // Status
        status: batchData?.status || "Upcoming",
      });
    } catch (error) {
      console.error("Load batch details error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load batch details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatch();
  }, [id]);

  // =========================================================
  // FORMAT DATE FOR INPUT
  // =========================================================

  function formatDateForInput(date) {
    if (!date) return "";

    return new Date(date)
      .toISOString()
      .split("T")[0];
  }

  // =========================================================
  // DISPLAY DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // START EDITING
  // =========================================================

  const handleEdit = () => {
    setError("");
    setSuccess("");

    setForm({
      name: batch?.name || "",
      year: batch?.year || "",
      season: batch?.season || "",
      startDate: formatDateForInput(batch?.startDate),
      endDate: formatDateForInput(batch?.endDate),

      // Status
      status: batch?.status || "Upcoming",
    });

    setIsEditing(true);
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancel = () => {
    setError("");
    setSuccess("");

    setIsEditing(false);

    setForm({
      name: batch?.name || "",
      year: batch?.year || "",
      season: batch?.season || "",
      startDate: formatDateForInput(batch?.startDate),
      endDate: formatDateForInput(batch?.endDate),

      // Status
      status: batch?.status || "Upcoming",
    });
  };

  // =========================================================
  // SAVE BATCH
  // =========================================================

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Batch name is required.");
      return;
    }

    if (!form.year) {
      setError("Year is required.");
      return;
    }

    if (!form.season) {
      setError("Season is required.");
      return;
    }

    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }

    if (!form.endDate) {
      setError("End date is required.");
      return;
    }

    if (
      new Date(form.startDate) >=
      new Date(form.endDate)
    ) {
      setError("End date must be after start date.");
      return;
    }

    // Make sure status is valid
    const allowedStatuses = [
      "Upcoming",
      "Active",
      "Completed",
    ];

    if (!allowedStatuses.includes(form.status)) {
      setError("Invalid batch status.");
      return;
    }

    try {
      setSaving(true);

      const response = await apiClient.put(
        `/batches/${id}`,
        {
          name: form.name.trim(),
          year: Number(form.year),
          season: form.season,
          startDate: form.startDate,
          endDate: form.endDate,

          // Status sent to backend
          status: form.status,
        }
      );

      const updatedBatch =
        response.data?.batch ||
        response.data?.data;

      if (updatedBatch) {
        setBatch(updatedBatch);
      } else {
        await loadBatch();
      }

      setSuccess("Batch updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Update batch error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update batch."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // USERS
  // =========================================================

  const students = batch?.studentIds || [];
  const mentors = batch?.mentorIds || [];
  const admins = batch?.adminIds || [];

  // =========================================================
  // CURRENT ROLE USERS
  // =========================================================

  const currentMembers =
    activeRole === "students"
      ? students
      : activeRole === "mentors"
      ? mentors
      : admins;

  // =========================================================
  // GENDER COUNTS
  // =========================================================

  const currentGenderStatistics = useMemo(() => {
    const male = currentMembers.filter(
      (member) =>
        String(member?.gender || "").toLowerCase() ===
        "male"
    ).length;

    const female = currentMembers.filter(
      (member) =>
        String(member?.gender || "").toLowerCase() ===
        "female"
    ).length;

    return {
      all: currentMembers.length,
      male,
      female,
    };
  }, [currentMembers]);

  // =========================================================
  // SEARCH + GENDER FILTER
  // =========================================================

  const filteredMembers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    return currentMembers.filter((member) => {
      const matchesSearch =
        !search ||
        member?.name
          ?.toLowerCase()
          .includes(search) ||
        member?.email
          ?.toLowerCase()
          .includes(search);

      const memberGender = String(
        member?.gender || ""
      ).toLowerCase();

      const matchesGender =
        activeGender === "all" ||
        memberGender === activeGender;

      return matchesSearch && matchesGender;
    });
  }, [
    currentMembers,
    userSearch,
    activeGender,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalUserPages = Math.max(
    Math.ceil(
      filteredMembers.length / USER_LIMIT
    ),
    1
  );

  const paginatedMembers =
    filteredMembers.slice(
      (userPage - 1) * USER_LIMIT,
      userPage * USER_LIMIT
    );

  // =========================================================
  // ROLE CHANGE
  // =========================================================

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setActiveGender("all");
    setUserPage(1);
    setUserSearch("");
  };

  // =========================================================
  // GENDER CHANGE
  // =========================================================

  const handleGenderChange = (gender) => {
    setActiveGender(gender);
    setUserPage(1);
  };

  // =========================================================
  // USER PAGE CHANGE
  // =========================================================

  const handleUserPageChange = (page) => {
    if (
      page < 1 ||
      page > totalUserPages
    ) {
      return;
    }

    setUserPage(page);
  };

  // =========================================================
  // RESET PAGE WHEN SEARCH CHANGES
  // =========================================================

  useEffect(() => {
    setUserPage(1);
  }, [userSearch]);

  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  const getUserPageNumbers = () => {
    const pages = [];

    const start = Math.max(
      1,
      userPage - 2
    );

    const end = Math.min(
      totalUserPages,
      userPage + 2
    );

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-[#1f6f5b] text-white";

      case "Completed":
        return "bg-gray-700 text-white";

      case "Upcoming":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />

        <div className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#070e1b]" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#070e1b]" />
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#070e1b]" />
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#070e1b]" />
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !batch) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() =>
            navigate("/superadmin/batches")
          }
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-slate-900 dark:text-white"
        >
          <ArrowLeft size={18} />
          Back to Batches
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-700">
            Unable to load batch
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadBatch}
            className="mt-5 flex items-center gap-2 rounded-lg bg-[#1f6f5b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#185848]"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-10 text-center">
        Batch not found
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        onClick={() =>
          navigate("/superadmin/batches")
        }
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-slate-900 dark:text-white"
      >
        <ArrowLeft size={18} />
        Back to Batches
      </button>

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* =================================================
          BATCH HEADER
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f6f5b] text-white">
              <Layers size={28} />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {batch.name}
                </h1>

                <span className="rounded-full bg-gray-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-bold text-gray-700 dark:text-slate-200">
                  Batch #{batch.year}
                </span>

                {/* STATUS */}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                    batch.status
                  )}`}
                >
                  {batch.status || "Upcoming"}
                </span>

              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-slate-400">

                <span>
                  Year: {batch.year || "—"}
                </span>

                <span>
                  {batch.season || "—"}
                </span>

              </div>

            </div>

          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-lg bg-[#1f6f5b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#185848]"
            >
              <Edit size={17} />
              Edit Batch
            </button>
          )}

        </div>

      </div>

      {/* =================================================
          EDIT FORM
      ================================================= */}

      {isEditing && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm"
        >

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Batch
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Update batch information.
              </p>

            </div>

            <Edit
              size={22}
              className="text-gray-500 dark:text-slate-400"
            />

          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

            <FormInput
              label="Batch Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={saving}
            />

            <FormInput
              label="Year"
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              disabled={saving}
            />

            {/* SEASON */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                Season
              </label>

              <select
                name="season"
                value={form.season}
                onChange={handleChange}
                disabled={saving}
                className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] h-12 w-full rounded-lg border border-gray-300 dark:border-[#15253f] px-4 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
              >
                <option value="">
                  Select season
                </option>

                <option value="Spring">
                  Spring
                </option>

                <option value="Summer">
                  Summer
                </option>

                <option value="Fall">
                  Fall
                </option>

                <option value="Winter">
                  Winter
                </option>
              </select>
            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={saving}
                className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] h-12 w-full rounded-lg border border-gray-300 dark:border-[#15253f] px-4 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
              >
                <option value="Upcoming">
                  Upcoming
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>

              <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400">
                Set the current lifecycle status of this batch.
              </p>
            </div>

            <FormInput
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              disabled={saving}
            />

            <FormInput
              label="End Date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              disabled={saving}
            />

          </div>

          <div className="mt-8 flex justify-end gap-3">

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-[#15253f] px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070e1b]"
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#185848] disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>
      )}

      {/* =================================================
          OVERALL STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <SummaryCard
          title="Total Users"
          value={statistics.totalUsers}
          icon={Users}
        />

        <SummaryCard
          title="Students"
          value={statistics.students.total}
          icon={Users}
        />

        <SummaryCard
          title="Mentors"
          value={statistics.mentors.total}
          icon={UserCheck}
        />

        <SummaryCard
          title="Admins"
          value={statistics.admins.total}
          icon={ShieldCheck}
        />

      </div>

      {/* =================================================
          BATCH INFORMATION
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Batch Information
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

          <InfoItem
            icon={CalendarDays}
            label="Start Date"
            value={formatDate(batch.startDate)}
          />

          <InfoItem
            icon={CalendarDays}
            label="End Date"
            value={formatDate(batch.endDate)}
          />

          <InfoItem
            icon={CalendarDays}
            label="Created At"
            value={formatDate(batch.createdAt)}
          />

          <InfoItem
            icon={Layers}
            label="Batch ID"
            value={batch._id}
          />

        </div>

      </div>

      {/* =================================================
          BATCH USERS
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Batch Users
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              View and filter users assigned to this batch.
            </p>

          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:w-80">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={userSearch}
              onChange={(e) =>
                setUserSearch(e.target.value)
              }
              placeholder="Search name or email..."
              className="h-11 w-full rounded-lg border border-gray-300 dark:border-[#15253f] pl-10 pr-4 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
            />

          </div>

        </div>

        {/* ROLE TABS */}

        <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-[#15253f] pb-4">

          <RoleTab
            active={activeRole === "students"}
            onClick={() =>
              handleRoleChange("students")
            }
            label="Students"
            count={students.length}
            icon={Users}
          />

          <RoleTab
            active={activeRole === "mentors"}
            onClick={() =>
              handleRoleChange("mentors")
            }
            label="Mentors"
            count={mentors.length}
            icon={UserCheck}
          />

          <RoleTab
            active={activeRole === "admins"}
            onClick={() =>
              handleRoleChange("admins")
            }
            label="Admins"
            count={admins.length}
            icon={ShieldCheck}
          />

        </div>

        {/* GENDER STATISTICS */}

        <div className="mt-5">

          <div className="mb-3">

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Gender Statistics
            </h3>

            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Click a gender to filter the users below.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            <GenderFilterButton
              active={activeGender === "all"}
              onClick={() =>
                handleGenderChange("all")
              }
              label="All Users"
              value={currentGenderStatistics.all}
              icon={UsersRound}
            />

            <GenderFilterButton
              active={activeGender === "male"}
              onClick={() =>
                handleGenderChange("male")
              }
              label="Male"
              value={currentGenderStatistics.male}
              icon={Mars}
            />

            <GenderFilterButton
              active={activeGender === "female"}
              onClick={() =>
                handleGenderChange("female")
              }
              label="Female"
              value={currentGenderStatistics.female}
              icon={Venus}
            />

          </div>

        </div>

        {/* FILTER INFO */}

        <div className="mt-5 flex flex-wrap items-center gap-2">

          <span className="text-sm text-gray-500 dark:text-slate-400">
            Showing:
          </span>

          <span className="rounded-full bg-gray-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-bold capitalize text-gray-700 dark:text-slate-200">
            {activeRole}
          </span>

          {activeGender !== "all" && (
            <span className="rounded-full bg-[#1f6f5b] px-3 py-1 text-xs font-bold capitalize text-white">
              {activeGender}
            </span>
          )}

          {userSearch && (
            <span className="rounded-full bg-gray-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-semibold text-gray-700 dark:text-slate-200">
              Search: "{userSearch}"
            </span>
          )}

        </div>

        {/* TABLE */}

        {paginatedMembers.length === 0 ? (

          <div className="mt-6 rounded-xl border border-dashed border-gray-300 dark:border-[#15253f] p-10 text-center">

            <User
              size={30}
              className="mx-auto text-gray-400"
            />

            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">

              {currentMembers.length === 0
                ? `No ${activeRole} assigned to this batch.`
                : "No users match the selected filters."}

            </p>

            {(activeGender !== "all" ||
              userSearch) && (
              <button
                type="button"
                onClick={() => {
                  setActiveGender("all");
                  setUserSearch("");
                }}
                className="mt-4 text-sm font-semibold text-slate-900 dark:text-white underline"
              >
                Clear filters
              </button>
            )}

          </div>

        ) : (

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-[#15253f]">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-slate-50 dark:bg-[#070e1b]">

                  <tr>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      #
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Full Name
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Email
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Gender
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Role
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-[#15253f]">

                  {paginatedMembers.map(
                    (member, index) => (

                      <tr
                        key={
                          member?._id ||
                          index
                        }
                        className="transition hover:bg-slate-50 dark:bg-[#070e1b]"
                      >

                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">
                          {(userPage - 1) *
                            USER_LIMIT +
                            index +
                            1}
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f6f5b] text-sm font-bold text-white">
                              {member?.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "U"}
                            </div>

                            <span className="font-medium text-slate-900 dark:text-white">
                              {member?.name ||
                                "Unknown User"}
                            </span>

                          </div>

                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">

                          <div className="flex items-center gap-2">

                            <Mail
                              size={16}
                              className="shrink-0 text-gray-400"
                            />

                            {member?.email ||
                              "—"}

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-gray-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-semibold capitalize text-gray-700 dark:text-slate-200">
                            {member?.gender ||
                              "Not specified"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-full bg-gray-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-semibold capitalize text-gray-700 dark:text-slate-200">
                            {member?.role ||
                              activeRole.slice(
                                0,
                                -1
                              )}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {/* PAGINATION */}

        {totalUserPages > 1 && (

          <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-4 sm:flex-row">

            <p className="text-sm text-gray-500 dark:text-slate-400">

              Showing page{" "}

              <span className="font-semibold text-slate-900 dark:text-white">
                {userPage}
              </span>

              {" "}of{" "}

              <span className="font-semibold text-slate-900 dark:text-white">
                {totalUserPages}
              </span>

              {" "}•{" "}

              {filteredMembers.length} users

            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  handleUserPageChange(
                    userPage - 1
                  )
                }
                disabled={userPage === 1}
                className="flex h-10 items-center gap-1 rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] px-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-white dark:bg-[#0b1528] disabled:cursor-not-allowed disabled:opacity-40"
              >

                <ChevronLeft size={17} />

                <span className="hidden sm:inline">
                  Previous
                </span>

              </button>

              {getUserPageNumbers().map(
                (page) => (

                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      handleUserPageChange(
                        page
                      )
                    }
                    className={`h-10 w-10 rounded-lg text-sm font-semibold ${
                      page === userPage
                        ? "bg-[#1f6f5b] text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                  >
                    {page}
                  </button>

                )
              )}

              <button
                type="button"
                onClick={() =>
                  handleUserPageChange(
                    userPage + 1
                  )
                }
                disabled={
                  userPage ===
                  totalUserPages
                }
                className="flex h-10 items-center gap-1 rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] px-3 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-white dark:bg-[#0b1528] disabled:cursor-not-allowed disabled:opacity-40"
              >

                <span className="hidden sm:inline">
                  Next
                </span>

                <ChevronRight size={17} />

              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

// =========================================================
// FORM INPUT
// =========================================================

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] h-12 w-full rounded-lg border border-gray-300 dark:border-[#15253f] px-4 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
      />

    </div>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

        </div>

        <div className="rounded-xl bg-gray-100 dark:bg-[#070e1b] p-3">

          <Icon
            size={22}
            className="text-gray-700 dark:text-slate-200"
          />

        </div>

      </div>

    </div>
  );
}

// =========================================================
// GENDER FILTER BUTTON
// =========================================================

function GenderFilterButton({
  active,
  onClick,
  label,
  value,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
        active
          ? "border-gray-900 bg-[#1f6f5b] text-white shadow-sm"
          : "border-gray-200 bg-slate-50 dark:bg-[#070e1b] text-slate-900 dark:text-white hover:border-gray-400 hover:bg-white"
      }`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`rounded-lg p-2 ${
            active
              ? "bg-white/10"
              : "bg-white"
          }`}
        >

          <Icon
            size={21}
            className={
              active
                ? "text-white"
                : "text-gray-700"
            }
          />

        </div>

        <div>

          <p
            className={`text-xs font-medium ${
              active
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>

        </div>

      </div>

      <span
        className={`text-xs font-semibold ${
          active
            ? "text-gray-300"
            : "text-gray-400"
        }`}
      >
        Click to filter
      </span>

    </button>
  );
}

// =========================================================
// ROLE TAB
// =========================================================

function RoleTab({
  active,
  onClick,
  label,
  count,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[#1f6f5b] text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >

      <Icon size={17} />

      {label}

      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active
            ? "bg-white/20 text-white"
            : "bg-white text-gray-700"
        }`}
      >
        {count}
      </span>

    </button>
  );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-4">

      <div className="rounded-lg bg-white dark:bg-[#0b1528] p-3 shadow-sm">

        <Icon
          size={20}
          className="text-gray-700 dark:text-slate-200"
        />

      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-slate-900 dark:text-white">
          {value || "—"}
        </p>

      </div>

    </div>
  );
}

export default SuperAdminBatchDetails;