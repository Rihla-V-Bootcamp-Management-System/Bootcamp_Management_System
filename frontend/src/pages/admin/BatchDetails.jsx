import { useParams, Link } from "react-router-dom";
import mockBatches from "../../data/mockBatches";

function BatchDetails() {
  const { batchId } = useParams();

  const batch = mockBatches.find(
    (item) => item.id === Number(batchId)
  );

  if (!batch) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">
          Batch not found
        </h1>

        <Link
          to="/admin/batches"
          className="mt-4 inline-block text-blue-600"
        >
          ← Back to Batches
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">

      
      <div className="mb-8">
        <Link
          to="/admin/batches"
          className="text-sm text-[#52627A] hover:text-[#1D3866]"
        >
          ← Back to Batches
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#071629]">
              {batch.name}
            </h1>

            <p className="mt-1 text-[#52627A]">
              {batch.track}
            </p>
          </div>

          <span className="rounded-full bg-[#E4EFE9] px-4 py-2 text-sm font-medium text-[#35634F]">
            Active
          </span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#8A96A8]">
            Start Date
          </p>

          <p className="mt-2 font-semibold text-[#071629]">
            {batch.startDate}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#8A96A8]">
            End Date
          </p>

          <p className="mt-2 font-semibold text-[#071629]">
            {batch.endDate}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#8A96A8]">
            Students
          </p>

          <p className="mt-2 font-semibold text-[#071629]">
            {batch.students?.length || 0}
          </p>
        </div>

      </div>

      
      <div className="mt-8 rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#071629]">
              Levels
            </h2>

            <p className="mt-1 text-sm text-[#8A96A8]">
              Manage levels for {batch.name}
            </p>
          </div>

          <button
            className="rounded-lg bg-[#1D3866] px-4 py-2 text-sm font-medium text-white hover:bg-[#162d52]"
          >
            + Add Level
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {batch.levels?.map((level) => (
            <div
              key={level.id}
              className="rounded-xl border border-[#E5E0D5] p-5"
            >
              <h3 className="text-lg font-semibold text-[#071629]">
                {level.name}
              </h3>

              <p className="mt-2 text-sm text-[#52627A]">
                {level.description}
              </p>

              <button className="mt-4 text-sm font-medium text-[#1D3866]">
                Manage Level →
              </button>
            </div>
          ))}

          {(!batch.levels || batch.levels.length === 0) && (
            <p className="text-sm text-[#8A96A8]">
              No levels have been added to this batch yet.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default BatchDetails;