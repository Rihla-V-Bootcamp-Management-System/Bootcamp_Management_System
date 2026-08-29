import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  FileText,
  Video,
  Link as LinkIcon,
  ExternalLink,
  Edit2,
  Trash2,
  FolderOpen,
} from "lucide-react";
import apiClient from "../../../services/apiClient";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

function ModuleResources() {
  const { moduleId } = useParams();

  const [module, setModule] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    type: "document",
    url: "",
    description: "",
  });

  const loadModuleDetails = async () => {
    try {
      const res = await apiClient.get(`/modules/${moduleId}`);
      setModule(res.data.module);
    } catch (err) {
      console.error("LOAD MODULE DETAILS ERROR:", err);
    }
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/module-resources?moduleId=${moduleId}`);
      setResources(res.data.resources || []);
    } catch (err) {
      console.error("LOAD RESOURCES ERROR:", err);
      toast.error("Failed to load module resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      loadModuleDetails();
      loadResources();
    }
  }, [moduleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ title: "", type: "document", url: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Title and URL are required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        type: form.type,
        url: form.url.trim(),
        description: form.description.trim(),
        moduleId,
      };

      if (editingId) {
        await apiClient.put(`/module-resources/${editingId}`, payload);
        toast.success("Resource updated successfully.");
      } else {
        await apiClient.post("/module-resources", payload);
        toast.success("Resource added successfully.");
      }

      resetForm();
      await loadResources();
    } catch (err) {
      console.error("SAVE RESOURCE ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to save resource");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (res) => {
    setEditingId(res._id);
    setForm({
      title: res.title || "",
      type: res.type || "document",
      url: res.url || "",
      description: res.description || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (resourceId) => {
    try {
      await apiClient.delete(`/module-resources/${resourceId}`);
      toast.success("Resource deleted successfully.");
      await loadResources();
    } catch (err) {
      console.error("DELETE RESOURCE ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to delete resource");
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "video":
        return <Video size={16} className="text-red-500" />;
      case "link":
        return <LinkIcon size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} className="text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* BACK LINK */}
      <Link
        to={
          module?.batchId?._id
            ? `/admin/modules?batchId=${module.batchId._id}`
            : "/admin/modules"
        }
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f6f5b] hover:text-[#185848] dark:text-blue-400 dark:hover:text-blue-300 transition"
      >
        <ArrowLeft size={14} /> Back to Modules
      </Link>

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-blue-950/60 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/50">
            <FolderOpen size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {module?.title || "Module Resources"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {module?.description || "Manage learning materials, lecture videos, and references."}
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
          Add Resource
        </Button>
      </div>

      {/* FORM */}
      {showForm && (
        <Card className="animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Resource" : "Add Module Resource"}
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
              label="Resource Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Official React Documentation & Cheatsheet"
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resource Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="document">Document / PDF</option>
                  <option value="video">Video Lecture</option>
                  <option value="link">External Link / Repository</option>
                </select>
              </div>

              <Input
                label="Resource URL"
                type="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Notes & Instructions (Optional)
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Guidelines or preparation notes for students..."
                className="w-full rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-3 text-xs text-slate-900 shadow-xs outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editingId ? "Save Changes" : "Add Resource"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* RESOURCES LIST */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Attached Resources
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {resources.length} item{resources.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#1f6f5b] border-t-transparent" />
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No resources uploaded for this module yet.
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
                + Add First Resource
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((res) => (
                <div
                  key={res._id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-4 transition hover:border-slate-300 dark:border-slate-800 dark:bg-[#1f6f5b]/60 dark:hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      {getResourceIcon(res.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {res.title}
                      </h3>
                      {res.description && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {res.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#e5f1ed] px-3 py-1.5 text-xs font-semibold text-[#1f6f5b] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/40 transition"
                    >
                      Open Link
                      <ExternalLink size={12} />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleEdit(res)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:bg-[#070e1b] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#185848] transition"
                      title="Edit Resource"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(res._id)}
                      className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30 transition"
                      title="Delete Resource"
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

export default ModuleResources;