import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Plus, Users, Calendar, Clock, Layers, BookOpen } from "lucide-react";
import apiClient from "../../services/apiClient";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      const response = await apiClient.get("/batches");
      setBatches(response.data.batches || []);
    } catch (err) {
      console.error("LOAD BATCHES ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  // =========================================================
  // FORM CHANGE & RESET
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      startDate: "",
      sessionStartTime: "09:00",
      sessionEndTime: "13:00",
    });
    setShowForm(false);
  };

  // =========================================================
  // CREATE BATCH
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Batch name is required.");
      return;
    }

    if (!formData.startDate) {
      toast.error("Start date is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        startDate: formData.startDate,
        sessionStartTime: formData.sessionStartTime,
        sessionEndTime: formData.sessionEndTime,
      };

      await apiClient.post("/batches", payload);
      toast.success("Batch created successfully.");

      resetForm();
      await loadBatches();
    } catch (err) {
      console.error("SAVE BATCH ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to create batch");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Batches & Cohorts
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage academic batches, enrolled students, and scheduled modules.
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="self-start sm:self-auto"
        >
          <Plus size={16} />
          {showForm ? "Close Form" : "Create New Batch"}
        </Button>
      </div>

      {/* CREATE BATCH FORM */}
      {showForm && (
        <Card className="border border-slate-200 dark:border-slate-800 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Batch
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set up a new student cohort and daily schedule.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Batch Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Batch 3 (Summer 2026)"
                required
              />

              <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />

              <Input
                label="Daily Session Start Time"
                type="time"
                name="sessionStartTime"
                value={formData.sessionStartTime}
                onChange={handleChange}
                required
              />

              <Input
                label="Daily Session End Time"
                type="time"
                name="sessionEndTime"
                value={formData.sessionEndTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Create Batch
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ALL BATCHES */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6f5b] border-t-transparent" />
        </div>
      ) : batches.length === 0 ? (
        <Card className="text-center py-16">
          <Layers size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            No Batches Found
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Click "Create New Batch" to add your first cohort.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {batches.map((batch) => (
            <Card key={batch._id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {batch.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Bootcamp Cohort
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Active
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar size={14} /> Start Date:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {batch.startDate
                        ? new Date(batch.startDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock size={14} /> Daily Sessions:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {batch.sessionStartTime || "09:00"} - {batch.sessionEndTime || "13:00"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
                  <div className="rounded-lg bg-slate-50/80 dark:bg-slate-800/40 p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Students</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                      {batch.studentIds?.length || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50/80 dark:bg-slate-800/40 p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Mentors</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                      {batch.mentorIds?.length || 0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50/80 dark:bg-slate-800/40 p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Modules</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                      {batch.moduleCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <Link
                  to={`/admin/batches/${batch._id}`}
                  className="w-full text-center rounded-xl bg-[#1f6f5b] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#185848] transition"
                >
                  Manage Batch & Curriculum
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Batches;