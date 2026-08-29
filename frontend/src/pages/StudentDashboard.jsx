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
} from "lucide-react";

import apiClient from "../services/apiClient";

// =========================================================
// PROGRESS TOPICS
// Keep this exactly the same as StudentProgress.jsx
// =========================================================

const TOPICS = [
  "HTML/CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Git/GitHub",
];

// =========================================================
// STUDENT DASHBOARD
// =========================================================

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressError, setProgressError] = useState("");

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

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setProgressError("");

        // Run parallel requests
        const [progressRes, assignmentsRes, submissionsRes, announcementsRes, attendanceRes] =
          await Promise.allSettled([
            apiClient.get("/progress"),
            apiClient.get("/assignments"),
            apiClient.get("/submissions/my"),
            apiClient.get("/announcements"),
            apiClient.get("/attendance/my"),
          ]);

        // 1. Progress
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

        const total = TOPICS.length;
        const percentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        // 2. Assignments & Submissions
        const rawAssignments =
          assignmentsRes.status === "fulfilled"
            ? assignmentsRes.value.data?.assignments ||
              assignmentsRes.value.data?.data ||
              assignmentsRes.value.data ||
              []
            : [];
        const assignmentList = Array.isArray(rawAssignments) ? rawAssignments : [];

        const rawSubmissions =
          submissionsRes.status === "fulfilled"
            ? submissionsRes.value.data?.submissions ||
              submissionsRes.value.data?.data ||
              submissionsRes.value.data ||
              []
            : [];
        const submissionList = Array.isArray(rawSubmissions) ? rawSubmissions : [];

        const totalAssignments = assignmentList.length;
        const submittedCount = submissionList.length;
        const pendingCount = Math.max(totalAssignments - submittedCount, 0);

        const gradedSubmissions = submissionList.filter(
          (sub) => sub.status === "Graded" && sub.grade !== null && sub.grade !== undefined
        );
        const gradedCount = gradedSubmissions.length;


        let avgGrade = null;
        if (gradedCount > 0) {
          const totalGrade = gradedSubmissions.reduce(
            (sum, sub) => sum + Number(sub.grade || 0),
            0
          );
          avgGrade = Math.round(totalGrade / gradedCount);
        }

        // 3. Announcements
        const rawAnnouncements =
          announcementsRes.status === "fulfilled"
            ? announcementsRes.value.data?.announcements ||
              announcementsRes.value.data?.data ||
              announcementsRes.value.data ||
              []
            : [];
        const announcementList = Array.isArray(rawAnnouncements) ? rawAnnouncements : [];

        // 4. Attendance
        let attendanceData = null;
        if (attendanceRes.status === "fulfilled") {
          const rawAtt = attendanceRes.value.data;
          const records = rawAtt?.records || rawAtt?.attendance || (Array.isArray(rawAtt) ? rawAtt : []);
          if (Array.isArray(records) && records.length > 0) {
            const presentCount = records.filter(
              (r) => r.status === "present" || r.status === "Present"
            ).length;
            const attPct = Math.round((presentCount / records.length) * 100);
            attendanceData = {
              percentage: attPct,
              present: presentCount,
              total: records.length,
            };
          }
        }

        // 5. Deadlines
        const upcomingDeadlines = assignmentList
          .filter((a) => a.deadline && new Date(a.deadline) > new Date())
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 5);

        setDashboardData({
          attendance: attendanceData,
          progress: {
            percentage,
            completed,
            inProgress,
            needsImprovement,
            notStarted,
            total,
          },
          assignments: {
            total: totalAssignments,
            submitted: submittedCount,
            pending: pendingCount,
            graded: gradedCount,
          },
          averageGrade: avgGrade,
          announcements: announcementList.slice(0, 5),
          deadlines: upcomingDeadlines,
        });
      } catch (error) {
        console.error(
          "Student dashboard progress error:",
          error
        );

        setProgressError(
          error.response?.data?.message ||
            "Unable to load progress data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  const {
    attendance,
    progress,
    assignments,
    averageGrade,
  } = dashboardData;

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Student Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track your learning progress, attendance,
          assignments, and upcoming activities.
        </p>
      </div>

      {/* =====================================================
          PROGRESS ERROR
      ===================================================== */}


      {progressError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {progressError}
          </p>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Attendance */}

        <DashboardCard
          title="Attendance"
          value={
            attendance?.percentage !== undefined
              ? `${attendance.percentage}%`
              : "—"
          }
          description={
            attendance?.present !== undefined
              ? `${attendance.present} days present`
              : "No attendance data yet"
          }
          icon={CalendarDays}
          onClick={() => navigate("/student/attendance")}
        />

        {/* Progress */}

        <DashboardCard
          title="Overall Progress"
          value={`${progress.percentage}%`}
          description={`${progress.completed} topics completed`}
          icon={TrendingUp}
          onClick={() => navigate("/student/progress")}
        />

        {/* Assignments */}

        <DashboardCard
          title="Assignments"
          value={
            assignments?.submitted !== undefined &&
            assignments?.total !== undefined
              ? `${assignments.submitted}/${assignments.total}`
              : "—"
          }
          description={
            assignments?.pending !== undefined
              ? `${assignments.pending} pending`
              : "No assignment data yet"
          }
          icon={FileText}
          onClick={() => navigate("/student/assignments")}
        />

        {/* Average Grade */}

        <DashboardCard
          title="Average Grade"
          value={
            averageGrade !== null &&
            averageGrade !== undefined
              ? `${averageGrade}%`
              : "—"
          }
          description={
            assignments?.graded !== undefined
              ? `${assignments.graded} assignments graded`
              : "No grades available yet"
          }
          icon={Award}
          onClick={() => navigate("/student/grades")}
        />
      </div>

      {/* =====================================================
          PROGRESS + ASSIGNMENTS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ===================================================
            PROGRESS SUMMARY
        =================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Progress Summary
              </h2>

              <p className="text-sm text-gray-500">
                Your current learning progress
              </p>
            </div>

            <TrendingUp className="h-5 w-5 text-gray-500" />

          </div>

          {/* Overall Progress */}

          <div className="mb-6">

            <div className="mb-2 flex justify-between text-sm">

              <span className="font-medium text-gray-700">
                Overall Progress
              </span>

              <span className="font-semibold text-gray-900">
                {progress.percentage}%
              </span>

            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gray-900 transition-all duration-500"
                style={{
                  width: `${progress.percentage}%`,
                }}
              />
            </div>

          </div>

          {/* Progress Statistics */}

          <div className="grid grid-cols-3 gap-3">


            <ProgressStat
              label="Completed"
              value={progress.completed}
              icon={CheckCircle2}
            />

            <ProgressStat
              label="In Progress"
              value={progress.inProgress}
              icon={Clock3}
            />

            <ProgressStat
              label="Needs Work"
              value={progress.needsImprovement}
              icon={AlertCircle}
            />

          </div>

          {/* Extra statistics */}

          <div className="mt-4 rounded-xl bg-gray-50 p-4">

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Total topics
              </span>

              <span className="font-semibold text-gray-900">
                {progress.total}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Not started
              </span>

              <span className="font-semibold text-gray-900">
                {progress.notStarted}
              </span>
            </div>

          </div>

        </section>

        {/* ===================================================
            ASSIGNMENT STATUS
        =================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Assignment Status
              </h2>

              <p className="text-sm text-gray-500">
                Overview of your assignments
              </p>
            </div>

            <FileText className="h-5 w-5 text-gray-500" />

          </div>

          <div className="space-y-4">

            <AssignmentRow
              label="Total Assignments"
              value={assignments?.total ?? "—"}
            />

            <AssignmentRow
              label="Submitted"
              value={assignments?.submitted ?? "—"}
            />

            <AssignmentRow
              label="Pending"
              value={assignments?.pending ?? "—"}
            />

            <AssignmentRow
              label="Graded"
              value={assignments?.graded ?? "—"}
            />

          </div>

        </section>
      </div>

      {/* =====================================================
          ANNOUNCEMENTS + DEADLINES
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Announcements */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="rounded-xl bg-gray-100 p-2">
              <Megaphone className="h-5 w-5 text-gray-700" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Announcements
              </h2>

              <p className="text-sm text-gray-500">
                Latest updates from the bootcamp
              </p>
            </div>

          </div>

          {dashboardData.announcements.length === 0 ? (
            <EmptyState message="No announcements available yet." />
          ) : (
            <div className="space-y-4">
              {dashboardData.announcements.map(
                (announcement) => (
                  <div
                    key={
                      announcement.id ||
                      announcement._id
                    }
                    className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">


                      <div>
                        <h3 className="font-medium text-gray-900">
                          {announcement.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {announcement.message}
                        </p>
                      </div>

                      <span className="whitespace-nowrap text-xs text-gray-400">
                        {announcement.date}
                      </span>

                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Deadlines */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">

            <div className="rounded-xl bg-gray-100 p-2">
              <Clock3 className="h-5 w-5 text-gray-700" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Deadlines
              </h2>

              <p className="text-sm text-gray-500">
                Don't miss your upcoming submissions
              </p>
            </div>

          </div>

          {dashboardData.deadlines.length === 0 ? (
            <EmptyState message="No upcoming deadlines." />
          ) : (
            <div className="space-y-4">
              {dashboardData.deadlines.map(
                (deadline) => (
                  <div
                    key={
                      deadline.id ||
                      deadline._id
                    }
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {deadline.title}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Due {deadline.dueDate}
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {deadline.daysLeft} days left
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

// =========================================================
// DASHBOARD CARD
// =========================================================

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
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
          : ""
      }`}
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-gray-100 p-3">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>

      </div>
    </div>
  );
};

// =========================================================
// PROGRESS STAT
// =========================================================

const ProgressStat = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-xl bg-gray-50 p-4 text-center">

      <Icon className="mx-auto mb-2 h-5 w-5 text-gray-500" />

      <p className="text-xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {label}
      </p>

    </div>
  );
};


// =========================================================
// ASSIGNMENT ROW
// =========================================================

const AssignmentRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="font-semibold text-gray-900">
        {value}
      </span>

    </div>
  );
};

// =========================================================
// EMPTY STATE
// =========================================================

const EmptyState = ({ message }) => {
  return (
    <div className="flex min-h-140 items-center justify-center rounded-xl border border-dashed border-gray-200">

      <p className="text-sm text-gray-400">
        {message}
      </p>

    </div>
  );
};

export default StudentDashboard;