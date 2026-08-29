import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Plus, Layers, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import apiClient from "../../../services/apiClient";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

function Levels() {
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get("batchId");

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    levelNumber: 1,
    title: "",
    description: "",
    durationWeeks: 4,
  });

  const loadLevels = async () => {
    try {
      setLoading(true);
      const url = batchId ? `/levels?batchId=${batchId}` : "/levels";
      const response = await apiClient.get(url);
      setLevels(response.data.levels || []);
    } catch (err) {
      console.error("LOAD LEVELS ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to load levels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, [batchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "levelNumber" || name === "durationWeeks"
          ? Number(value)
          : value,
    }));
  };

  const resetForm = () => {
    setForm({
      levelNumber: 1,
      title: "",
      description: "",
      durationWeeks: 4,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Level title is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        levelNumber: Number(form.levelNumber),
        title: form.title.trim(),
        description: form.description.trim(),
        durationWeeks: Number(form.durationWeeks),
        batchId,
      };

      if (editingId) {
        await apiClient.put(`/levels/${editingId}`, payload);
        toast.success("Level updated successfully.");
      } else {
        await apiClient.post("/levels", payload);
        toast.success("Level created successfully.");
      }

      resetForm();
      await loadLevels();
    } catch (err) {
      console.error("SAVE LEVEL ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to save level");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (level) => {
    setEditingId(level._id);
    setForm({
      levelNumber: level.levelNumber || 1,
      title: level.title || "",
      description: level.description || "",
      durationWeeks: level.durationWeeks || 4,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/levels/${id}`);
      toast.success("Level deleted successfully.");
      await loadLevels();
    } catch (err) {
      console.error("DELETE LEVEL ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to delete level");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-blue-950/60 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/50">
            <Layers size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Curriculum Levels
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Organize cohort learning stages, milestones, and difficulty progression.
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={16} />
          Add Level
        </Button>
      </div>

      {/* FORM */}
      {showForm && (
        <Card className="animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Curriculum Level" : "Create Curriculum Level"}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Level Number"
                type="number"
                name="levelNumber"
                min="1"
                value={form.levelNumber}
                onChange={handleChange}
                required
              />

              <Input
                label="Duration (Weeks)"
                type="number"
                name="durationWeeks"
                min="1"
                value={form.durationWeeks}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Level Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Level 1: Core Algorithms & DS"
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
                placeholder="Overview of curriculum requirements and milestones..."
                className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-3 text-xs text-slate-900 shadow-xs outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editingId ? "Save Changes" : "Create Level"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* LEVEL LIST */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Curriculum Stages
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {levels.length} level{levels.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#1f6f5b] border-t-transparent" />
            </div>
          ) : levels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No levels defined yet for this batch.
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
                + Add First Level
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {levels.map((lvl) => (
                <div
                  key={lvl._id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-[#1f6f5b]/60 dark:hover:border-slate-700"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-block rounded-md bg-[#e5f1ed] px-2.5 py-1 text-xs font-bold text-[#1f6f5b] dark:bg-blue-950/60 dark:text-blue-400">
                        Level {lvl.levelNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {lvl.durationWeeks || 4} Weeks
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                      {lvl.title}
                    </h3>

                    {lvl.description && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {lvl.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(lvl)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:bg-[#070e1b] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#185848] transition"
                      title="Edit Level"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(lvl._id)}
                      className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30 transition"
                      title="Delete Level"
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

export default Levels;