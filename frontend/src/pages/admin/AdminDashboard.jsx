import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserRoundCheck,
  ShieldCheck,
  Layers3,
  ArrowUpRight,
  UserPlus,
  ClipboardCheck,
  BookOpen,
  UserRoundCog,
  RefreshCw,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

import apiClient from "../../services/apiClient";

function AdminDashboard() {
  const [data, setData] = useState({
    students: 0,
    mentors: 0,
    admins: 0,
    batches: 0,
    batchList: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD DATA DIRECTLY FROM EXISTING APIS
  // NO ANALYTICS API
  // =========================================================

  const loadDashboard = useCallback( async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, batchesResponse] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/batches"),
      ]);

      console.log("USERS RESPONSE:", usersResponse.data);
      console.log("BATCHES RESPONSE:", batchesResponse.data);

      // -------------------------------------------------------
      // USERS
      // -------------------------------------------------------

      const usersData = usersResponse.data;

      const users =
        usersData.users ||
        usersData.data ||
        usersData.results ||
        (Array.isArray(usersData) ? usersData : []);

      const students = users.filter(
        (user) => user.role?.toLowerCase() === "student"
      ).length;

      const mentors = users.filter(
        (user) => user.role?.toLowerCase() === "mentor"
      ).length;

      const admins = users.filter((user) => {
        const role = user.role?.toLowerCase();

        return role === "admin" || role === "superadmin";
      }).length;

      // -------------------------------------------------------
      // BATCHES
      // -------------------------------------------------------

      const batchesData = batchesResponse.data;

      const batchList =
        batchesData.batches ||
        batchesData.data ||
        batchesData.results ||
        (Array.isArray(batchesData) ? batchesData : []);

      setData({
        students,
        mentors,
        admins,
        batches: batchList.length,
        batchList,
      });
    } catch (err) {
      console.error(
        "LOAD DASHBOARD ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  },[]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // =========================================================
  // DATA
  // =========================================================

  const totalUsers =
    data.students +
    data.mentors +
    data.admins;

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      description: "Registered accounts",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Students",
      value: data.students,
      description: "Students in the system",
      icon: GraduationCap,
      href: "/admin/users",
    },
    {
      title: "Mentors",
      value: data.mentors,
      description: "Active mentors",
      icon: UserRoundCheck,
      href: "/admin/mentor-assignment",
    },
    {
      title: "Batches",
      value: data.batches,
      description: "Bootcamp batches",
      icon: Layers3,
      href: "/admin/batches",
    },
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[#F7F5EF] p-6 md:p-8">
        <div className="animate-pulse space-y-8">

          <div>
            <div className="h-8 w-40 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-72 rounded bg-slate-200" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="h-80 rounded-2xl bg-white" />
            <div className="h-80 rounded-2xl bg-white" />
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
      <div className="min-h-full bg-[#F7F5EF] p-6 md:p-8">

        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="rounded-xl bg-red-50 p-3">
              <RefreshCw
                size={22}
                className="text-red-600"
              />
            </div>

            <div className="flex-1">

              <h2 className="text-lg font-bold text-[#071629]">
                Dashboard data could not be loaded
              </h2>

              <p className="mt-1 text-sm text-[#52627A]">
                {error}
              </p>

              <button
                onClick={loadDashboard}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#162D52]"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-full bg-[#F7F5EF] p-6 md:p-8">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1D3866]">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#071629]">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#52627A]">
            Monitor your bootcamp and manage everything from one place.
          </p>

        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#D9D5CB] bg-white px-4 py-2.5 text-sm font-semibold text-[#52627A] shadow-sm transition hover:border-[#1D3866] hover:text-[#1D3866]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* STAT CARDS */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              to={card.href}
              className="group rounded-2xl border border-[#E5E0D5] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#C9D2E2] hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2F7] text-[#1D3866]">
                  <Icon size={21} />
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8A96A8] transition group-hover:bg-[#F1F4F8] group-hover:text-[#1D3866]">
                  <ArrowUpRight size={17} />
                </div>

              </div>

              <div className="mt-5">

                <p className="text-sm font-medium text-[#52627A]">
                  {card.title}
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-[#071629]">
                  {card.value}
                </p>

                <p className="mt-2 text-xs text-[#8A96A8]">
                  {card.description}
                </p>

              </div>

            </Link>
          );
        })}

      </div>

      {/* WELCOME + SYSTEM OVERVIEW */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

        <div className="relative overflow-hidden rounded-2xl border border-[#E5E0D5] bg-white p-7 shadow-sm">

          <div className="relative z-10">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D3866] text-white shadow-sm">
              <ShieldCheck size={23} />
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#071629]">
              Welcome to your admin workspace
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#52627A]">
              Manage students, mentors, batches, modules, daily tasks,
              attendance, and other bootcamp activities from one
              centralized workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/admin/batches"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#162D52]"
              >
                View Batches
                <ArrowUpRight size={16} />
              </Link>

              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 rounded-lg border border-[#D9D5CB] bg-white px-4 py-2.5 text-sm font-semibold text-[#52627A] transition hover:border-[#1D3866] hover:text-[#1D3866]"
              >
                Manage Users
              </Link>

            </div>

          </div>

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-30 border-[#F0F3F7]" />

          <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-[#F7F5EF]" />

        </div>

        {/* SYSTEM OVERVIEW */}

        <div className="rounded-2xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-[#071629]">
                System Overview
              </h2>

              <p className="mt-1 text-xs text-[#8A96A8]">
                Current platform statistics
              </p>

            </div>

            <div className="rounded-lg bg-[#EEF2F7] p-2 text-[#1D3866]">
              <Layers3 size={18} />
            </div>

          </div>

          <div className="mt-6 space-y-5">

            <ProgressRow
              label="Students"
              value={data.students}
              total={totalUsers}
            />

            <ProgressRow
              label="Mentors"
              value={data.mentors}
              total={totalUsers}
            />

            <ProgressRow
              label="Administrators"
              value={data.admins}
              total={totalUsers}
            />

          </div>

        </div>

      </div>

      {/* BATCH OVERVIEW */}

      <div className="mt-6 rounded-2xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-[#E5E0D5] p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-lg font-bold text-[#071629]">
              Batch Overview
            </h2>

            <p className="mt-1 text-sm text-[#8A96A8]">
              Monitor your current bootcamp batches.
            </p>

          </div>

          <Link
            to="/admin/batches"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D3866] hover:underline"
          >
            View all batches
            <ArrowUpRight size={15} />
          </Link>

        </div>

        <div className="p-6">

          {data.batchList.length === 0 ? (

            <div className="rounded-xl border border-dashed border-[#D9D5CB] bg-[#F7F5EF] p-8 text-center">

              <Layers3
                size={28}
                className="mx-auto text-[#8A96A8]"
              />

              <p className="mt-3 text-sm font-semibold text-[#52627A]">
                No batches found
              </p>

              <Link
                to="/admin/batches"
                className="mt-4 inline-flex rounded-lg bg-[#1D3866] px-4 py-2 text-sm font-semibold text-white"
              >
                Create Batch
              </Link>

            </div>

          ) : (

            <div className="grid gap-4 lg:grid-cols-2">

              {data.batchList.map((batch) => {

                const batchId =
                  batch._id ||
                  batch.id;

                return (
                  <Link
                    key={batchId}
                    to={`/admin/batches/${batchId}`}
                    className="group rounded-xl border border-[#E5E0D5] p-5 transition hover:border-[#BFCADA] hover:bg-[#FBFBFA]"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2F7] text-[#1D3866]">
                          <Layers3 size={19} />
                        </div>

                        <div>

                          <h3 className="font-bold text-[#071629]">
                            {batch.name || batch.title || "Unnamed Batch"}
                          </h3>

                          <p className="mt-1 text-xs text-[#8A96A8]">
                            Bootcamp Batch
                          </p>

                        </div>

                      </div>

                      <ArrowUpRight
                        size={18}
                        className="text-[#8A96A8] transition group-hover:text-[#1D3866]"
                      />

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="rounded-lg bg-[#F7F5EF] p-3">

                        <div className="flex items-center gap-2 text-[#8A96A8]">
                          <Users size={15} />
                          <span className="text-xs">
                            Students
                          </span>
                        </div>

                        <p className="mt-1 text-lg font-bold text-[#071629]">
                          {batch.studentIds?.length ||
                            batch.students ||
                            0}
                        </p>

                      </div>

                      <div className="rounded-lg bg-[#F7F5EF] p-3">

                        <div className="flex items-center gap-2 text-[#8A96A8]">
                          <UserRoundCheck size={15} />
                          <span className="text-xs">
                            Mentors
                          </span>
                        </div>

                        <p className="mt-1 text-lg font-bold text-[#071629]">
                          {batch.mentorIds?.length ||
                            batch.mentors ||
                            0}
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-[#8A96A8]">

                      <CalendarDays size={14} />

                      <span>
                        Starts{" "}
                        {batch.startDate
                          ? new Date(
                              batch.startDate
                            ).toLocaleDateString()
                          : "Not set"}
                      </span>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

        </div>

      </div>

      {/* QUICK ACTIONS */}

      <div className="mt-6">

        <div className="mb-4">

          <h2 className="text-lg font-bold text-[#071629]">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-[#8A96A8]">
            Jump directly to common administrative tasks.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <QuickAction
            to="/admin/users"
            icon={UserPlus}
            title="Manage Users"
            description="View and manage accounts"
          />

          <QuickAction
            to="/admin/mentor-assignment"
            icon={UserRoundCog}
            title="Assign Mentors"
            description="Manage student mentors"
          />

          <QuickAction
            to="/admin/daily-tasks"
            icon={ClipboardCheck}
            title="Daily Tasks"
            description="Manage weekly tasks"
          />

          <QuickAction
            to="/admin/modules"
            icon={BookOpen}
            title="Modules"
            description="Manage learning modules"
          />

        </div>

      </div>

      {/* FOOTER */}

      <div className="mt-8 flex flex-col gap-2 border-t border-[#E5E0D5] pt-5 text-xs text-[#8A96A8] sm:flex-row sm:items-center sm:justify-between">

        <span>
          Bootcamp Management System
        </span>

        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          System connected
        </span>

      </div>

    </div>
  );
}

// =========================================================
// PROGRESS ROW
// =========================================================

function ProgressRow({ label, value, total }) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="text-sm text-[#52627A]">
          {label}
        </span>

        <span className="text-sm font-bold text-[#071629]">
          {value}
        </span>

      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF0F3]">

        <div
          className="h-full rounded-full bg-[#1D3866] transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

// =========================================================
// QUICK ACTION
// =========================================================

function QuickAction({
  to,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#C9D2E2] hover:shadow-md"
    >

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F7] text-[#1D3866] transition group-hover:bg-[#1D3866] group-hover:text-white">
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">

          <h3 className="font-semibold text-[#071629]">
            {title}
          </h3>

          <p className="mt-1 text-xs text-[#8A96A8]">
            {description}
          </p>

        </div>

        <ArrowUpRight
          size={17}
          className="shrink-0 text-[#B0B8C4] transition group-hover:text-[#1D3866]"
        />

      </div>

    </Link>
  );
}

export default AdminDashboard;