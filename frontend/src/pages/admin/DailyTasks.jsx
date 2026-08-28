import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

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
  // LOAD BATCHES
  // =========================================================

  const loadBatches = async () => {
    try {
      setError("");

      const response = await axios.get(
        `${API_URL}/batches`,
        getConfig()
      );

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

      const response = await axios.get(
        `${API_URL}/daily-tasks`,
        getConfig()
      );

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
        await axios.put(
          `${API_URL}/daily-tasks/${editingTask._id}`,
          payload,
          getConfig()
        );
      }

      // =====================================================
      // CREATE
      // =====================================================

      else {
        await axios.post(
          `${API_URL}/daily-tasks`,
          payload,
          getConfig()
        );
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
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      await axios.delete(
        `${API_URL}/daily-tasks/${id}`,
        getConfig()
      );

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
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="border-b border-slate-200 bg-white px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Daily Tasks
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage daily tasks, activities and points.
                </p>
              </div>

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
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Task
          </button>

        </div>
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

        <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">

          {/* BATCH */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Batch
            </label>

            <select
              value={selectedBatch}
              onChange={handleBatchChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Level
            </label>

            <select
              value={selectedLevel}
              onChange={handleLevelChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Week
            </label>

            <select
              value={selectedWeek}
              onChange={handleWeekChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab === "Overview"
                ? `Week ${selectedWeek} Overview`
                : activeTab}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {selectedBatchObject?.name ||
                selectedBatchObject?.title ||
                selectedBatchObject?.batchName ||
                "Selected Batch"}{" "}
              · Level {selectedLevel}
            </p>
          </div>

          {loading && (
            <span className="text-sm text-slate-500">
              Loading...
            </span>
          )}

        </div>

        {/* ===================================================
            DAY NAVIGATION
        =================================================== */}

        <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

          <button
            type="button"
            onClick={() =>
              setActiveTab("Overview")
            }
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "Overview"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
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
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === day
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
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

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Tasks
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {filteredTasks.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Weekly Points
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {totalPoints}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Active Days
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
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

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="font-bold text-slate-900">
                  Weekly Tasks
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Select a day above to manage its tasks.
                </p>
              </div>

              <div className="divide-y divide-slate-100">

                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setActiveTab(day)
                    }
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CheckCircle2 size={20} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {day}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {tasksByDay[day].length}{" "}
                          {tasksByDay[day].length === 1
                            ? "task"
                            : "tasks"}
                        </p>
                      </div>

                    </div>

                    <div className="text-right">

                      <p className="font-bold text-slate-900">
                        {getDayPoints(day)} pts
                      </p>

                      <p className="mt-1 text-xs text-blue-600">
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

              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <ClipboardList size={25} />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-800">
                  No tasks for {activeTab}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add the first task for this day.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    openAddModal(activeTab)
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Add Task
                </button>

              </div>

            ) : (

              <>
                {/* DAY SUMMARY */}

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm text-slate-500">
                      {activeTab} tasks
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {selectedDayTasks.length}{" "}
                      {selectedDayTasks.length === 1
                        ? "Task"
                        : "Tasks"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 px-5 py-3 text-right">

                    <p className="text-xs font-medium text-blue-600">
                      Total Points
                    </p>

                    <p className="text-xl font-bold text-blue-700">
                      {getDayPoints(activeTab)}
                    </p>

                  </div>

                </div>

                {/* TASK LIST */}

                {selectedDayTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-lg font-bold text-slate-900">
                            {task.title}
                          </h3>

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            {task.points} points
                          </span>

                        </div>

                        {task.description && (
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
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
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
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

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  {editingTask
                    ? "Edit Daily Task"
                    : "Add Daily Task"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Week {selectedWeek} · Level{" "}
                  {selectedLevel}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
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

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Day
                </label>

                <select
                  name="day"
                  value={form.day}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. HTML Basics"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the task..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* POINTS */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Points
                </label>

                <input
                  type="number"
                  name="points"
                  min="0"
                  value={form.points}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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