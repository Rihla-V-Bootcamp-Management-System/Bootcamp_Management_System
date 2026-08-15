import mockBatches from "../../data/mockBatches";
import {useState} from "react";
function Batches() {
  const [batches, setBatches] = useState(mockBatches);
  const [showForm, setShowForm] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [formData, setFormData] = useState({
  name: "",
  track: "",
  startDate: "",
  endDate: "",
});

  return (

    <div>
        {showForm && (
  <div className="mb-6 rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-[#071629]">
  {editingBatchId ? "Edit Batch" : "Add New Batch"}
</h2>

    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-[#52627A]">
          Batch Name
        </label>

        <input
          type="text"
          placeholder="e.g. Batch 3"
          className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-3 py-2.5 text-sm outline-none focus:border-[#1D3866]"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[#52627A]">
          Track
        </label>

        <input
          type="text"
          placeholder="e.g. Web Development"
          value={formData.track}
            onChange={(e) =>
                setFormData({
                ...formData,
                track: e.target.value,
                })
            }
          className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-3 py-2.5 text-sm outline-none focus:border-[#1D3866]"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[#52627A]">
          Start Date
        </label>

        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-3 py-2.5 text-sm outline-none focus:border-[#1D3866]"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[#52627A]">
          End Date
        </label>

        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({...formData, endDate: e.target.value})}

          className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-3 py-2.5 text-sm outline-none focus:border-[#1D3866]"
        />
      </div>
    </div>
    <button
  onClick={() => {
    setShowForm(false);
    setEditingBatchId(null);

    setFormData({
      name: "",
      track: "",
      startDate: "",
      endDate: "",
    });
  }}
  className="rounded-lg border border-[#D9D5CB] px-4 py-2 text-sm font-medium text-[#52627A] hover:bg-[#F7F5EF] px-3 py-2.5 text-sm font-medium text-[#52627A] transition hover:bg-[#F7F5EF] mt-4"
>
  Cancel
</button>

    <div className="mt-5 flex justify-end gap-3">
      <button
  onClick={() => {
    if (
    !formData.name.trim() ||
    !formData.track.trim() ||
    !formData.startDate ||
    !formData.endDate
  ) {
    window.alert("Please fill in all fields.");
    return;
  }
    else if (editingBatchId) {
      setBatches((currentBatches) =>
        currentBatches.map((batch) =>
          batch.id === editingBatchId
            ? {
                ...batch,
                name: formData.name,
                track: formData.track,
                startDate: formData.startDate,
                endDate: formData.endDate,
              }
            : batch
        )
      );
    } else {
      const newBatch = {
        id: Date.now(),
        name: formData.name,
        track: formData.track,
        startDate: formData.startDate,
        endDate: formData.endDate,
        mentors: [],
        students: [],
      };

      setBatches((currentBatches) => [
        ...currentBatches,
        newBatch,
      ]);
    }

    setFormData({
      name: "",
      track: "",
      startDate: "",
      endDate: "",
    });

    setEditingBatchId(null);
    setShowForm(false);
  }}
  className="rounded-lg bg-[#1D3866] px-5 py-2 text-sm font-medium text-white hover:bg-[#162d52]"
>
  {editingBatchId ? "Save Changes" : "Create Batch"}
</button>

    </div>
  </div>
)}
    
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071629] drop-shadow-sm">
          Batches
        </h1>

        <p className="mt-1 text-sm text-[#52627A]">
          Manage bootcamp batches and their students.
        </p>
      </div>

     
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#071629]">
            All Batches
          </h2>

          <p className="mt-1 text-sm text-[#8A96A8]">
            {batches.length} batches registered
          </p>
        </div>

            <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-[#1D3866] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#162d52]"
            >
            + Add Batch
            </button>
      </div>

     
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#071629]">
                  {batch.name}
                </h3>

                <p className="mt-1 text-sm text-[#52627A]">
                  {batch.track}
                </p>
              </div>

              <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-medium text-[#35634F]">
                Active
              </span>
            </div>

            
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8A96A8]">
                  Start Date
                </span>

                <span className="font-medium text-[#071629]">
                  {batch.startDate}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8A96A8]">
                  End Date
                </span>

                <span className="font-medium text-[#071629]">
                  {batch.endDate}
                </span>
              </div>
            </div>

            
            <div className="mt-5 flex items-center justify-between border-t border-[#E5E0D5] pt-4">
              <div>
                <p className="text-xs text-[#8A96A8]">
                  Students
                </p>

                <p className="text-lg font-bold text-[#071629]">
                  {batch.students?.length || 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#8A96A8]">
                  Mentors
                </p>

                <p className="text-lg font-bold text-[#071629]">
                  {batch.mentors?.length || 0}
                </p>
              </div>
            </div>

            
            <div className="mt-5 flex gap-2">
             <button
  onClick={() => {
    setEditingBatchId(batch.id);

    setFormData({
      name: batch.name,
      track: batch.track,
      startDate: batch.startDate,
      endDate: batch.endDate,
    });

    setShowForm(true);
  }}
  className="flex-1 rounded-lg border border-[#D9D5CB] px-3 py-2 text-sm font-medium text-[#52627A] transition hover:bg-[#F7F5EF]"
>
  Edit
</button>

            <button
  onClick={() => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${batch.name}?`
    );

    if (confirmed) {
      setBatches((currentBatches) =>
        currentBatches.filter((item) => item.id !== batch.id)
      );
    }
  }}
  className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
>
  Delete
</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Batches;
