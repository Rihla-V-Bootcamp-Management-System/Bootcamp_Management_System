import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Users,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  CircleCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import apiClient from "../../services/apiClient";

// =========================================================
// SUPER ADMIN BATCHES
// =========================================================

function SuperAdminBatches() {
  const navigate = useNavigate();

  // =======================================================
  // DATA
  // =======================================================

  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =======================================================
  // SEARCH + FILTER
  // =======================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // =======================================================
  // CREATE MODAL
  // =======================================================

  const [showCreateModal, setShowCreateModal] = useState(false);

  // =======================================================
  // PAGINATION
  // =======================================================

  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalBatches: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // =======================================================
  // FORM
  // =======================================================

  const [form, setForm] = useState({
    name: "",
    year: new Date().getFullYear(),
    season: "",
    startDate: "",
    endDate: "",
  });

  // =======================================================
  // LOAD BATCHES
  // =======================================================

  const loadBatches = async (page = 1, isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiClient.get("/batches", {
        params: {
          page,
          limit: 10,
        },
      });

      console.log("Batches response:", response.data);

      setBatches(response.data?.batches || []);

      setPagination(
        response.data?.pagination || {
          totalBatches: 0,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );

      setCurrentPage(page);
    } catch (error) {
      console.error("Load batches error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load batches."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadBatches(1);
  }, []);

  // =======================================================
  // FORM CHANGE
  // =======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =======================================================
  // CREATE BATCH
  // =======================================================

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter a batch name.");
      return;
    }

    if (!form.year) {
      setError("Please enter the batch year.");
      return;
    }

    if (!form.season) {
      setError("Please select a season.");
      return;
    }

    if (!form.startDate) {
      setError("Please select a start date.");
      return;
    }

    if (!form.endDate) {
      setError("Please select an end date.");
      return;
    }

    if (
      new Date(form.startDate) >=
      new Date(form.endDate)
    ) {
      setError(
        "End date must be after start date."
      );
      return;
    }

    try {
      setCreating(true);

      await apiClient.post("/batches", {
        name: form.name.trim(),
        year: Number(form.year),
        season: form.season,
        startDate: form.startDate,
        endDate: form.endDate,
      });

      setSuccess(
        "Batch created successfully."
      );

      setForm({
        name: "",
        year: new Date().getFullYear(),
        season: "",
        startDate: "",
        endDate: "",
      });

      setShowCreateModal(false);

      // Reload page 1 so the newly created
      // batch appears according to backend sorting.
      await loadBatches(1);
    } catch (error) {
      console.error(
        "Create batch error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create batch."
      );
    } finally {
      setCreating(false);
    }
  };

  // =======================================================
  // SEARCH + STATUS FILTER
  // =======================================================

  const filteredBatches = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return batches.filter((batch) => {
      const matchesSearch =
        !searchText ||
        batch.name
          ?.toLowerCase()
          .includes(searchText) ||
        String(batch.year || "").includes(
          searchText
        ) ||
        batch.season
          ?.toLowerCase()
          .includes(searchText) ||
        batch.status
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        (batch.status || "Upcoming") ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    batches,
    search,
    statusFilter,
  ]);

  // =======================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =======================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // =======================================================
  // PAGE STATISTICS
  //
  // NOTE:
  // These statistics are based on the currently
  // loaded backend page.
  // =======================================================

  const activeCount = batches.filter(
    (batch) => batch.status === "Active"
  ).length;

  const upcomingCount = batches.filter(
    (batch) =>
      !batch.status ||
      batch.status === "Upcoming"
  ).length;

  const completedCount = batches.filter(
    (batch) =>
      batch.status === "Completed"
  ).length;

  // =======================================================
  // VIEW BATCH
  // =======================================================

  const handleViewBatch = (batch) => {
    navigate(
      `/superadmin/batches/${batch._id}/dashboard`
    );
  };

  // =======================================================
  // PAGE CHANGE
  // =======================================================

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === currentPage
    ) {
      return;
    }

    loadBatches(page);
  };

  // =======================================================
  // PAGE NUMBERS
  // =======================================================

  const getPageNumbers = () => {
    const pages = [];

    const totalPages =
      pagination.totalPages;

    let startPage = Math.max(
      1,
      currentPage - 2
    );

    let endPage = Math.min(
      totalPages,
      currentPage + 2
    );

    if (currentPage <= 3) {
      endPage = Math.min(
        totalPages,
        5
      );
    }

    if (
      currentPage >=
      totalPages - 2
    ) {
      startPage = Math.max(
        1,
        totalPages - 4
      );
    }

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        </div>

        <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />

        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Batch Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage bootcamp batches.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Create Batch
        </button>
      </div>

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
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Batches"
          value={pagination.totalBatches}
          icon={Users}
        />

        <SummaryCard
          title="Active Batches"
          value={activeCount}
          icon={CheckCircle}
        />

        <SummaryCard
          title="Upcoming Batches"
          value={upcomingCount}
          icon={Clock}
        />

        <SummaryCard
          title="Completed Batches"
          value={completedCount}
          icon={CircleCheck}
        />
      </div>

      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search batches..."
              className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
            />
          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="h-11 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Upcoming">
              Upcoming
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              loadBatches(
                currentPage,
                true
              )
            }
            disabled={refreshing}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>

      {/* =================================================
          BATCH LIST
      ================================================= */}

      {filteredBatches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Users
              size={28}
              className="text-gray-500"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {batches.length === 0
              ? "No batches yet"
              : "No batches found"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {batches.length === 0
              ? "Create your first bootcamp batch."
              : "Try another search or status filter."}
          </p>

          {batches.length === 0 && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreateModal(true);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Plus size={17} />
              Create Batch
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBatches.map((batch) => (
            <BatchCard
              key={batch._id}
              batch={batch}
              onView={handleViewBatch}
            />
          ))}
        </div>
      )}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {pagination.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">

          <p className="text-sm text-gray-500">
            Showing page{" "}
            <span className="font-semibold text-gray-900">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {pagination.totalPages}
            </span>{" "}
            • {pagination.totalBatches} total batches
          </p>

          <div className="flex items-center gap-2">

            {/* PREVIOUS */}

            <button
              type="button"
              onClick={() =>
                handlePageChange(
                  currentPage - 1
                )
              }
              disabled={
                !pagination.hasPreviousPage
              }
              className="flex h-10 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />

              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            {/* PAGE NUMBERS */}

            {getPageNumbers().map((page) => (
              <button
                key={page}
                type="button"
                onClick={() =>
                  handlePageChange(page)
                }
                className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
                  page === currentPage
                    ? "bg-gray-900 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            {/* NEXT */}

            <button
              type="button"
              onClick={() =>
                handlePageChange(
                  currentPage + 1
                )
              }
              disabled={
                !pagination.hasNextPage
              }
              className="flex h-10 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">
                Next
              </span>

              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          CREATE BATCH MODAL
      ================================================= */}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !creating
            ) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Create New Batch
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the information for the new bootcamp batch.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(false)
                }
                disabled={creating}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateBatch}
              className="space-y-5 p-6"
            >

              {/* NAME */}

              <div>
                <label
                  htmlFor="batch-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Batch Name
                </label>

                <input
                  id="batch-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: MSJ Batch 2026"
                  disabled={creating}
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                />
              </div>

              {/* YEAR + SEASON */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Year
                  </label>

                  <input
                    name="year"
                    type="number"
                    min="2000"
                    max="2100"
                    value={form.year}
                    onChange={handleChange}
                    disabled={creating}
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Season
                  </label>

                  <select
                    name="season"
                    value={form.season}
                    onChange={handleChange}
                    disabled={creating}
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
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
              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>

                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    disabled={creating}
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    End Date
                  </label>

                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={creating}
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10"
                  />
                </div>
              </div>

              {/* INFORMATION */}

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">
                  After creating the batch
                </p>

                <ul className="mt-2 space-y-1 text-sm text-gray-500">
                  <li>
                    • The initial status will be Upcoming.
                  </li>

                  <li>
                    • You can assign mentors.
                  </li>

                  <li>
                    • You can assign students.
                  </li>

                  <li>
                    • You can later update dates and status.
                  </li>
                </ul>
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  disabled={creating}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {creating
                    ? "Creating..."
                    : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 p-3">
          <Icon
            size={21}
            className="text-gray-700"
          />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// BATCH CARD
// =========================================================

function BatchCard({
  batch,
  onView,
}) {
  const studentCount =
    batch.studentIds?.length || 0;

  const mentorCount =
    batch.mentorIds?.length || 0;

  const status =
    batch.status || "Upcoming";

  const statusClasses = {
    Active:
      "bg-green-100 text-green-700",

    Completed:
      "bg-gray-200 text-gray-700",

    Upcoming:
      "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* INFORMATION */}

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h2 className="text-lg font-bold text-gray-900">
              {batch.name}
            </h2>

            {/* STATUS */}

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusClasses[status] ||
                statusClasses.Upcoming
              }`}
            >
              {status}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">

            <span>
              {batch.season || "—"}{" "}
              {batch.year || ""}
            </span>

            <span>
              Start:{" "}
              {batch.startDate
                ? new Date(
                    batch.startDate
                  ).toLocaleDateString()
                : "—"}
            </span>

            <span>
              End:{" "}
              {batch.endDate
                ? new Date(
                    batch.endDate
                  ).toLocaleDateString()
                : "—"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">

            <div className="rounded-lg bg-gray-50 px-4 py-2">
              <span className="text-xs text-gray-500">
                Students
              </span>

              <span className="ml-2 font-semibold text-gray-900">
                {studentCount}
              </span>
            </div>

            <div className="rounded-lg bg-gray-50 px-4 py-2">
              <span className="text-xs text-gray-500">
                Mentors
              </span>

              <span className="ml-2 font-semibold text-gray-900">
                {mentorCount}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION */}

        <button
          type="button"
          onClick={() => onView(batch)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Eye size={17} />
          View Dashboard
        </button>
      </div>
    </div>
  );
}

export default SuperAdminBatches;