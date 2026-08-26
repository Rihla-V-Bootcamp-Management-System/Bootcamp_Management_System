import { useEffect, useState } from "react";
import {
  Users,
  UserRoundCheck,
  ShieldCheck,
  Layers,
  CalendarDays,
  Clock3,
  GraduationCap,
} from "lucide-react";
import apiClient from "../../services/apiClient";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/analytics/overview"
      );

      console.log(
        "ANALYTICS RESPONSE:",
        response.data
      );

      setData(response.data);
    } catch (err) {
      console.error(
        "LOAD ANALYTICS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadAnalytics();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#8A96A8]">
          Loading analytics...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            onClick={loadAnalytics}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const batches = data?.batches || [];

  // =====================================================
  // STAT CARD
  // =====================================================

  const statCards = [
    {
      title: "Total Students",
      value: overview.students || 0,
      icon: Users,
      description: "Registered students",
    },
    {
      title: "Total Mentors",
      value: overview.mentors || 0,
      icon: UserRoundCheck,
      description: "Active mentors",
    },
    {
      title: "Total Admins",
      value: overview.admins || 0,
      icon: ShieldCheck,
      description: "System administrators",
    },
    {
      title: "Total Batches",
      value: overview.batches || 0,
      icon: Layers,
      description: "Bootcamp batches",
    },
  ];

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6 p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-2xl font-bold text-[#071629]">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-[#8A96A8]">
          Overview of your bootcamp management system.
        </p>
      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-[#8A96A8]">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#071629]">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-[#8A96A8]">
                    {card.description}
                  </p>
                </div>

                <div className="rounded-lg bg-[#F1F4F8] p-3">
                  <Icon
                    size={21}
                    className="text-[#1D3866]"
                  />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* =================================================
          USER DISTRIBUTION
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-[#F1F4F8] p-3">
              <Users
                size={20}
                className="text-[#1D3866]"
              />
            </div>

            <div>
              <h2 className="font-semibold text-[#071629]">
                Students
              </h2>

              <p className="text-xs text-[#8A96A8]">
                Registered learners
              </p>
            </div>

          </div>

          <p className="mt-6 text-4xl font-bold text-[#071629]">
            {overview.students || 0}
          </p>

        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-[#F1F4F8] p-3">
              <GraduationCap
                size={20}
                className="text-[#1D3866]"
              />
            </div>

            <div>
              <h2 className="font-semibold text-[#071629]">
                Mentors
              </h2>

              <p className="text-xs text-[#8A96A8]">
                Supporting students
              </p>
            </div>

          </div>

          <p className="mt-6 text-4xl font-bold text-[#071629]">
            {overview.mentors || 0}
          </p>

        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-[#F1F4F8] p-3">
              <Layers
                size={20}
                className="text-[#1D3866]"
              />
            </div>

            <div>
              <h2 className="font-semibold text-[#071629]">
                Batches
              </h2>

              <p className="text-xs text-[#8A96A8]">
                Active bootcamp groups
              </p>
            </div>

          </div>

          <p className="mt-6 text-4xl font-bold text-[#071629]">
            {overview.batches || 0}
          </p>

        </div>

      </div>

      {/* =================================================
          BATCH PERFORMANCE
      ================================================= */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="border-b border-[#E5E0D5] p-6">

          <h2 className="text-lg font-semibold text-[#071629]">
            Batch Overview
          </h2>

          <p className="mt-1 text-sm text-[#8A96A8]">
            Overview of students, mentors and schedules
            across batches.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead>
              <tr className="border-b border-[#E5E0D5] text-left">

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
                  Batch
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
                  Students
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
                  Mentors
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
                  Start Date
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
                  Session
                </th>

              </tr>
            </thead>

            <tbody>

              {batches.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-sm text-[#8A96A8]"
                  >
                    No batches found.
                  </td>
                </tr>

              ) : (

                batches.map((batch) => (

                  <tr
                    key={batch.id}
                    className="border-b border-[#E5E0D5] last:border-b-0 hover:bg-[#FAFAF8]"
                  >

                    {/* BATCH */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-[#F1F4F8] p-2.5">
                          <Layers
                            size={18}
                            className="text-[#1D3866]"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#071629]">
                            {batch.name}
                          </p>

                          <p className="text-xs text-[#8A96A8]">
                            Bootcamp Batch
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* STUDENTS */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <Users
                          size={16}
                          className="text-[#8A96A8]"
                        />

                        <span className="text-sm font-semibold text-[#071629]">
                          {batch.students}
                        </span>

                      </div>

                    </td>

                    {/* MENTORS */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <UserRoundCheck
                          size={16}
                          className="text-[#8A96A8]"
                        />

                        <span className="text-sm font-semibold text-[#071629]">
                          {batch.mentors}
                        </span>

                      </div>

                    </td>

                    {/* DATE */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <CalendarDays
                          size={16}
                          className="text-[#8A96A8]"
                        />

                        <span className="text-sm text-[#52627A]">
                          {formatDate(batch.startDate)}
                        </span>

                      </div>

                    </td>

                    {/* SESSION */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <Clock3
                          size={16}
                          className="text-[#8A96A8]"
                        />

                        <span className="text-sm text-[#52627A]">
                          {batch.sessionStartTime}
                          {" - "}
                          {batch.sessionEndTime}
                        </span>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Analytics;