import { useEffect, useState } from "react";
import {
  Mail,
  UserRound,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import apiClient from "../services/apiClient";

function MyMentor() {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMentor = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/mentors/my-mentor");

      setMentor(response.data?.mentor || null);
    } catch (error) {
      console.error("Get my mentor error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load your mentor."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentor();
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b1528] p-6 text-slate-900 dark:text-white">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-[#15253f] border-t-emerald-500" />

            <p className="text-slate-500 dark:text-slate-400">
              Loading your mentor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1528] p-6 text-slate-900 dark:text-white">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          My Mentor
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          View the mentor assigned to you and their contact
          information.
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <AlertCircle
            size={22}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          NO MENTOR
      ===================================================== */}

      {!error && !mentor && (
        <div className="rounded-3xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-10 shadow-sm">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
              <UserRound
                size={38}
                className="text-amber-500"
              />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              No Mentor Assigned Yet
            </h2>

            <p className="mt-3 leading-6 text-slate-500 dark:text-slate-400">
              You don't have a mentor assigned to you yet.
              Please wait for an administrator to assign a
              mentor.
            </p>

            <button
              onClick={loadMentor}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1f6f5b] px-5 py-3 font-semibold text-white transition hover:bg-[#185848]"
            >
              <RefreshCw size={18} />
              Check Again
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          MENTOR CARD
      ===================================================== */}

      {!error && mentor && (
        <div className="max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">
            {/* TOP SECTION */}

            <div className="border-b border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-8 py-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* AVATAR */}

                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-emerald-100">
                  <UserRound
                    size={48}
                    className="text-emerald-600"
                  />
                </div>

                {/* NAME */}

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Assigned Mentor
                    </span>

                    <ShieldCheck
                      size={18}
                      className="text-emerald-600"
                    />
                  </div>

                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {mentor.name}
                  </h2>

                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Your assigned mentor
                  </p>
                </div>
              </div>
            </div>

            {/* INFORMATION */}

            <div className="grid grid-cols-1 gap-5 p-8 md:grid-cols-2">
              {/* NAME */}

              <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f1ed]">
                    <UserRound
                      size={22}
                      className="text-[#1f6f5b]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {mentor.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* EMAIL */}

              <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                    <Mail
                      size={22}
                      className="text-purple-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 truncate font-semibold text-slate-900 dark:text-white">
                      {mentor.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* ROLE */}

              <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                    <GraduationCap
                      size={22}
                      className="text-amber-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Role
                    </p>

                    <p className="mt-1 font-semibold capitalize text-slate-900 dark:text-white">
                      {mentor.mentorRole ||
                        mentor.level ||
                        "Mentor"}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS */}

              <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                    <ShieldCheck
                      size={22}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </p>

                    <p className="mt-1 font-semibold text-emerald-600">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTACT */}

            <div className="border-t border-slate-200 dark:border-[#15253f] p-8">
              <a
                href={`mailto:${mentor.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1f6f5b] px-6 py-3 font-semibold text-white transition hover:bg-[#185848]"
              >
                <Mail size={19} />
                Contact Mentor
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyMentor;