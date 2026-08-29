import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Megaphone,
  TrendingUp,
  Award,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import apiClient from "../services/apiClient";

const TOPICS = [
  "HTML/CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Git/GitHub",
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    attendance: null,
    progress: {
      percentage: 0,
      completed: 0,
      inProgress: 0,
      needsImprovement: 0,
      notStarted: TOPICS.length,
      total: TOPICS.length,
    },
    assignments: {
      total: 0,
      submitted: 0,
      pending: 0,
      graded: 0,
    },
    averageGrade: null,
    announcements: [],
    deadlines: [],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [progressRes, assignmentsRes, submissionsRes, announcementsRes, attendanceRes] =
          await Promise.allSettled([
            apiClient.get("/progress"),
            apiClient.get("/assignments"),
            apiClient.get("/submissions/my"),
            apiClient.get("/announcements"),
            apiClient.get("/attendance/my"),
          ]);

        const progressList =
          progressRes.status === "fulfilled"
            ? progressRes.value.data?.progress || []
            : [];

        const completed = progressList.filter(
          (item) => item.status === "Completed"
        ).length;

        const inProgress = progressList.filter(
          (item) => item.status === "In Progress"
        ).length;

        const needsImprovement = progressList.filter(
          (item) => item.status === "Needs Improvement"
        ).length;

        const notStarted = Math.max(
          TOPICS.length - completed - inProgress - needsImprovement,
          0
        );

        const calculatedPercentage =
          TOPICS.length > 0
            ? Math.round((completed / TOPICS.length) * 100)
            : 0;

        const assignmentsList =
          assignmentsRes.status === "fulfilled"
            ? assignmentsRes.value.data?.assignments || []
            : [];

        const submissionsList =
          submissionsRes.status === "fulfilled"
            ? submissionsRes.value.data?.submissions || []
            : [];

        const submittedCount = submissionsList.length;
        const pendingCount = Math.max(
          assignmentsList.length - submittedCount,
          0
        );

        const gradedSubmissions = submissionsList.filter(
          (sub) => typeof sub.grade === "number"
        );

        const totalGrade = gradedSubmissions.reduce(
          (sum, sub) => sum + sub.grade,
          0
        );

        const averageGrade =
          gradedSubmissions.length > 0
            ? Math.round(totalGrade / gradedSubmissions.length)
            : null;

        const announcementsList =
          announcementsRes.status === "fulfilled"
            ? announcementsRes.value.data?.announcements || []
            : [];

        const attendanceData =
          attendanceRes.status === "fulfilled"
            ? attendanceRes.value.data
            : null;

        setDashboardData({
          attendance: attendanceData,
          progress: {
            percentage: calculatedPercentage,
            completed,
            inProgress,
            needsImprovement,
            notStarted,
            total: TOPICS.length,
          },
          assignments: {
            total: assignmentsList.length,
            submitted: submittedCount,
            pending: pendingCount,
            graded: gradedSubmissions.length,
          },
          averageGrade,
          announcements: announcementsList.slice(0, 5),
          deadlines: [],
        });
      } catch (err) {
        console.error("LOAD DASHBOARD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const { progress, assignments, averageGrade } = dashboardData;

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
          STUDENT SPACE
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Student Dashboard
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Track your progress, coursework assignments, and announcements.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Attendance"
          value={
            dashboardData.attendance?.rate !== undefined
              ? `${dashboardData.attendance.rate}%`
              : "Active"
          }
          description="Verified sessions"
          icon={CalendarDays}
          onClick={() => navigate("/student/attendance")}
        />

        <DashboardCard
          title="Overall Progress"
          value={`${progress.percentage}%`}
          description={`${progress.completed} topics completed`}
          icon={TrendingUp}
          onClick={() => navigate("/student/progress")}
        />

        <DashboardCard
          title="Assignments"
          value={`${assignments?.submitted}/${assignments?.total}`}
          description={`${assignments?.pending} pending tasks`}
          icon={FileText}
          onClick={() => navigate("/student/assignments")}
        />

        <DashboardCard
          title="Average Grade"
          value={averageGrade !== null ? `${averageGrade}%` : "—"}
          description={`${assignments?.graded} graded items`}
          icon={Award}
          onClick={() => navigate("/student/assignments")}
        />
      </div>

      {/* PROGRESS + ASSIGNMENTS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* PROGRESS SUMMARY */}
        <section className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-[#15253f]">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Progress Summary
              </h2>
              <p className="text-xs text-slate-400">
                Your current learning progress
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-[#10261f] dark:text-[#34d399]">
              <TrendingUp size={18} />
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400">Overall Progress</span>
              <span className="text-slate-900 dark:text-white">{progress.percentage}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-[#070e1b]">
              <div
                className="h-full rounded-full bg-[#1f6f5b] transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Progress Statistics */}
          <div className="grid grid-cols-3 gap-3">
            <ProgressStat
              label="Completed"
              value={progress.completed}
              icon={CheckCircle2}
              colorClass="text-emerald-600 dark:text-emerald-400"
            />
            <ProgressStat
              label="In Progress"
              value={progress.inProgress}
              icon={Clock3}
              colorClass="text-amber-500"
            />
            <ProgressStat
              label="Needs Work"
              value={progress.needsImprovement}
              icon={AlertCircle}
              colorClass="text-red-500"
            />
          </div>
        </section>

        {/* RECENT ANNOUNCEMENTS */}
        <section className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-xs dark:border-[#15253f] dark:bg-[#0b1528]">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-[#15253f]">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Announcements
              </h2>
              <p className="text-xs text-slate-400">
                Updates from mentors and admin
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-[#10261f] dark:text-[#34d399]">
              <Megaphone size={18} />
            </div>
          </div>

          {dashboardData.announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#15253f] p-8 text-center">
              <p className="text-xs text-slate-400">No new announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.announcements.map((ann) => (
                <div
                  key={ann._id}
                  className="rounded-xl border border-slate-100 p-4 transition hover:border-[#1f6f5b] dark:border-[#15253f] dark:bg-[#070e1b]"
                >
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {ann.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {ann.message || ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const DashboardCard = ({
  title,
  value,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#1f6f5b] dark:border-[#15253f] dark:bg-[#0b1528] dark:hover:border-emerald-500/50 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b] dark:bg-[#10261f] dark:text-[#34d399] shadow-xs">
          <Icon size={20} />
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition group-hover:text-[#1f6f5b] dark:text-slate-500 dark:text-slate-400 dark:group-hover:text-emerald-400">
          <ArrowUpRight size={16} />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

const ProgressStat = ({
  label,
  value,
  icon: Icon,
  colorClass = "text-slate-500",
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-[#15253f] dark:bg-[#070e1b]">
      <Icon className={`mx-auto mb-1.5 h-5 w-5 ${colorClass}`} />
      <p className="text-xl font-extrabold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
        {label}
      </p>
    </div>
  );
};

export default StudentDashboard;