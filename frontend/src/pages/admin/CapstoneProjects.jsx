import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Rocket,
  Plus,
  Calendar,
  Award,
  Layers,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import apiClient from "../../services/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function CapstoneProjects() {
  const location = useLocation();
  const queryBatchId = new URLSearchParams(location.search).get("batchId") || "";

  const [projects, setProjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(queryBatchId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    level: 1,
    batchId: queryBatchId || "",
    dueDate: "",
    maxScore: 100,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, batchRes] = await Promise.allSettled([
        apiClient.get(`/capstone-projects${selectedBatchId ? `?batchId=${selectedBatchId}` : ""}`),
        apiClient.get("/batches"),
      ]);

      if (projRes.status === "fulfilled") {
        setProjects(projRes.value.data?.projects || []);
      }
      if (batchRes.status === "fulfilled") {
        const list = batchRes.value.data?.batches || [];
        setBatches(list);
        if (!selectedBatchId && list.length > 0) {
          setSelectedBatchId(list[0]._id);
          setForm((prev) => ({ ...prev, batchId: list[0]._id }));
        }
      }
    } catch (err) {
      console.error("LOAD CAPSTONE PROJECTS ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to load capstone projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBatchId]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    try {
      setSaving(true);
      const reqList = form.requirements
        ? form.requirements.split("\n").map((r) => r.trim()).filter(Boolean)
        : [];

      await apiClient.post("/capstone-projects", {
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: reqList,
        level: Number(form.level),
        batchId: form.batchId || selectedBatchId,
        dueDate: form.dueDate || undefined,
        maxScore: Number(form.maxScore) || 100,
      });

      toast.success("Capstone project created successfully!");
      setShowCreateModal(false);
      setForm({
        title: "",
        description: "",
        requirements: "",
        level: 1,
        batchId: selectedBatchId || "",
        dueDate: "",
        maxScore: 100,
      });
      await loadData();
    } catch (err) {
      console.error("CREATE CAPSTONE ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to create capstone project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#1f6f5b] dark:text-emerald-400">
            <Rocket size={20} />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Capstone Projects
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Define, schedule, and review final end-to-end milestone projects for student cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {batches.length > 0 && (
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 dark:border-[#15253f] dark:bg-[#0b1528] dark:text-white focus:outline-none"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          <Button
            onClick={() => {
              setForm((prev) => ({ ...prev, batchId: selectedBatchId || batches[0]?._id || "" }));
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} />
            New Capstone Project
          </Button>
        </div>
      </div>

      {/* PROJECT LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6f5b] border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-16">
          <Rocket size={44} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            No Capstone Projects Configured
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Click "New Capstone Project" to create the final full-stack project specification and rubric for this cohort.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="flex flex-col justify-between border border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Sparkles size={12} /> Level {project.level || 1}
                      </span>
                      {project.batchId?.name && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <Layers size={12} /> {project.batchId.name}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                      {project.title}
                    </h3>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Award size={14} /> Max: {project.maxScore || 100} pts
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                  {project.description}
                </p>

                {project.requirements?.length > 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3.5 dark:bg-[#070e1b] border border-slate-100 dark:border-[#15253f]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Deliverables & Requirements
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {project.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="shrink-0 text-[#1f6f5b] mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-[#15253f] pt-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Clock size={14} />
                  <span>
                    Due:{" "}
                    <strong className="text-slate-800 dark:text-white">
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "Open End"}
                    </strong>
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">
                  Created by {project.createdBy?.name || "Admin"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0b1528] p-6 shadow-2xl border border-slate-200 dark:border-[#15253f]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#15253f] pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Rocket size={18} className="text-[#1f6f5b]" />
                <h3 className="text-base font-bold">New Capstone Project</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#070e1b]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Project Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Full-Stack E-Commerce & Management Platform"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Cohort Batch *
                  </label>
                  <select
                    required
                    value={form.batchId}
                    onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white focus:outline-none"
                  >
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Curriculum Level
                  </label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-white focus:outline-none"
                  >
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Max Score
                  </label>
                  <Input
                    type="number"
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Project Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide complete project objectives, architecture requirements, and goals..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-slate-100 focus:border-[#1f6f5b] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Requirements (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="REST API with JWT Authentication&#10;React Frontend with Responsive UI&#10;MongoDB Database with 4+ models&#10;Deployed on Render/Vercel"
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-[#15253f] dark:bg-[#070e1b] dark:text-slate-100 focus:border-[#1f6f5b] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 dark:border-[#15253f] pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 dark:border-[#15253f] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#070e1b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1f6f5b] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#185848] disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Publish Capstone Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CapstoneProjects;
