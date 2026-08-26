import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiClient from "../../../services/apiClient";

function Levels() {
  const [searchParams] = useSearchParams();

  const batchId = searchParams.get("batchId");

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    levelNumber: "",
    order: "",
  });

  // =====================================================
  // LOAD LEVELS
  // =====================================================

  const loadLevels = async () => {
    try {
      setLoading(true);
      setError("");

      const url = batchId
        ? `/levels?batchId=${batchId}`
        : "/levels";

      const response = await apiClient.get(url);

      setLevels(response.data.levels || []);
    } catch (err) {
      console.error("LOAD LEVELS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load levels"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, [batchId]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      levelNumber: "",
      order: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!batchId) {
      setError(
        "No batch selected. Open Levels from a batch."
      );
      return;
    }

    if (
      !form.name.trim() ||
      !form.levelNumber
    ) {
      setError(
        "Level name and level number are required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        levelNumber: Number(form.levelNumber),
        batchId,
        order:
          Number(form.order) ||
          Number(form.levelNumber),
      };

      if (editingId) {
        await apiClient.put(
          `/levels/${editingId}`,
          payload
        );

        setSuccess(
          "Level updated successfully."
        );
      } else {
        await apiClient.post(
          "/levels",
          payload
        );

        setSuccess(
          "Level created successfully."
        );
      }

      resetForm();

      await loadLevels();
    } catch (err) {
      console.error("SAVE LEVEL ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save level"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (level) => {
    setEditingId(level._id);

    setForm({
      name: level.name || "",
      description: level.description || "",
      levelNumber: level.levelNumber || "",
      order: level.order || "",
    });

    setShowForm(true);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this level?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiClient.delete(`/levels/${id}`);

      setSuccess(
        "Level deleted successfully."
      );

      await loadLevels();
    } catch (err) {
      console.error("DELETE LEVEL ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete level"
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      <Link
        to="/admin/batches"
        className="inline-flex items-center text-sm font-medium text-[#1D3866] hover:underline"
      >
        ← Back to Batches
      </Link>
      

      {/* HEADER */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
              Curriculum
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#071629]">
              Levels
            </h1>

            <p className="mt-1 text-sm text-[#52627A]">
              Organize the learning structure of this batch.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);
              setEditingId(null);
              setError("");
            }}
            className="w-fit rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#162d52]"
          >
            {showForm
              ? "Close Form"
              : "+ Add Level"}
          </button>

        </div>
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
            {editingId
              ? "Edit Level"
              : "Add Level"}
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <div>
              <label className="text-sm font-medium text-[#071629]">
                Level Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Level 1 - Foundation"
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#071629]">
                Level Number
              </label>

              <input
                type="number"
                name="levelNumber"
                min="1"
                value={form.levelNumber}
                onChange={handleChange}
                placeholder="1"
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
              />
            </div>

          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-[#071629]">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe what students learn in this level..."
              className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-[#071629]">
              Order
            </label>

            <input
              type="number"
              name="order"
              min="1"
              value={form.order}
              onChange={handleChange}
              placeholder="1"
              className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
            />
          </div>

          <div className="mt-6 flex gap-3">

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#1D3866] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Level"
                : "Create Level"}
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

      {/* LEVELS */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="border-b border-[#E5E0D5] p-6">

          <h2 className="text-lg font-semibold text-[#071629]">
            All Levels
          </h2>

          <p className="mt-1 text-sm text-[#8A96A8]">
            {levels.length} level
            {levels.length === 1 ? "" : "s"}
          </p>

        </div>

        <div className="p-6">

          {loading ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#8A96A8]">
                Loading levels...
              </p>
            </div>
          ) : levels.length === 0 ? (
            <div className="rounded-lg bg-[#F7F5EF] p-10 text-center">

              <div className="text-3xl">
                📚
              </div>

              <p className="mt-3 text-sm font-medium text-[#52627A]">
                No levels created yet.
              </p>

              <p className="mt-1 text-xs text-[#8A96A8]">
                Create the first level for this batch.
              </p>

            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {levels.map((level) => (
                <div
                  key={level._id}
                  className="rounded-lg border border-[#E5E0D5] p-5 transition hover:border-[#1D3866]"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                        Level {level.levelNumber}
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-[#071629]">
                        {level.name}
                      </h3>

                    </div>

                    <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-medium text-[#35634F]">
                      Active
                    </span>

                  </div>

                  {level.description && (
                    <p className="mt-3 text-sm leading-6 text-[#52627A]">
                      {level.description}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(level)
                      }
                      className="flex-1 rounded-lg border border-[#D9D5CB] px-3 py-2 text-sm font-medium text-[#52627A] hover:bg-[#F7F5EF]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(level._id)
                      }
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

      </div>

    </div>
  );
}

export default Levels;