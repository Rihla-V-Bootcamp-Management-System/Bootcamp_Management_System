import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [modules, setModules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD BATCH
  // =========================================================

  const loadBatch = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/batches/${id}`
      );

      console.log("BATCH RESPONSE:", response.data);

      setBatch(response.data.batch);
    } catch (err) {
      console.error("LOAD BATCH ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load batch"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD MODULES
  // =========================================================

  const loadModules = async () => {
    try {
      setModulesLoading(true);

      const response = await apiClient.get(
        `/modules?batchId=${id}`
      );

      console.log("MODULES RESPONSE:", response.data);

      setModules(response.data.modules || []);
    } catch (err) {
      console.error("LOAD MODULES ERROR:", err);
    } finally {
      setModulesLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!id) return;

    loadBatch();
    loadModules();
  }, [id]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="p-6 text-sm text-[#8A96A8]">
        Loading batch...
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !batch) {
    return (
      <div className="space-y-6">

        <Link
          to="/admin/batches"
          className="inline-flex text-sm font-medium text-[#1D3866] hover:underline"
        >
          ← Back to Batches
        </Link>
        

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">
            Batch not found
          </h1>

          <p className="mt-1 text-sm text-red-600">
            {error || "The batch does not exist."}
          </p>
        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* BACK */}

      <Link
        to="/admin/batches"
        className="inline-flex rounded-lg border border-[#D9D5CB] bg-white px-4 py-2.5 text-sm font-medium text-[#52627A] hover:bg-[#F7F5EF]"
      >
        ← Back to Batches
      </Link>
      

      {/* HEADER */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-2xl font-bold text-[#071629]">
                {batch.name}
              </h1>

              <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-medium text-[#35634F]">
                Active
              </span>

            </div>

            <p className="mt-2 text-sm text-[#52627A]">
              Bootcamp Batch
            </p>

          </div>

        </div>

      </div>

      {/* NAVIGATION */}

        

    <div className="sticky top-0 z-30 -mx-6 overflow-x-auto border-b border-[#E5E0D5] bg-white/95 shadow-sm backdrop-blur">

      <div className="flex min-w-max px-2">

        {/* OVERVIEW */}

        <Link
          to={`/admin/batches/${id}`}
          className="border-b-2 border-[#1D3866] px-6 py-4 text-sm font-semibold text-[#1D3866] transition hover:bg-[#F7F9FC]"
        >
          Overview
        </Link>

        {/* LEVELS */}

        <Link
          to={`/admin/levels?batchId=${batch._id || batch.id}`}
          className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-[#52627A] transition hover:border-[#1D3866] hover:bg-[#F7F9FC] hover:text-[#1D3866]"
        >
          Levels
        </Link>

        {/* DAILY TASKS */}

        <Link
          to={`/admin/daily-tasks?batchId=${batch._id || batch.id}`}
          className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-[#52627A] transition hover:border-[#1D3866] hover:bg-[#F7F9FC] hover:text-[#1D3866]"
        >
          Daily Tasks
        </Link>

        {/* MODULES */}

        <button
          type="button"
          onClick={() =>
            navigate(`/admin/modules?batchId=${id}`)
          }
          className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-[#52627A] transition hover:border-[#1D3866] hover:bg-[#F7F9FC] hover:text-[#1D3866]"
        >
          Modules
        </button>

        {/* CAPSTONE */}

        <button
          type="button"
          className="border-b-2 border-transparent px-6 py-4 text-sm font-medium text-[#52627A] transition hover:border-[#1D3866] hover:bg-[#F7F9FC] hover:text-[#1D3866]"
        >
          Capstone Project
        </button>

      </div>

    </div>
      {/* BATCH INFO */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">

        <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

          <div className="p-6">

            <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-semibold text-[#35634F]">
              ACTIVE
            </span>

            <h2 className="mt-4 text-2xl font-bold text-[#071629]">
              {batch.name}
            </h2>

            <div className="mt-6 grid gap-4 border-t border-[#E5E0D5] pt-6 sm:grid-cols-2">

              <div>
                <p className="text-xs uppercase tracking-wide text-[#8A96A8]">
                  Start Date
                </p>

                <p className="mt-2 text-sm font-semibold text-[#071629]">
                  {batch.startDate
                    ? new Date(
                        batch.startDate
                      ).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-[#8A96A8]">
                  Session
                </p>

                <p className="mt-2 text-sm font-semibold text-[#071629]">
                  {batch.sessionStartTime || "09:00"}
                  {" - "}
                  {batch.sessionEndTime || "13:00"}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* META */}

        <div className="h-fit rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

          <div className="p-5">

            <h2 className="text-lg font-bold text-[#071629]">
              Batch Meta
            </h2>

            <div className="mt-5 divide-y divide-[#E5E0D5]">

              <div className="flex justify-between py-4">
                <span className="text-xs text-[#8A96A8]">
                  Students
                </span>

                <span className="text-sm font-semibold">
                  {batch.studentIds?.length || 0}
                </span>
              </div>

              <div className="flex justify-between py-4">
                <span className="text-xs text-[#8A96A8]">
                  Mentors
                </span>

                <span className="text-sm font-semibold">
                  {batch.mentorIds?.length || 0}
                </span>
              </div>

              <div className="flex justify-between py-4">
                <span className="text-xs text-[#8A96A8]">
                  Modules
                </span>

                <span className="text-sm font-semibold">
                  {modules.length}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* MODULES PREVIEW */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-[#E5E0D5] p-6">

          <div>
            <h2 className="text-lg font-semibold text-[#071629]">
              Modules
            </h2>

            <p className="mt-1 text-sm text-[#8A96A8]">
              Modules belonging to this batch.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/modules?batchId=${id}`)
            }
            className="rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#162d52]"
          >
            Manage Modules
          </button>

        </div>

        <div className="p-6">

          {modulesLoading ? (

            <p className="text-sm text-[#8A96A8]">
              Loading modules...
            </p>

          ) : modules.length === 0 ? (

            <div className="rounded-lg bg-[#F7F5EF] p-8 text-center">

              <p className="text-sm font-medium text-[#52627A]">
                No modules added yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/modules?batchId=${id}`)
                }
                className="mt-4 rounded-lg bg-[#1D3866] px-4 py-2 text-sm font-medium text-white"
              >
                + Add Module
              </button>

            </div>

          ) : (

            <div className="space-y-3">

              {modules.map((module, index) => (

                <Link
                  key={module._id}
                  to={`/admin/modules/${module._id}/resources`}
                  className="block rounded-lg border border-[#E5E0D5] p-4 hover:border-[#1D3866]"
                >

                  <p className="text-xs text-[#8A96A8]">
                    Level {module.level} • Module {index + 1}
                  </p>

                  <h3 className="mt-1 text-sm font-semibold text-[#071629]">
                    {module.title}
                  </h3>

                  {module.description && (
                    <p className="mt-1 text-xs text-[#52627A]">
                      {module.description}
                    </p>
                  )}

                </Link>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default BatchDetails;