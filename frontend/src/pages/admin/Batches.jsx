import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

function Batches() {
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    sessionStartTime: "09:00",
    sessionEndTime: "13:00",
  });

  // =========================================================
  // LOAD BATCHES
  // =========================================================

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/batches");

      console.log("BATCHES RESPONSE:", response.data);

      setBatches(response.data.batches || []);
    } catch (err) {
      console.error("LOAD BATCHES ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load batches"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBatches();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData({
      name: "",
      startDate: "",
      sessionStartTime: "09:00",
      sessionEndTime: "13:00",
    });

    setEditingBatchId(null);
    setShowForm(false);
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Batch name is required.");
      return;
    }

    if (!formData.startDate) {
      setError("Start date is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        startDate: formData.startDate,
        sessionStartTime: formData.sessionStartTime,
        sessionEndTime: formData.sessionEndTime,
      };

      if (editingBatchId) {
        await apiClient.put(
          `/batches/${editingBatchId}`,
          payload
        );

        setSuccess("Batch updated successfully.");
      } else {
        await apiClient.post(
          "/batches",
          payload
        );

        setSuccess("Batch created successfully.");
      }

      resetForm();

      await loadBatches();
    } catch (err) {
      console.error("SAVE BATCH ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save batch"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (batch) => {
    setEditingBatchId(batch._id);

    setFormData({
      name: batch.name || "",
      startDate: batch.startDate
        ? new Date(batch.startDate)
            .toISOString()
            .split("T")[0]
        : "",
      sessionStartTime:
        batch.sessionStartTime || "09:00",
      sessionEndTime:
        batch.sessionEndTime || "13:00",
    });

    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (batch) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${batch.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await apiClient.delete(
        `/batches/${batch._id}`
      );

      setSuccess("Batch deleted successfully.");

      await loadBatches();
    } catch (err) {
      console.error("DELETE BATCH ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete batch"
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-[#071629]">
          Batches
        </h1>

        <p className="mt-1 text-sm text-[#52627A]">
          Manage bootcamp batches and their students.
        </p>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            {success}
          </p>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* FORM */}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-[#071629]">
            {editingBatchId
              ? "Edit Batch"
              : "Add New Batch"}
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            {/* NAME */}

            <div>
              <label className="text-sm font-medium text-[#52627A]">
                Batch Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Batch 3"
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-3 py-2.5 text-sm outline-none focus:border-[#1D3866]"
              />
            </div>

            {/* START DATE */}

            <div>
              <label className="text-sm font-medium text-[#52627A]">
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-3 py-2.5 text-sm outline-none focus:border-[#1D3866]"
              />
            </div>

            {/* SESSION START */}

            <div>
              <label className="text-sm font-medium text-[#52627A]">
                Session Start
              </label>

              <input
                type="time"
                name="sessionStartTime"
                value={formData.sessionStartTime}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-3 py-2.5 text-sm outline-none focus:border-[#1D3866]"
              />
            </div>

            {/* SESSION END */}

            <div>
              <label className="text-sm font-medium text-[#52627A]">
                Session End
              </label>

              <input
                type="time"
                name="sessionEndTime"
                value={formData.sessionEndTime}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-3 py-2.5 text-sm outline-none focus:border-[#1D3866]"
              />
            </div>

          </div>

          {/* BUTTONS */}

          <div className="mt-6 flex gap-3">

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#1D3866] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingBatchId
                ? "Save Changes"
                : "Create Batch"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-[#D9D5CB] px-5 py-2.5 text-sm font-medium text-[#52627A] hover:bg-[#F7F5EF]"
            >
              Cancel
            </button>

          </div>
        </form>
      )}

      {/* ALL BATCHES */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-lg font-semibold text-[#071629]">
            All Batches
          </h2>

          <p className="mt-1 text-sm text-[#8A96A8]">
            {batches.length} batches registered
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-[#1D3866] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#162d52]"
        >
          + Add Batch
        </button>

      </div>

      {/* LOADING */}

      {loading ? (
        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center">
          <p className="text-sm text-[#8A96A8]">
            Loading batches...
          </p>
        </div>
      ) : batches.length === 0 ? (

        <div className="rounded-xl border border-[#E5E0D5] bg-white p-10 text-center">
          <p className="text-sm font-medium text-[#52627A]">
            No batches found.
          </p>
        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {batches.map((batch) => (

            <div
              key={batch._id}
              className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm"
            >

              {/* CLICK BATCH */}

              <Link
                to={`/admin/batches/${batch._id}`}
                className="block rounded-lg transition hover:bg-[#F7F5EF]"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <h3 className="text-lg font-semibold text-[#071629]">
                      {batch.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#52627A]">
                      Bootcamp Batch
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
                      {batch.startDate
                        ? new Date(
                            batch.startDate
                          ).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#8A96A8]">
                      Session
                    </span>

                    <span className="font-medium text-[#071629]">
                      {batch.sessionStartTime || "09:00"}
                      {" - "}
                      {batch.sessionEndTime || "13:00"}
                    </span>
                  </div>

                </div>

                <div className="mt-5 grid grid-cols-3 border-t border-[#E5E0D5] pt-4">

                  <div>
                    <p className="text-xs text-[#8A96A8]">
                      Students
                    </p>

                    <p className="text-lg font-bold text-[#071629]">
                      {batch.studentIds?.length || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8A96A8]">
                      Mentors
                    </p>

                    <p className="text-lg font-bold text-[#071629]">
                      {batch.mentorIds?.length || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8A96A8]">
                      Modules
                    </p>

                    <p className="text-lg font-bold text-[#071629]">
                      {batch.moduleCount || 0}
                    </p>
                  </div>

                </div>

              </Link>

              {/* ACTIONS */}

              <div className="mt-5 flex gap-2">

                <button
                  type="button"
                  onClick={() => handleEdit(batch)}
                  className="flex-1 rounded-lg border border-[#D9D5CB] px-3 py-2 text-sm font-medium text-[#52627A] hover:bg-[#F7F5EF]"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(batch)}
                  className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Batches;