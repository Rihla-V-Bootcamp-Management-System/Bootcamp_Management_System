import { useEffect, useMemo, useState } from "react";
import {
  Lock,
  Circle,
  CalendarDays,
  BookOpen,
  Clock3,
} from "lucide-react";

import apiClient from "../services/apiClient";

function StudentDailyTasks() {
  const [student, setStudent] = useState(null);
  const [batch, setBatch] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedWeek, setSelectedWeek] = useState(1);

  // =========================================================
  // LOAD MY DAILY TASKS
  // =========================================================

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("=================================");
        console.log("LOADING MY DAILY TASKS...");
        console.log("=================================");

        const response =
          await apiClient.get(
            "/daily-tasks/my"
          );

        console.log(
          "DAILY TASK RESPONSE:",
          JSON.stringify(
            response.data,
            null,
            2
          )
        );

        // -----------------------------------------------------
        // STUDENT
        // -----------------------------------------------------

        if (response.data?.student) {
          setStudent(
            response.data.student
          );

          console.log(
            "CURRENT STUDENT:",
            response.data.student
          );
        }

        // -----------------------------------------------------
        // BATCH
        // -----------------------------------------------------

        if (response.data?.batch) {
          setBatch(
            response.data.batch
          );

          console.log(
            "CURRENT BATCH:",
            response.data.batch
          );
        } else {
          setBatch(null);

          console.log(
            "CURRENT BATCH: NONE"
          );
        }

        // -----------------------------------------------------
        // TASKS
        // -----------------------------------------------------

        const loadedTasks =
          response.data?.dailyTasks ||
          [];

        setTasks(loadedTasks);

        console.log(
          "TOTAL TASKS:",
          loadedTasks.length
        );

        console.log(
          "TASKS:",
          JSON.stringify(
            loadedTasks,
            null,
            2
          )
        );

        console.log(
          "================================="
        );
      } catch (err) {
        console.error(
          "LOAD DAILY TASKS ERROR:",
          err
        );

        console.error(
          "SERVER RESPONSE:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            "Failed to load daily tasks."
        );

        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // =========================================================
  // AVAILABLE WEEKS
  // =========================================================

  const availableWeeks = useMemo(() => {
    const weeks = [
      ...new Set(
        tasks
          .map((task) =>
            Number(task.week)
          )
          .filter((week) =>
            Number.isFinite(week)
          )
      ),
    ];

    return weeks.sort(
      (a, b) => a - b
    );
  }, [tasks]);

  // =========================================================
  // CURRENT WEEK
  // =========================================================

  const currentWeek = useMemo(() => {
    if (!batch?.startDate) {
      return availableWeeks.length
        ? Math.max(
            ...availableWeeks
          )
        : 1;
    }

    const start = new Date(
      batch.startDate
    );

    const today = new Date();

    start.setHours(
      0,
      0,
      0,
      0
    );

    today.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      today.getTime() -
      start.getTime();

    const calculatedWeek =
      Math.floor(
        difference /
          (1000 *
            60 *
            60 *
            24 *
            7)
      ) + 1;

    return Math.max(
      1,
      calculatedWeek
    );
  }, [
    batch,
    availableWeeks,
  ]);

  // =========================================================
  // ALL WEEKS
  // =========================================================

  const allWeeks = useMemo(() => {
    const highestAvailableWeek =
      availableWeeks.length
        ? Math.max(
            ...availableWeeks
          )
        : 1;

    const maxWeek = Math.max(
      currentWeek,
      highestAvailableWeek
    );

    return Array.from(
      {
        length: maxWeek,
      },
      (_, index) =>
        index + 1
    );
  }, [
    currentWeek,
    availableWeeks,
  ]);

  // =========================================================
  // DEFAULT CURRENT WEEK
  // =========================================================

  useEffect(() => {
    setSelectedWeek(
      currentWeek
    );
  }, [currentWeek]);

  // =========================================================
  // TASKS FOR SELECTED WEEK
  // =========================================================

  const selectedTasks =
    useMemo(() => {
      return tasks.filter(
        (task) =>
          Number(task.week) ===
          Number(selectedWeek)
      );
    }, [
      tasks,
      selectedWeek,
    ]);

  // =========================================================
  // GROUP TASKS BY DAY
  // =========================================================

  const groupedTasks =
    useMemo(() => {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      return days
        .map((day) => ({
          day,
          tasks:
            selectedTasks.filter(
              (task) =>
                task.day === day
            ),
        }))
        .filter(
          (group) =>
            group.tasks.length > 0
        );
    }, [selectedTasks]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[#f5f7fa] p-6 md:p-8">
        <div className="mx-auto max-w-6xl">

          <div className="animate-pulse space-y-6">

            <div className="h-8 w-64 rounded bg-slate-200" />

            <div className="h-4 w-80 rounded bg-slate-200" />

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-20 rounded-xl bg-white"
                  />
                )
              )}

            </div>

            <div className="h-72 rounded-2xl bg-white" />

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
      <div className="min-h-full bg-[#f5f7fa] p-6 md:p-8">

        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <BookOpen
              size={40}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-xl font-bold text-[#071629]">
              Unable to load tasks
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            {!batch && (
              <p className="mt-4 text-xs text-slate-400">
                Your account does not
                currently have a batch
                assigned.
              </p>
            )}

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-full bg-[#f5f7fa] p-6 md:p-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D3866] text-white">
              <BookOpen size={21} />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-[#071629]">
                Daily Tasks
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Complete your daily bootcamp
                activities.
              </p>

            </div>

          </div>

          {/* STUDENT + BATCH */}

          {student && (
            <div className="mt-4 text-sm text-slate-500">

              Welcome,{" "}

              <span className="font-semibold text-[#071629]">
                {student.name}
              </span>

              {batch?.name && (
                <>
                  {" • "}

                  Batch:{" "}

                  <span className="font-semibold text-[#1D3866]">
                    {batch.name}
                  </span>
                </>
              )}

            </div>
          )}

        </div>

        {/* WEEK SELECTOR */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="font-bold text-[#071629]">
                Bootcamp Weeks
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current week: Week{" "}
                {currentWeek}
              </p>

            </div>

            <CalendarDays
              size={20}
              className="text-[#1D3866]"
            />

          </div>

          <div className="flex flex-wrap gap-3">

            {allWeeks.map(
              (week) => {

                const isFuture =
                  week >
                  currentWeek;

                const isSelected =
                  week ===
                  selectedWeek;

                return (
                  <button
                    key={week}
                    disabled={
                      isFuture
                    }
                    onClick={() =>
                      setSelectedWeek(
                        week
                      )
                    }
                    className={`
                      relative flex min-w-[105px]
                      items-center justify-center gap-2
                      rounded-xl border px-4 py-3
                      text-sm font-semibold transition

                      ${
                        isFuture
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : isSelected
                          ? "border-[#1D3866] bg-[#1D3866] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#1D3866] hover:text-[#1D3866]"
                      }
                    `}
                  >

                    {isFuture ? (
                      <Lock size={15} />
                    ) : (
                      <CalendarDays
                        size={15}
                      />
                    )}

                    Week {week}

                    {isFuture && (
                      <span className="absolute -right-1 -top-2 rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px]">
                        Locked
                      </span>
                    )}

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* SELECTED WEEK */}

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-[#1D3866]">
              Current selection
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#071629]">
              Week {selectedWeek}
            </h2>

          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">

            <Clock3 size={15} />

            {selectedWeek <
            currentWeek
              ? "Previous week"
              : "Current week"}

          </div>

        </div>

        {/* NO TASKS */}

        {selectedTasks.length ===
        0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <BookOpen
              size={36}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold text-[#071629]">
              No tasks for this
              week
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your instructor has not
              added tasks for Week{" "}
              {selectedWeek} yet.
            </p>

            {tasks.length === 0 && (
              <p className="mt-3 text-xs text-red-400">
                No daily tasks were
                returned for your batch.
              </p>
            )}

          </div>

        ) : (

          /* TASKS */

          <div className="space-y-6">

            {groupedTasks.map(
              (group) => (

                <div
                  key={group.day}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                >

                  {/* DAY HEADER */}

                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2F7] text-[#1D3866]">

                        <CalendarDays
                          size={17}
                        />

                      </div>

                      <div>

                        <h3 className="font-bold text-[#071629]">
                          {group.day}
                        </h3>

                        <p className="text-xs text-slate-400">
                          {
                            group.tasks
                              .length
                          }{" "}
                          task
                          {group.tasks
                            .length !==
                          1
                            ? "s"
                            : ""}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* TASK LIST */}

                  <div className="divide-y divide-slate-100">

                    {group.tasks.map(
                      (task) => (

                        <div
                          key={
                            task._id
                          }
                          className="p-5 transition hover:bg-slate-50"
                        >

                          <div className="flex items-start gap-4">

                            <div className="mt-0.5 text-slate-300">
                              <Circle
                                size={
                                  21
                                }
                              />
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <h4 className="font-semibold text-[#071629]">
                                  {
                                    task.title
                                  }
                                </h4>

                                {task.points >
                                  0 && (
                                  <span className="rounded-full bg-[#EEF2F7] px-2 py-1 text-[11px] font-semibold text-[#1D3866]">
                                    {
                                      task.points
                                    }{" "}
                                    pts
                                  </span>
                                )}

                              </div>

                              {task.description && (
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                  {
                                    task.description
                                  }
                                </p>
                              )}

                              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">

                                <span>
                                  Level{" "}
                                  {
                                    task.level
                                  }
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default StudentDailyTasks;