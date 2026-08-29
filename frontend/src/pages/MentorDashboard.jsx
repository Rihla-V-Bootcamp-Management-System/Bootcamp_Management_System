import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  PlusCircle,
  BookOpen,
  Calendar,
  Clock,
  ArrowUpRight,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import apiClient from "../services/apiClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function MentorDashboard() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No login token found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/assignments");
      const data =
        response.data?.assignments ||
        response.data?.data ||
        [];

      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("ASSIGNMENT REQUEST FAILED:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalAssignments = assignments.length;
  const publishedAssignments = assignments.filter(
    (a) => a.isPublished || a.status === "published"
  ).length;
  const draftAssignments = totalAssignments - publishedAssignments;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6f5b] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADING */}
      <div>
        <p className="text-[10px] font-extrabold tracking-widest text-[#1f6f5b] dark:text-emerald-400 uppercase">
          MENTORSHIP
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Mentor Workspace
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage coursework, student assignments, and cohort announcements.
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="font-semibold text-red-700 dark:text-red-300 text-xs">{error}</p>
          <Button size="sm" onClick={fetchAssignments} className="mt-3">
            Try Again
          </Button>
        </Card>
      )}

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ANNOUNCEMENTS CARD */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-[#10261f] dark:text-[#34d399] shadow-xs">
                <Megaphone size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Send Announcement
                </h2>
                <p className="text-xs text-slate-400">
                  Cohort Broadcast Center
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Broadcast updates, session reminders, guidelines, or event details
              directly to your assigned students and batch members.
            </p>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => navigate("/mentor/announcements")}
              className="w-full sm:w-auto"
            >
              <Megaphone size={16} />
              Send Announcement
            </Button>
          </div>
        </div>

        {/* ASSIGNMENTS CARD */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-[#10261f] dark:text-[#34d399] shadow-xs">
                <PlusCircle size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Assignments
                </h2>
                <p className="text-xs text-slate-400">
                  Coursework Workspace
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Create new coding tasks, homework assignments, or lab exercises
              and track student submissions.
            </p>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => navigate("/mentor/assignments")}
              className="w-full sm:w-auto"
            >
              <PlusCircle size={16} />
              Create Assignment
            </Button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <p className="text-xs font-semibold text-slate-400">Total Assignments</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalAssignments}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <p className="text-xs font-semibold text-slate-400">Published</p>
          <p className="mt-1 text-3xl font-extrabold text-[#1f6f5b] dark:text-emerald-400">
            {publishedAssignments}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <p className="text-xs font-semibold text-slate-400">Drafts</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
            {draftAssignments}
          </p>
        </div>
      </div>

      {/* ASSIGNMENTS LIST */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-xs dark:border-[#15253f] dark:bg-[#0b1528] overflow-hidden">
        <div className="border-b border-slate-100 p-6 dark:border-[#15253f] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Assignments Directory
            </h2>
            <p className="text-xs text-slate-400">
              Manage your cohort coursework and review submissions
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => navigate("/mentor/assignments")}
          >
            Manage
          </Button>
        </div>

        <div className="p-6">
          {assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#15253f] p-10 text-center">
              <p className="text-xs text-slate-400">No assignments created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-[#1f6f5b] dark:border-[#15253f] dark:bg-[#070e1b]"
                >
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {assignment.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Level {assignment.level || 1} • Due {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/mentor/assignments/${assignment._id}/submissions`)}
                  >
                    Submissions
                    <ArrowUpRight size={13} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;