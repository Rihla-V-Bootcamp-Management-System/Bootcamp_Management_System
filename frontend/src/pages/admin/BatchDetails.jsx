import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Users, BookOpen, Layers, Plus, ExternalLink } from "lucide-react";
import apiClient from "../../services/apiClient";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBatch = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get(`/batches/${id}`);
      setBatch(response.data.batch);
    } catch (err) {
      console.error("LOAD BATCH ERROR:", err);
      setError(err.response?.data?.message || "Failed to load batch");
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      setModulesLoading(true);
      const response = await apiClient.get(`/modules?batchId=${id}`);
      setModules(response.data.modules || []);
    } catch (err) {
      console.error("LOAD MODULES ERROR:", err);
    } finally {
      setModulesLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadBatch();
      loadModules();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6f5b] border-t-transparent" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/batches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f6f5b] hover:text-[#185848] dark:text-blue-400"
        >
          <ArrowLeft size={14} /> Back to Batches
        </Link>
        <Card className="border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/20">
          <h2 className="text-base font-bold text-red-700 dark:text-red-400">
            Batch Not Found
          </h2>
          <p className="mt-1 text-xs text-red-600 dark:text-red-300">
            {error || "The requested batch does not exist."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOP ACTIONS */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/batches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f6f5b] hover:text-[#185848] dark:text-blue-400 dark:hover:text-blue-300 transition"
        >
          <ArrowLeft size={14} /> Back to All Batches
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate(`/admin/modules?batchId=${id}`)}
          >
            <Plus size={14} />
            Manage Modules
          </Button>
        </div>
      </div>

      {/* OVERVIEW HEADER */}
      <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {batch.name}
            </h1>
            <Badge variant="success">Active Cohort</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Full bootcamp cohort management and curriculum breakdown.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 flex items-center gap-2.5">
            <Calendar size={16} className="text-slate-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Start Date</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 flex items-center gap-2.5">
            <Clock size={16} className="text-slate-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Daily Session</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {batch.sessionStartTime || "09:00"} - {batch.sessionEndTime || "13:00"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* METRICS & DETAILS */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="text-center p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Enrolled Students
          </p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
            {batch.studentIds?.length || 0}
          </p>
        </Card>

        <Card className="text-center p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Mentors
          </p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
            {batch.mentorIds?.length || 0}
          </p>
        </Card>

        <Card className="text-center p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Curriculum Modules
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[#1f6f5b] dark:text-blue-400">
            {modules.length}
          </p>
        </Card>
      </div>

      {/* MODULES LIST PREVIEW */}
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Curriculum Modules
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/modules?batchId=${id}`)}
          >
            Open Module Editor
          </Button>
        </div>

        <div className="p-6">
          {modulesLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1f6f5b] border-t-transparent" />
            </div>
          ) : modules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No learning modules created for this batch yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => navigate(`/admin/modules?batchId=${id}`)}
              >
                + Add First Module
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {modules.map((mod, index) => (
                <Link
                  key={mod._id}
                  to={`/admin/modules/${mod._id}/resources`}
                  className="block rounded-xl border border-slate-200 p-4 hover:border-[#1f6f5b] hover:shadow-xs transition dark:border-slate-800 dark:bg-[#1f6f5b]/60"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Level {mod.level} • Module {index + 1}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {mod.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default BatchDetails;