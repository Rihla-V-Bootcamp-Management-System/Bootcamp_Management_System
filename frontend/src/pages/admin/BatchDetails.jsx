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
    <div className="space-y-6">

      {/* Header Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <Link
          to="/admin/batches"
          className="inline-flex w-fit items-center rounded-lg border border-[#D9D5CB] bg-white px-4 py-2.5 text-sm font-medium text-[#52627A] transition hover:bg-[#F7F5EF]"
        >
          ← Back to Batches
        </Link>

        <button
          type="button"
          className="w-fit rounded-lg border border-[#D9D5CB] bg-white px-4 py-2.5 text-sm font-medium text-[#52627A] transition hover:bg-[#F7F5EF]"
        >
          Edit Batch
        </button>

      </div>


      {/* Batch Header */}
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

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

        </div>

      </div>


      {/* Tabs */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="flex min-w-max">

          <button
            type="button"
            className="border-b-2 border-[#1D3866] px-5 py-4 text-sm font-semibold text-[#1D3866]"
          >
            Overview
          </button>

          <button
            type="button"
            className="border-b-2 border-transparent px-5 py-4 text-sm font-medium text-[#8A96A8] transition hover:text-[#1D3866]"
          >
            Levels
          </button>

          <button
            type="button"
            className="border-b-2 border-transparent px-5 py-4 text-sm font-medium text-[#8A96A8] transition hover:text-[#1D3866]"
          >
            Modules
          </button>

          <button
            type="button"
            className="border-b-2 border-transparent px-5 py-4 text-sm font-medium text-[#8A96A8] transition hover:text-[#1D3866]"
          >
            Capstone Project
          </button>

          <button
            type="button"
            className="border-b-2 border-transparent px-5 py-4 text-sm font-medium text-[#8A96A8] transition hover:text-[#1D3866]"
          >
            Resources
          </button>

        </div>

      </div>


      {/* Main Overview Content */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">


        {/* LEFT SIDE */}
        <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

          {/* Batch Information */}
          <div className="p-6">

            <div className="flex items-center gap-3">

              <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-semibold text-[#35634F]">
                ACTIVE
              </span>

              <span className="text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
                Batch
              </span>

            </div>


            <h2 className="mt-4 text-2xl font-bold text-[#071629]">
              {batch.name}
            </h2>


            <p className="mt-3 text-sm leading-7 text-[#52627A]">
              {batch.track}
            </p>


            {/* Dates */}
            <div className="mt-6 grid gap-4 border-t border-[#E5E0D5] pt-6 sm:grid-cols-2">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                  Start Date
                </p>

                <p className="mt-2 text-sm font-semibold text-[#071629]">
                  {batch.startDate}
                </p>

              </div>


              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                  End Date
                </p>

                <p className="mt-2 text-sm font-semibold text-[#071629]">
                  {batch.endDate}
                </p>

              </div>

            </div>

          </div>


          {/* Description */}
          <div className="border-t border-[#E5E0D5] p-6">

            <p className="max-w-4xl text-sm leading-7 text-[#52627A]">
              What happens when knowledge becomes a responsibility, skills become a
              form of service, and technology becomes a way to create lasting impact?
              The ASTU MSJ Summer Bootcamp is a journey built around that idea —
              combining practical software development, teamwork, discipline, and
              continuous learning with the values of our deen. Through hands-on
              challenges, real projects, mentorship, and peer collaboration, students
              are encouraged to seek knowledge, build with purpose, and use their
              skills to benefit others. This is more than a summer of coding; it is a
              step toward becoming capable, responsible, and purpose-driven
              professionals — In shaa Allah.
            </p>

          </div>

        </div>


        {/* RIGHT SIDE - BATCH META */}
        <div className="h-fit rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

          <div className="p-5">

            <h2 className="text-lg font-bold text-[#071629]">
              Batch Meta
            </h2>


            <div className="mt-5 divide-y divide-[#E5E0D5]">

              {/* STATUS */}
              <div className="flex items-center justify-between py-4">

                <div>
                  <p className="text-xs text-[#8A96A8]">
                    Status
                  </p>
                </div>

                <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-semibold text-[#35634F]">
                  Active
                </span>

              </div>


              {/* TRACK */}
              <div className="flex items-center justify-between gap-4 py-4">

                <p className="text-xs text-[#8A96A8]">
                  Track
                </p>

                <p className="text-right text-sm font-semibold text-[#071629]">
                  {batch.track}
                </p>

              </div>


              {/* STUDENTS */}
              <div className="flex items-center justify-between py-4">

                <p className="text-xs text-[#8A96A8]">
                  Students
                </p>

                <p className="text-sm font-semibold text-[#071629]">
                  {batch.students?.length || 0}
                </p>

              </div>


              {/* MENTORS */}
              <div className="flex items-center justify-between py-4">

                <p className="text-xs text-[#8A96A8]">
                  Mentors
                </p>

                <p className="text-sm font-semibold text-[#071629]">
                  {batch.mentors?.length || 0}
                </p>

              </div>


              {/* LEVELS */}
              <div className="flex items-center justify-between py-4">

                <p className="text-xs text-[#8A96A8]">
                  Levels
                </p>

                <p className="text-sm font-semibold text-[#071629]">
                  {batch.levels?.length || 0}
                </p>

              </div>


              {/* MODULES */}
              <div className="flex items-center justify-between py-4">

                <p className="text-xs text-[#8A96A8]">
                  Modules
                </p>

                <p className="text-sm font-semibold text-[#071629]">
                  {batch.modules?.length || 0}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* LEVELS */}
      <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-[#E5E0D5] p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-lg font-semibold text-[#071629]">
              Levels
            </h2>

            <p className="mt-1 text-sm text-[#8A96A8]">
              Organize the batch into learning levels.
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

                  <div className="flex items-start justify-between gap-4">

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
                className="mt-4 rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-medium text-white"
              >
                + Add First Level
              </button>

            </div>

          )}

        </div>

      </div>


      {/* MODULES */}
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