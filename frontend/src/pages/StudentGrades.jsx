import { BarChart3, CheckCircle, Clock } from "lucide-react";
function StudentGrades() {
  // Later this will come from the backend.
  const grades = [];
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Grades & Feedback
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Review your assignment grades and mentor feedback.
        </p>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Average Grade */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              Average Grade
            </p>

            <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full border-8 border-gray-200">
              <span className="text-2xl font-bold text-gray-900">
                0%
              </span>
            </div>
          </div>
        </div>
        {/* Graded */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />

            <p className="text-sm font-medium text-gray-600">
              Graded
            </p>
          </div>

          <div className="mt-8">
            <span className="text-4xl font-bold text-gray-900">
              0
            </span>

            <span className="ml-2 text-sm text-gray-500">
              Assignments
            </span>
          </div>
        </div>
        {/* Pending */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />

            <p className="text-sm font-medium text-gray-600">
              Pending
            </p>
          </div>

          <div className="mt-8">
            <span className="text-4xl font-bold text-gray-900">
              0
            </span>

            <span className="ml-2 text-sm text-gray-500">
              Assignments
            </span>
          </div>
        </div>
      </div>
      {/* My Grades */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            My Grades
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your assignment grades and mentor feedback will appear here.
          </p>
        </div>
        {grades.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <BarChart3 className="h-7 w-7 text-gray-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No grades yet
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              Your grades and mentor feedback will appear here
              after your mentor reviews your submissions.
            </p>
          </div>
        ) : (
          <div>
            {/* Grades will appear here later */}
          </div>
        )}
      </div>
    </div>
  );
}
export default StudentGrades;