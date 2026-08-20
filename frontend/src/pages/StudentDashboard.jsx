import { Link } from "react-router-dom";
import {
  CalendarCheck,
  TrendingUp,
  GraduationCap,
  ClipboardCheck,
  ArrowRight,
  Bell,
} from "lucide-react";
import useAuth from "../context/useAuth";
function StudentDashboard() {
  const { user } = useAuth();
  const studentName = user?.name || "Student";
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {studentName} 
        </h1>

        <p className="mt-2 text-gray-600">
          Here's an overview of your bootcamp progress and activities.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Attendance */}
        <div className="rounded-xl bg-white p-5 shadow-sm border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Attendance
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                0%
              </h2>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <CalendarCheck className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="mt-5 border-t pt-3">
            <Link
              to="/student/attendance"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600">
              View Attendance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* Overall Progress */}
        <div className="rounded-xl bg-white p-5 shadow-sm border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Overall Progress
              </p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                0%
              </h2>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 rounded-full bg-gray-200">
            <div className="h-2 w-0 rounded-full bg-blue-600" />
          </div>
          <div className="mt-4 border-t pt-3">
            <Link
              to="/student/progress"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600">
              View Progress
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* Average Grade */}
        <div className="rounded-xl bg-white p-5 shadow-sm border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Average Grade
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                0%
              </h2>
            </div>

            <div className="rounded-full bg-purple-100 p-3">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-5 border-t pt-3">
            <Link
              to="/student/grades"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600">
              View Grades
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Assignments */}
        <div className="rounded-xl bg-white p-5 shadow-sm border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Assignments Completed
              </p>

              <h2 className="mt-3 text-3xl font-bold text-gray-900">
                0<span className="text-lg text-gray-400"> / 0</span>
              </h2>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
          {/* Assignment progress */}
          <div className="mt-4 flex gap-1">
            <div className="h-1.5 w-8 rounded-full bg-gray-200" />
            <div className="h-1.5 w-8 rounded-full bg-gray-200" />
            <div className="h-1.5 w-8 rounded-full bg-gray-200" />
            <div className="h-1.5 w-8 rounded-full bg-gray-200" />
            <div className="h-1.5 w-8 rounded-full bg-gray-200" />
          </div>

          <div className="mt-4 border-t pt-3">
            <Link
              to="/student/assignments"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600" >
              View Assignments
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* My Progress */}
        <div className="rounded-xl bg-white shadow-sm border lg:col-span-2">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              My Progress
            </h2>

            <Link
              to="/student/progress"
              className="rounded-lg border bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" >
              View Full Progress
            </Link>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 border-b pb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              <span>Topic</span>
              <span>Progress</span>
              <span>Status</span>
            </div>

            {/* Empty state */}
            <div className="py-12 text-center">
              <TrendingUp className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="mt-3 font-medium text-gray-700">
                No progress yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your course progress will appear here once you start learning.
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-xl bg-white shadow-sm border">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Deadlines
            </h2>
          </div>
          <div className="p-5">
            <div className="py-8 text-center">
              <ClipboardCheck className="mx-auto h-9 w-9 text-gray-300" />
              <h3 className="mt-3 font-medium text-gray-700">
                No upcoming deadlines
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                New assignment deadlines will appear here.
              </p>
            </div>
            <Link
              to="/student/assignments"
              className="flex items-center justify-center gap-1 border-t pt-4 text-sm font-medium text-blue-600 hover:underline">
              View All Assignments
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="rounded-xl bg-white shadow-sm border">
        <div className="flex items-center gap-2 border-b p-5">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Announcements
          </h2>
        </div>
        <div className="divide-y">
          <div className="p-5">
            <h3 className="font-medium text-gray-900">
              Welcome to ASTU MSJ Bootcamp
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Welcome! Important bootcamp announcements will appear here.
            </p>
          </div>
          <div className="p-5">
            <h3 className="font-medium text-gray-900">
              Bootcamp orientation
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Check the schedule for upcoming bootcamp activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default StudentDashboard;