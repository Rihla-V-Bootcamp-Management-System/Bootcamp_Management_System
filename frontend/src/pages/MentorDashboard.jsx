
import {
  Users,
  CalendarCheck,
  TrendingUp,
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function MentorDashboard() {
  const navigate = useNavigate();

  
  const stats = {
    students: 0,
    attendance: 0,
    progress: 0,
    pendingGrades: 0,
  };

  const students = [];
  const atRiskStudents = [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Mentor Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Monitor your students, attendance, progress, and assignments.
        </p>
      </div>

      
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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

       
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Attendance
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
            Manage attendance
            <ArrowRight size={16} />
          </button>
        </div>

        
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Progress
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

        
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pending to Grade
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.pendingGrades}
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-3">
              <ClipboardCheck className="h-6 w-6 text-orange-600" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/mentor/submissions")}
            className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Open grading queue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

     
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
       
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 p-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Assigned Students
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Students currently assigned to you.
              </p>
            </div>

            <Users className="h-5 w-5 text-gray-400" />
          </div>

          {students.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-300" />

              <h3 className="mt-4 font-medium text-gray-900">
                No students assigned yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Students assigned to your batches will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {students.map((student) => (
                <button
                  key={student._id}
                  type="button"
                  onClick={() =>
                    navigate(`/mentor/students/${student._id}`)
                  }
                  className="rounded-lg border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900">
                    {student.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {student.email}
                  </p>

                  <div className="mt-4 flex justify-between text-sm">
                    <span>
                      Attendance: {student.attendance}%
                    </span>

                    <span>
                      Progress: {student.progress}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Common mentor actions.
            </p>
          </div>

          <div className="space-y-3 p-5">
            <button
              type="button"
              onClick={() => navigate("/mentor/attendance")}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >
              <CalendarCheck className="h-5 w-5 text-green-600" />

              <div>
                <p className="font-medium text-gray-900">
                  Mark Attendance
                </p>

                <p className="text-xs text-gray-500">
                  Record today's attendance
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/mentor/progress")}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >
              <TrendingUp className="h-5 w-5 text-purple-600" />

              <div>
                <p className="font-medium text-gray-900">
                  Update Progress
                </p>

                <p className="text-xs text-gray-500">
                  Track student learning
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/mentor/assignments")}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >
              <BookOpen className="h-5 w-5 text-blue-600" />

              <div>
                <p className="font-medium text-gray-900">
                  Manage Assignments
                </p>

                <p className="text-xs text-gray-500">
                  Create and manage assignments
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/mentor/submissions")}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >
              <ClipboardCheck className="h-5 w-5 text-orange-600" />

              <div>
                <p className="font-medium text-gray-900">
                  Grade Submissions
                </p>

                <p className="text-xs text-gray-500">
                  Review pending submissions
                </p>
              </div>
            </button>
          </div>
        </section>
      </div>

       
      <section className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-200 p-5">
          <AlertTriangle className="h-5 w-5 text-orange-500" />

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              At-Risk Students
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Students who may need additional support.
            </p>
          </div>
        </div>

        {atRiskStudents.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <AlertTriangle className="mx-auto h-9 w-9 text-gray-300" />

            <p className="mt-3 text-sm text-gray-500">
              No at-risk students right now.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {atRiskStudents.map((student) => (
              <button
                key={student._id}
                type="button"
                onClick={() =>
                  navigate(`/mentor/students/${student._id}`)
                }
                className="flex w-full items-center justify-between p-5 text-left hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {student.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {student.reason}
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-400"
                />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MentorDashboard;

