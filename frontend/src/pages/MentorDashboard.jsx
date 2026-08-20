import {
  Users,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


function MentorDashboard() {
  const navigate = useNavigate();

  
  const stats = {
    students: 0,
    attendance: 0,
    progress: 0,
    atRisk: 0,
  };

  const recentActivities = [];

  const studentsNeedingAttention = [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
     

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mentor Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor your students and stay up to date with their progress.
          </p>
        </div>

        {/* ============================= */}
        {/* STATISTICS CARDS */}
        {/* ============================= */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Assigned Students */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Assigned Students
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.students}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/mentor/students")}
              className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View students
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Average Progress */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Average Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.progress}%
                </p>
              </div>

              <div className="rounded-lg bg-purple-50 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/mentor/progress")}
              className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View progress
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Average Attendance */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Average Attendance
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.attendance}%
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-3">
                <CalendarCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/mentor/attendance")}
              className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View attendance
              <ArrowRight size={16} />
            </button>
          </div>

          {/* At-Risk Students */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  At-Risk Students
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.atRisk}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Students who need additional attention.
            </p>
          </div>
        </div>

        {/* ============================= */}
        {/* BOTTOM SECTIONS */}
        {/* ============================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* ============================= */}
          {/* RECENT ACTIVITY */}
          {/* ============================= */}

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 p-5">
              <div className="rounded-lg bg-blue-50 p-2">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest updates from your students.
                </p>
              </div>
            </div>

            {recentActivities.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Activity className="mx-auto h-9 w-9 text-gray-300" />

                <p className="mt-3 text-sm text-gray-500">
                  No recent activity yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 p-5"
                  >
                    <div className="rounded-lg bg-blue-50 p-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>

                      {/* Date and time */}
                      <p className="mt-1 text-xs text-gray-500">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ============================= */}
          {/* STUDENTS NEEDING ATTENTION */}
          {/* ============================= */}

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 p-5">
              <div className="rounded-lg bg-red-50 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Students Needing Attention
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Students who may need additional support.
                </p>
              </div>
            </div>

            {studentsNeedingAttention.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <AlertTriangle className="mx-auto h-9 w-9 text-gray-300" />

                <p className="mt-3 text-sm text-gray-500">
                  No students currently need attention.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {studentsNeedingAttention.map((student) => (
                  <button
                    key={student._id}
                    type="button"
                    onClick={() =>
                      navigate(`/mentor/students/${student._id}`)
                    }
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {student.name}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>
                          Progress: {student.progress}%
                        </span>

                        <span>
                          Attendance: {student.attendance}%
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-red-500">
                        {student.reason}
                      </p>
                    </div>

                    <ArrowRight
                      size={18}
                      className="ml-4 shrink-0 text-gray-400"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default MentorDashboard;