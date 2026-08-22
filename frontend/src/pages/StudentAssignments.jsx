import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

function StudentAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/assignments");

      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error("Failed to load assignments:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center px-8">
        <h1 className="text-[22px] font-bold text-[#0f1b3d]">
          ASTU MSJ
        </h1>
      </header>

      <main className="max-w-[1200px] mx-auto px-8 py-10 pb-28">
        <section className="mb-7">
          <h2 className="text-3xl font-bold text-[#0f1b3d] mb-2">
            Assignments
          </h2>

          <p className="text-sm text-slate-500">
            View assignments and submit your work.
          </p>
        </section>

        <section className="bg-white rounded-xl p-6 mb-7 shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
          <span className="text-sm text-slate-500">
            All Assignments
          </span>

          <h3 className="text-[22px] font-bold text-[#0f1b3d] mt-2">
            {assignments.length} assignments
          </h3>
        </section>

        {loading && (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading assignments...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-red-600 mb-4">
              {error}
            </p>

            <button
              onClick={fetchAssignments}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {filteredAssignments.map((assignment) => (
                <article
                  key={assignment._id}
                  className="bg-white rounded-xl p-[22px] shadow-[0_4px_15px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(0,0,0,0.1)] transition"
                >
                  <div className="flex justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-[17px] font-semibold text-slate-800 mb-2">
                        {assignment.title}
                      </h3>

                      <p className="text-[13px] text-slate-500">
                        {formatDate(assignment.deadline)}
                      </p>
                    </div>

                    <span className="w-8 h-8 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {assignment.maxScore}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 line-clamp-2 mb-5">
                    {assignment.description}
                  </p>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-400 mb-3">
                      Course
                    </p>

                    <p className="text-sm font-medium text-[#1e3a5f] mb-4">
                      {assignment.course}
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          `/assignments/${assignment._id}`
                        )
                      }
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                      View Assignment
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <section className="mb-5">
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search assignments..."
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </section>

            <section className="bg-white rounded-xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-5 py-4 text-xs font-bold tracking-wide text-slate-500">
                        TITLE
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold tracking-wide text-slate-500">
                        COURSE
                      </th>

                      <th className="text-left px-5 py-4 text-xs font-bold tracking-wide text-slate-500">
                        DEADLINE
                      </th>

                      <th className="text-right px-5 py-4 text-xs font-bold tracking-wide text-slate-500">
                        ACTION
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAssignments.map(
                      (assignment) => (
                        <tr
                          key={assignment._id}
                          className="border-t border-slate-200 hover:bg-slate-50"
                        >
                          <td className="px-5 py-[18px] text-sm font-medium text-slate-800">
                            {assignment.title}
                          </td>

                          <td className="px-5 py-[18px] text-sm text-slate-500">
                            {assignment.course}
                          </td>

                          <td className="px-5 py-[18px] text-sm text-slate-500">
                            {formatDate(
                              assignment.deadline
                            )}
                          </td>

                          <td className="px-5 py-[18px] text-right">
                            <button
                              onClick={() =>
                                navigate(
                                  `/assignments/${assignment._id}`
                                )
                              }
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )}

                    {filteredAssignments.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center px-5 py-10 text-sm text-slate-400"
                        >
                          No assignments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-8 py-3">
        <input
          type="text"
          placeholder="Type here to search"
          className="block w-full max-w-[500px] mx-auto bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </footer>
    </div>
  );
}

export default StudentAssignments;