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
  Sparkles,
} from "lucide-react";

import apiClient from "../../services/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

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

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, batchesResponse] = await Promise.all([
        apiClient.get("/users"),
        apiClient.get("/batches"),
      ]);

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
      console.error("LOAD DASHBOARD ERROR:", err);
      setError(
        err.response?.data?.message || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalUsers = data.students + data.mentors + data.admins;

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
      description: "Students in system",
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
      description: "Bootcamp cohorts",
      icon: Layers3,
      href: "/admin/batches",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6f5b] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-900/40">
            <RefreshCw size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-800 dark:text-red-300">
              Dashboard data could not be loaded
            </h2>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
            <Button size="sm" onClick={loadDashboard} className="mt-3">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADING */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold tracking-widest text-[#1f6f5b] dark:text-emerald-400 uppercase">
            ADMINISTRATION
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor your bootcamp and manage everything from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-[#15253f] dark:bg-[#0b1528] dark:text-slate-200 dark:hover:bg-[#0f1d33]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
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
              className="group rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#1f6f5b] dark:border-[#15253f] dark:bg-[#0b1528] dark:hover:border-emerald-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-[#10261f] dark:text-[#34d399] shadow-xs">
                  <Icon size={20} />
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition group-hover:text-[#1f6f5b] dark:text-slate-500 dark:text-slate-400 dark:group-hover:text-emerald-400">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-400">
                  {card.title}
                </p>

                <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </p>

                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* WELCOME + SYSTEM OVERVIEW */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* WELCOME CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-7 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f6f5b] text-white shadow-xs">
              <ShieldCheck size={24} />
            </div>

            <h2 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to your admin workspace
            </h2>

            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Manage students, mentors, batches, modules, daily tasks,
              attendance, and other bootcamp activities from one
              centralized workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/admin/batches"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1f6f5b] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#185848] active:scale-[0.98]"
              >
                View Batches
                <ArrowUpRight size={14} />
              </Link>

              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-slate-200 dark:hover:bg-[#0f1d33]"
              >
                Manage Users
              </Link>
            </div>
          </div>
        </div>

        {/* SYSTEM OVERVIEW CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-7 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-[#15253f]">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                System Overview
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Current platform statistics
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-[#10261f] dark:text-[#34d399]">
              <Layers3 size={18} />
            </div>
          </div>

          <div className="mt-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Students
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.students}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#070e1b]">
              <div
                className="h-full rounded-full bg-[#1f6f5b]"
                style={{
                  width: `${
                    totalUsers ? (data.students / totalUsers) * 100 : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Mentors
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.mentors}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#070e1b]">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${
                    totalUsers ? (data.mentors / totalUsers) * 100 : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Administrators
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {data.admins}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#070e1b]">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{
                  width: `${
                    totalUsers ? (data.admins / totalUsers) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;