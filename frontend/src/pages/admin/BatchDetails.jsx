import { Link, useParams } from "react-router-dom";
import mockBatches from "../../data/mockBatches";

function BatchDetails() {
  const { id } = useParams();

  const batch = mockBatches.find(
    (item) => String(item.id) === String(id)
  );

  if (!batch) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/batches"
          className="inline-flex items-center text-sm font-medium text-[#1D3866] hover:underline"
        >
          ← Back to Batches
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-700">
            Batch not found
          </h1>

          <p className="mt-1 text-sm text-red-600">
            The batch you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ==========================================
          BACK BUTTON
      ========================================== */}

      <Link
        to="/admin/batches"
        className="inline-flex items-center text-sm font-medium text-[#1D3866] transition hover:underline"
      >
        ← Back to Batches
      </Link>

      {/* ==========================================
          BATCH HEADER
      ========================================== */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div>
            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-2xl font-bold text-[#071629]">
                {batch.name}
              </h1>

              <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-medium text-[#35634F]">
                Active
              </span>

            </div>

            <p className="mt-2 text-sm text-[#52627A]">
              {batch.track}
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-[#D9D5CB] px-4 py-2.5 text-sm font-medium text-[#52627A] transition hover:bg-[#F7F5EF]"
          >
            Edit Batch
          </button>

        </div>

        {/* DATES */}

        <div className="mt-6 grid gap-4 border-t border-[#E5E0D5] pt-6 sm:grid-cols-2">

          <div>
            <p className="text-xs text-[#8A96A8]">
              Start Date
            </p>

            <p className="mt-1 text-sm font-medium text-[#071629]">
              {batch.startDate}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8A96A8]">
              End Date
            </p>

            <p className="mt-1 text-sm font-medium text-[#071629]">
              {batch.endDate}
            </p>
          </div>

        </div>

      </div>

      {/* ==========================================
          STATISTICS
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#8A96A8]">
            Students
          </p>

          <p className="mt-2 text-2xl font-bold text-[#071629]">
            {batch.students?.length || 0}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#8A96A8]">
            Mentors
          </p>

          <p className="mt-2 text-2xl font-bold text-[#071629]">
            {batch.mentors?.length || 0}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#8A96A8]">
            Levels
          </p>

          <p className="mt-2 text-2xl font-bold text-[#071629]">
            {batch.levels?.length || 0}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#8A96A8]">
            Modules
          </p>

          <p className="mt-2 text-2xl font-bold text-[#071629]">
            {batch.modules?.length || 0}
          </p>
        </div>

      </div>

      {/* ==========================================
          LEVELS / LABELS
      ========================================== */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-[#E5E0D5] p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-[#071629]">
              Levels
            </h2>

            <p className="mt-1 text-sm text-[#8A96A8]">
              Organize the bootcamp into learning levels.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d52]"
          >
            + Add Level
          </button>

        </div>

        <div className="p-6">

          {batch.levels?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">

              {batch.levels.map((level, index) => (

                <div
                  key={level.id || index}
                  className="rounded-lg border border-[#E5E0D5] p-5 transition hover:border-[#1D3866]"
                >

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                        Level {index + 1}
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-[#071629]">
                        {level.name || `Level ${index + 1}`}
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#EEF2F7] px-3 py-1 text-xs font-medium text-[#52627A]">
                      {level.modules?.length || 0} Modules
                    </span>

                  </div>

                  {level.description && (
                    <p className="mt-3 text-sm leading-6 text-[#52627A]">
                      {level.description}
                    </p>
                  )}

                  <button
                    type="button"
                    className="mt-4 text-sm font-medium text-[#1D3866] hover:underline"
                  >
                    View Level →
                  </button>

                </div>

              ))}

            </div>
          ) : (
            <div className="rounded-lg bg-[#F7F5EF] p-8 text-center">

              <p className="text-sm font-medium text-[#52627A]">
                No levels have been created yet.
              </p>

              <p className="mt-1 text-xs text-[#8A96A8]">
                Add the first level to start organizing this batch.
              </p>

              <button
                type="button"
                className="mt-4 rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d52]"
              >
                + Add First Level
              </button>

            </div>
          )}

        </div>

      </div>

      {/* ==========================================
          MODULES
      ========================================== */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-[#E5E0D5] p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-[#071629]">
              Modules
            </h2>

            <p className="mt-1 text-sm text-[#8A96A8]">
              Learning modules included in this batch.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-[#D9D5CB] px-4 py-2.5 text-sm font-medium text-[#52627A] transition hover:bg-[#F7F5EF]"
          >
            + Add Module
          </button>

        </div>

        <div className="p-6">

          {batch.modules?.length > 0 ? (
            <div className="space-y-3">

              {batch.modules.map((module, index) => (

                <div
                  key={module.id || index}
                  className="flex flex-col gap-3 rounded-lg border border-[#E5E0D5] p-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div>
                    <p className="text-xs text-[#8A96A8]">
                      Module {index + 1}
                    </p>

                    <h3 className="mt-1 text-sm font-semibold text-[#071629]">
                      {module.name || `Module ${index + 1}`}
                    </h3>

                    {module.description && (
                      <p className="mt-1 text-xs text-[#52627A]">
                        {module.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="text-sm font-medium text-[#1D3866] hover:underline"
                  >
                    View Module →
                  </button>

                </div>

              ))}

            </div>
          ) : (
            <div className="rounded-lg bg-[#F7F5EF] p-8 text-center">

              <p className="text-sm font-medium text-[#52627A]">
                No modules have been added yet.
              </p>

              <p className="mt-1 text-xs text-[#8A96A8]">
                Modules will contain theory, tasks, and assignments.
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default BatchDetails;