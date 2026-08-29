import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Plus, BookOpen, Layers, Edit2, Trash2, ExternalLink } from "lucide-react";
import apiClient from "../../../services/apiClient";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

function Modules() {
  const [searchParams, setSearchParams] = useSearchParams();
  const batchId = searchParams.get("batchId");

  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [batch, setBatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    level: 1,
    order: 1,
  });

  // =========================================================
  // LOAD BATCHES
  // =========================================================

  const loadBatches = async () => {
    try {
      const response = await apiClient.get("/batches");
      const list = response.data.batches || [];
      setBatches(list);

      if (!batchId && list.length > 0) {
        setSearchParams({ batchId: list[0]._id });
      }
    } catch (err) {
      console.error("LOAD BATCHES ERROR:", err);
    }
  };

  // =========================================================
  // LOAD BATCH DETAILS
  // =========================================================

  const loadBatchDetails = async (id) => {
    try {
      const response = await apiClient.get(`/batches/${id}`);
      setBatch(response.data.batch);
    } catch (err) {
      console.error("LOAD BATCH DETAILS ERROR:", err);
    }
  };

  // =========================================================
  // LOAD MODULES
  // =========================================================

  const loadModules = async () => {
    if (!batchId) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/modules?batchId=${batchId}`);
      setModules(response.data.modules || []);
    } catch (err) {
      console.error("LOAD MODULES ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (batchId) {
      loadBatchDetails(batchId);
      loadModules();
    }
  }, [batchId]);

  // =========================================================
  // FORM HANDLING
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "level" || name === "order"
          ? Number(value)
          : value,
    }));
  };

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
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Module title is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        level: Number(form.level),
        order: Number(form.order),
        batchId,
      };

      if (editingId) {
        await apiClient.put(`/modules/${editingId}`, payload);
        toast.success("Module updated successfully.");
      } else {
        await apiClient.post("/modules", payload);
        toast.success("Module created successfully.");
      }

      resetForm();
      await loadModules();
    } catch (err) {
      console.error("SAVE MODULE ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to save module");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (module) => {
    try {
      await apiClient.delete(`/modules/${module._id}`);
      toast.success("Module deleted successfully.");
      await loadModules();
    } catch (err) {
      console.error("DELETE MODULE ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to delete module");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-blue-950/60 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/50">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {batch?.name ? `${batch.name} Modules` : "Learning Modules"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage learning curriculum modules for this batch.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {batches.length > 0 && (
            <select
              value={batchId || ""}
              onChange={(e) => setSearchParams({ batchId: e.target.value })}
              className="h-10 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus size={16} />
            Add Module
          </Button>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <Card className="animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Learning Module" : "Create Learning Module"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Module Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. JavaScript Async & DOM"
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Overview of concepts covered in this module..."
                className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-3 text-xs text-slate-900 shadow-xs outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Curriculum Level"
                type="number"
                name="level"
                min="1"
                value={form.level}
                onChange={handleChange}
                required
              />

              <Input
                label="Module Order"
                type="number"
                name="order"
                min="1"
                value={form.order}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editingId ? "Update Module" : "Create Module"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* MODULES LIST */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Learning Modules
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {modules.length} module{modules.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#1f6f5b] border-t-transparent" />
            </div>
          ) : modules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No learning modules added for this batch yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                + Add First Module
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((mod, index) => (
                <div
                  key={mod._id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-4 transition hover:border-slate-300 dark:border-slate-800 dark:bg-[#1f6f5b]/60 dark:hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5f1ed] font-bold text-[#1f6f5b] dark:bg-blue-950/60 dark:text-blue-400 text-xs">
                      {index + 1}
                    </div>

                    <div>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Level {mod.level}
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/admin/modules/${mod._id}/resources`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#e5f1ed] px-3.5 py-2 text-xs font-semibold text-[#1f6f5b] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/40 transition"
                    >
                      Resources
                      <ExternalLink size={13} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleEdit(mod)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:bg-[#070e1b] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#185848] transition"
                      title="Edit Module"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(mod)}
                      className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30 transition"
                      title="Delete Module"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Modules;