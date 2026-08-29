import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";
import apiClient from "../../../services/apiClient";

function Modules() {
  const [searchParams, setSearchParams] = useSearchParams();

  const batchId = searchParams.get("batchId");

  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [batch, setBatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    level: 1,
    order: 1,
  });

  // =========================================================
  // LOAD ALL BATCHES
  // =========================================================

  const loadAllBatches = async () => {
    try {
      const response = await apiClient.get("/batches");
      const list = response.data?.batches || response.data?.data || response.data || [];
      const validList = Array.isArray(list) ? list : [];
      setBatches(validList);

      if (!batchId && validList.length > 0) {
        const savedBatchId = localStorage.getItem("activeBatchId");
        const foundSaved = validList.find((b) => b._id === savedBatchId);
        const targetBatchId = foundSaved ? foundSaved._id : validList[0]._id;
        setSearchParams({ batchId: targetBatchId });
        localStorage.setItem("activeBatchId", targetBatchId);
      }
    } catch (err) {
      console.error("LOAD ALL BATCHES ERROR:", err);
    }
  };

  // =========================================================
  // LOAD BATCH
  // =========================================================

  const loadBatch = async () => {
    if (!batchId) return;

    try {
      const response = await apiClient.get(
        `/batches/${batchId}`
      );

      setBatch(response.data.batch);
    } catch (err) {
      console.error("LOAD BATCH ERROR:", err);
    }
  };

  // =========================================================
  // LOAD MODULES
  // =========================================================

  const loadModules = async () => {
    if (!batchId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/modules?batchId=${batchId}`
      );

      setModules(response.data.modules || []);
    } catch (err) {
      console.error(
        "LOAD MODULES ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load modules"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAllBatches();
  }, []);

  useEffect(() => {
    if (batchId) {
      loadBatch();
      loadModules();
    }
  }, [batchId]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      level: 1,
      order: 1,
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!batchId) {
      setError("No batch selected.");
      return;
    }


    if (!form.title.trim()) {
      setError("Module title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        level: Number(form.level),
        batchId,
        order: Number(form.order),
      };

      if (editingId) {
        await apiClient.put(
          `/modules/${editingId}`,
          payload
        );

        setSuccess(
          "Module updated successfully."
        );
      } else {
        await apiClient.post(
          "/modules",
          payload
        );

        setSuccess(
          "Module created successfully."
        );
      }

      resetForm();

      await loadModules();
    } catch (err) {
      console.error(
        "SAVE MODULE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save module"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (module) => {
    setEditingId(module._id);

    setForm({
      title: module.title || "",
      description: module.description || "",
      level: module.level || 1,
      order: module.order || 1,
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

  const handleDelete = async (module) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${module.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiClient.delete(
        `/modules/${module._id}`
      );

      setSuccess(
        "Module deleted successfully."
      );

      await loadModules();
    } catch (err) {
      console.error(
        "DELETE MODULE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete module"
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* BACK */}

      <Link
        to={
          batchId
            ? `/admin/batches/${batchId}`
            : "/admin/batches"
        }
        className="inline-flex text-sm font-medium text-[#1D3866] hover:underline"
      >
        ← Back to Batch
      </Link>
       

      {/* HEADER */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs uppercase tracking-wide text-[#8A96A8]">
              Modules
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#071629]">
              {batch?.name || "Batch Modules"}
            </h1>

            <p className="mt-2 text-sm text-[#52627A]">
              Manage learning modules for this batch.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3">
            {batches.length > 0 && (
              <select
                value={batchId || ""}
                onChange={(e) => setSearchParams({ batchId: e.target.value })}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
            

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="w-fit rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#162d52]"
            >
              + Add Module
            </button>
          </div>

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
              ? "Edit Module"
              : "Add Module"}
          </h2>

          {/* TITLE */}

          <div className="mt-5">

            <label className="text-sm font-medium text-[#071629]">
              Module Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. HTML Fundamentals"
              className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
            />

          </div>

          {/* DESCRIPTION */}

          <div className="mt-5">

            <label className="text-sm font-medium text-[#071629]">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe this module..."
              className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
            />

          </div>

          {/* LEVEL + ORDER */}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div>

              <label className="text-sm font-medium text-[#071629]">
                Level
              </label>

              <input
                type="number"
                name="level"
                min="1"
                value={form.level}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
              />

            </div>

            <div>

              <label className="text-sm font-medium text-[#071629]">
                Order
              </label>

              <input
                type="number"
                name="order"
                min="1"
                value={form.order}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
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
                : editingId
                ? "Update Module"
                : "Create Module"}
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

      {/* MODULES */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="border-b border-[#E5E0D5] p-6">

          <h2 className="text-lg font-semibold text-[#071629]">
            Learning Modules
          </h2>

          <p className="mt-1 text-sm text-[#8A96A8]">
            {modules.length} module
            {modules.length === 1 ? "" : "s"}
          </p>

        </div>

        <div className="p-6">

          {loading ? (

            <div className="py-10 text-center">
              <p className="text-sm text-[#8A96A8]">
                Loading modules...
              </p>
            </div>

          ) : modules.length === 0 ? (

            <div className="rounded-lg bg-[#F7F5EF] p-10 text-center">

              <p className="text-sm font-medium text-[#52627A]">
                No modules added yet.
              </p>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="mt-4 rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-medium text-white"
              >
                + Add First Module
              </button>

            </div>

          ) : (

            <div className="space-y-4">

              {modules.map((module, index) => (

                <div
                  key={module._id}
                  className="rounded-lg border border-[#E5E0D5] p-5"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2F7] text-sm font-bold text-[#1D3866]">
                        {index + 1}
                      </div>

                      <div>

                        <p className="text-xs text-[#8A96A8]">
                          Level {module.level}
                        </p>

                        <h3 className="mt-1 text-base font-semibold text-[#071629]">
                          {module.title}
                        </h3>

                        {module.description && (
                          <p className="mt-1 text-sm text-[#52627A]">
                            {module.description}
                          </p>
                        )}

                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <Link
                        to={`/admin/modules/${module._id}/resources`}
                        className="rounded-lg bg-[#1D3866] px-4 py-2 text-sm font-medium text-white hover:bg-[#162d52]"
                      >
                        Resources
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(module)
                        }
                        className="rounded-lg border border-[#D9D5CB] px-4 py-2 text-sm font-medium text-[#52627A] hover:bg-[#F7F5EF]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(module)
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>

                    </div>

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

export default Modules;