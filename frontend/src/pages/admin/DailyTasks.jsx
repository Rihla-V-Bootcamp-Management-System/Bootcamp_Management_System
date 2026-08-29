import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import apiClient from "../../services/apiClient";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function DailyTasks() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryBatchId = searchParams.get("batchId");

  const [tasks, setTasks] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState(
    queryBatchId || ""
  );

  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Overview is the default tab
  const [activeTab, setActiveTab] = useState("Overview");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    day: "Monday",
    title: "",
    description: "",
    points: 10,
  });

  // =========================================================
  // LOAD BATCHES
  // =========================================================

  const loadBatches = async () => {
    try {
      setError("");

      const response = await apiClient.get("/batches");

      const data = response.data;

      const batchList =
        data.batches ||
        data.data ||
        data ||
        [];

      const validList = Array.isArray(batchList)
        ? batchList
        : [];

      setBatches(validList);

      if (validList.length > 0) {
        if (queryBatchId) {
          const exists = validList.some(
            (batch) =>
              String(batch._id) === String(queryBatchId)
          );

          if (exists) {
            setSelectedBatch(queryBatchId);
          } else {
            setSelectedBatch(validList[0]._id);
            setSearchParams({
              batchId: validList[0]._id,
            });
          }
        } else if (!selectedBatch) {
          setSelectedBatch(validList[0]._id);

          setSearchParams({
            batchId: validList[0]._id,
          });
        }
      }
    } catch (err) {
      console.error("LOAD BATCHES ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load batches"
      );
    }
  };

  // =========================================================
  // KEEP URL BATCH IN SYNC
  // =========================================================

  useEffect(() => {
    if (
      queryBatchId &&
      queryBatchId !== selectedBatch
    ) {
      setSelectedBatch(queryBatchId);
    }
  }, [queryBatchId, selectedBatch]);

  // =========================================================
  // LOAD TASKS
  // =========================================================

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/daily-tasks");
      const data = response.data;
      setTasks(data.dailyTasks || []);
    } catch (err) {
      console.error(
        "LOAD DAILY TASKS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load daily tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBatches();
    loadTasks();
  }, []);

  // =========================================================
  // HANDLE BATCH CHANGE
  // =========================================================

  const handleBatchChange = (e) => {
    const batchId = e.target.value;

    setSelectedBatch(batchId);

    setSearchParams({
      batchId,
    });

    setActiveTab("Overview");
  };

  // =========================================================
  // HANDLE LEVEL CHANGE
  // =========================================================

  const handleLevelChange = (e) => {
    setSelectedLevel(Number(e.target.value));
    setActiveTab("Overview");
  };

  // =========================================================
  // HANDLE WEEK CHANGE
  // =========================================================

  const handleWeekChange = (e) => {
    setSelectedWeek(Number(e.target.value));
    setActiveTab("Overview");
  };

  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const taskBatch =
        task.batchId?._id ||
        task.batchId;

      return (
        String(taskBatch) ===
          String(selectedBatch) &&
        Number(task.level) ===
          Number(selectedLevel) &&
        Number(task.week) ===
          Number(selectedWeek)
      );
    });
  }, [
    tasks,
    selectedBatch,
    selectedLevel,
    selectedWeek,
  ]);

  // =========================================================
  // TASKS BY DAY
  // =========================================================

  const tasksByDay = useMemo(() => {
    const result = {};

    DAYS.forEach((day) => {
      result[day] = filteredTasks.filter(
        (task) => task.day === day
      );
    });

    return result;
  }, [filteredTasks]);

  // =========================================================
  // DAY POINTS
  // =========================================================

  const getDayPoints = (day) => {
    return tasksByDay[day].reduce(
      (total, task) =>
        total + Number(task.points || 0),
      0
    );
  };

  // =========================================================
  // TOTAL POINTS
  // =========================================================

  const totalPoints = filteredTasks.reduce(
    (total, task) =>
      total + Number(task.points || 0),
    0
  );

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const openAddModal = (day = "Monday") => {
    setEditingTask(null);

    setForm({
      day,
      title: "",
      description: "",
      points: 10,
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (task) => {
    setEditingTask(task);

    setForm({
      day: task.day || "Monday",
      title: task.title || "",
      description: task.description || "",
      points: task.points ?? 0,
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (loading) return;

    setShowModal(false);
    setEditingTask(null);

    setForm({
      day: "Monday",
      title: "",
      description: "",
      points: 10,
    });
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE / UPDATE TASK
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBatch) {
      setError("Please select a batch.");
      return;
    }

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (Number(form.points) < 0) {
      setError("Points cannot be negative.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        batchId: selectedBatch,
        level: Number(selectedLevel),
        week: Number(selectedWeek),
        day: form.day,
        title: form.title.trim(),
        description: form.description.trim(),
        points: Number(form.points),
      };

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingTask) {
        await apiClient.put(
          `/daily-tasks/${editingTask._id}`,
          payload
        );
        toast.success("Daily task updated successfully");
      } else {
        await apiClient.post("/daily-tasks", payload);
        toast.success("Daily task created successfully");
      }

      setShowModal(false);
      setEditingTask(null);

      setForm({
        day: "Monday",
        title: "",
        description: "",
        points: 10,
      });

      await loadTasks();
    } catch (err) {
      console.error(
        "SAVE DAILY TASK ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save daily task"
      );
      toast.error(err.response?.data?.message || "Failed to save daily task");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError("");

      await apiClient.delete(`/daily-tasks/${id}`);
      toast.success("Daily task deleted successfully");
      await loadTasks();
    } catch (err) {
      console.error(
        "DELETE TASK ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete task"
      );
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SELECTED DAY TASKS
  // =========================================================

  const selectedDayTasks =
    activeTab !== "Overview"
      ? tasksByDay[activeTab] || []
      : [];

  // =========================================================
  // SELECTED BATCH NAME
  // =========================================================

  const selectedBatchObject = batches.find(
    (batch) =>
      String(batch._id) ===
      String(selectedBatch)
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-blue-950/60 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/50">
            <ClipboardList size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Daily Tasks
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage daily tasks, activities and points for this cohort.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            openAddModal(
              activeTab === "Overview"
                ? "Monday"
                : activeTab
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#185848] active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="p-6">

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded p-1 hover:bg-red-100"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* ===================================================
            FILTERS
        =================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-xs dark:border-slate-800 dark:bg-[#1f6f5b] md:grid-cols-3">

          {/* BATCH */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Batch
            </label>

            <select
              value={selectedBatch}
              onChange={handleBatchChange}
              className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/40"
            >
              <option value="">
                Select Batch
              </option>

              {batches.map((batch) => (
                <option
                  key={batch._id}
                  value={batch._id}
                >
                  {batch.name ||
                    batch.title ||
                    batch.batchName ||
                    `Batch ${batch._id}`}
                </option>
              ))}
            </select>
          </div>

          {/* LEVEL */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Level
            </label>

            <select
              value={selectedLevel}
              onChange={handleLevelChange}
              className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/40"
            >
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
              <option value={3}>Level 3</option>
              <option value={4}>Level 4</option>
              <option value={5}>Level 5</option>
            </select>
          </div>

          {/* WEEK */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Week
            </label>

            <select
              value={selectedWeek}
              onChange={handleWeekChange}
              className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-900/40"
            >
              {Array.from(
                { length: 16 },
                (_, index) => index + 1
              ).map((week) => (
                <option
                  key={week}
                  value={week}
                >
                  Week {week}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ===================================================
            WEEK INFORMATION
        =================================================== */}

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeTab === "Overview"
                ? `Week ${selectedWeek} Overview`
                : activeTab}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {selectedBatchObject?.name ||
                selectedBatchObject?.title ||
                selectedBatchObject?.batchName ||
                "Selected Batch"}{" "}
              · Level {selectedLevel}
            </p>
          </div>

          {loading && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Loading tasks...
            </span>
          )}

        </div>

        {/* ===================================================
            DAY NAVIGATION
        =================================================== */}

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-2 shadow-xs dark:border-slate-800 dark:bg-[#1f6f5b]">

          <button
            type="button"
            onClick={() =>
              setActiveTab("Overview")
            }
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "Overview"
                ? "bg-[#1f6f5b] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#185848]"
            }`}
          >
            Overview
          </button>

          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() =>
                setActiveTab(day)
              }
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === day
                  ? "bg-[#1f6f5b] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#185848]"
              }`}
            >
              {day}
            </button>
          ))}

        </div>

        {/* ===================================================
            OVERVIEW
        =================================================== */}

        {activeTab === "Overview" && (
          <div className="space-y-6">

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Tasks
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {filteredTasks.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Weekly Points
                </p>

                <p className="mt-2 text-3xl font-bold text-[#1f6f5b]">
                  {totalPoints}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Active Days
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {
                    DAYS.filter(
                      (day) =>
                        tasksByDay[day].length > 0
                    ).length
                  }
                </p>
              </div>

            </div>

            {/* DAY SUMMARY */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

              <div className="border-b border-slate-200 dark:border-[#15253f] px-6 py-5">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Weekly Tasks
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select a day above to manage its tasks.
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-[#15253f]">

                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setActiveTab(day)
                    }
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50 dark:bg-[#070e1b]"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e5f1ed] text-[#1f6f5b]">
                        <CheckCircle2 size={20} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {day}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {tasksByDay[day].length}{" "}
                          {tasksByDay[day].length === 1
                            ? "task"
                            : "tasks"}
                        </p>
                      </div>

                    </div>

                    <div className="text-right">

                      <p className="font-bold text-slate-900 dark:text-white">
                        {getDayPoints(day)} pts
                      </p>

                      <p className="mt-1 text-xs text-[#1f6f5b]">
                        View →
                      </p>

                    </div>

                  </button>
                ))}

              </div>
            </div>

          </div>
        )}

        {/* ===================================================
            DAY VIEW
        =================================================== */}

        {activeTab !== "Overview" && (
          <div className="space-y-4">

            {selectedDayTasks.length === 0 ? (

              <div className="rounded-xl border dark:border-[#15253f] border-dashed border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-[#070e1b] text-slate-400">
                  <ClipboardList size={25} />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
                  No tasks for {activeTab}
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add the first task for this day.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    openAddModal(activeTab)
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#185848]"
                >
                  <Plus size={17} />
                  Add Task
                </button>

              </div>

            ) : (

              <>
                {/* DAY SUMMARY */}

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {activeTab} tasks
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedDayTasks.length}{" "}
                      {selectedDayTasks.length === 1
                        ? "Task"
                        : "Tasks"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#e5f1ed] px-5 py-3 text-right">

                    <p className="text-xs font-medium text-[#1f6f5b]">
                      Total Points
                    </p>

                    <p className="text-xl font-bold text-[#185848]">
                      {getDayPoints(activeTab)}
                    </p>

                  </div>

                </div>

                {/* TASK LIST */}

                {selectedDayTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {task.title}
                          </h3>

                          <span className="rounded-full bg-[#e5f1ed] px-3 py-1 text-xs font-bold text-[#185848]">
                            {task.points} points
                          </span>

                        </div>

                        {task.description && (
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {task.description}
                          </p>
                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(task)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-[#15253f] px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:border-blue-200 hover:bg-[#e5f1ed] hover:text-[#1f6f5b]"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(task._id)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

              </>
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-[#0b1528] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#15253f] px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingTask
                    ? "Edit Daily Task"
                    : "Add Daily Task"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Week {selectedWeek} · Level{" "}
                  {selectedLevel}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:bg-[#070e1b] hover:text-slate-700 dark:text-slate-200 disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* DAY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Day
                </label>

                <select
                  name="day"
                  value={form.day}
                  onChange={handleChange}
                  className="w-full rounded-lg border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 text-sm outline-none focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
                >

                  {DAYS.map((day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {day}
                    </option>
                  ))}

                </select>

              </div>

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. HTML Basics"
                  required
                  className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-lg border border-slate-300 dark:border-[#15253f] px-3 py-2.5 text-sm outline-none focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the task..."
                  className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full resize-none rounded-lg border border-slate-300 dark:border-[#15253f] px-3 py-2.5 text-sm outline-none focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
                />

              </div>

              {/* POINTS */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Points
                </label>

                <input
                  type="number"
                  name="points"
                  min="0"
                  value={form.points}
                  onChange={handleChange}
                  required
                  className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-lg border border-slate-300 dark:border-[#15253f] px-3 py-2.5 text-sm outline-none focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-[#15253f] pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 dark:border-[#15253f] px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-[#070e1b] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default DailyTasks;