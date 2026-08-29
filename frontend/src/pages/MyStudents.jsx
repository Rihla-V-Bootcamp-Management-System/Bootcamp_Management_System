import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  GraduationCap,
  Search,
  RefreshCw,
  AlertCircle,
  UserRound,
} from "lucide-react";

import apiClient from "../services/apiClient";

function MyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/mentors/my-students"
      );

      console.log("My students:", response.data);

      setStudents(
        response.data?.students || []
      );
    } catch (error) {
      console.error(
        "Get my students error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load your students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) => {
      const value = search
        .trim()
        .toLowerCase();

      if (!value) return true;

      return (
        String(student.name || "")
          .toLowerCase()
          .includes(value) ||
        String(student.email || "")
          .toLowerCase()
          .includes(value)
      );
    }
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-[#15253f] border-t-emerald-500" />

            <p className="text-slate-500 dark:text-slate-400">
              Loading your students...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            My Students
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            View the students assigned to you.
          </p>
        </div>

        <button
          onClick={loadStudents}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-5 py-3 font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:bg-[#070e1b]"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* ERROR */}
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

      {/* STAT */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-3xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
              <Users
                size={27}
                className="text-emerald-600"
              />
            </div>

            <div>
              <p className="text-3xl font-bold">
                {students.length}
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Assigned Students
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-3xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f1ed]">
              <GraduationCap
                size={27}
                className="text-[#1f6f5b]"
              />
            </div>

            <div>
              <p className="text-3xl font-bold">
                {students.filter(
                  (student) => student.batchId
                ).length}
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Students With Batch
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-3xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
              <UserRound
                size={27}
                className="text-purple-600"
              />
            </div>

            <div>
              <p className="text-3xl font-bold">
                {filteredStudents.length}
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Students Showing
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* SEARCH */}
      <div className="mb-6">

        <div className="relative">

          <Search
            size={21}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search your students..."
            className="w-full rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] py-4 pl-12 pr-5 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />

        </div>

      </div>

      {/* STUDENTS */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead className="border-b border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b]">

              <tr className="text-left">

                <th className="px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Student
                </th>

                <th className="px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </th>

                <th className="px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Batch
                </th>

                <th className="px-6 py-5 text-right text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Work
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    className="px-6 py-16 text-center"
                  >

                    <Users
                      size={40}
                      className="mx-auto mb-4 text-slate-300"
                    />

                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      No students found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Students assigned to you will
                      appear here.
                    </p>

                  </td>

                </tr>

              ) : (

                filteredStudents.map(
                  (student) => (

                    <tr
                      key={student._id}
                      className="border-b border-slate-100 dark:border-[#15253f] transition hover:bg-slate-50 dark:bg-[#070e1b]"
                    >

                      {/* STUDENT */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">

                            <UserRound
                              size={20}
                              className="text-emerald-600"
                            />

                          </div>

                          <div>

                            <p className="font-semibold">
                              {student.name}
                            </p>

                            <span className="mt-1 inline-block rounded-full bg-[#e5f1ed] px-3 py-1 text-xs font-semibold text-[#1f6f5b]">
                              Student
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">

                          <Mail size={17} />

                          {student.email}

                        </div>

                      </td>

                      {/* BATCH */}

                      <td className="px-6 py-5">

                        {student.batchId ? (
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {student.batchId.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            No batch
                          </span>
                        )}

                      </td>

                      {/* WORK */}

                      <td className="px-6 py-5 text-right">

                        <button
                          className="rounded-xl bg-[#1f6f5b] px-4 py-2.5 font-semibold text-white transition hover:bg-[#185848]"
                        >
                          View Work
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default MyStudents;