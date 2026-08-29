import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  PlusCircle,
  BookOpen,
  Calendar,
  Clock,
} from "lucide-react";
import apiClient from "../services/apiClient";

function MentorDashboard() {
  console.log("🔥 MENTOR DASHBOARD IS RENDERING");

  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ASSIGNMENTS
  // ==========================================
  useEffect(() => {
    console.log("🔥 MENTOR DASHBOARD MOUNTED");
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    console.log("=================================");
    console.log("🔥 FETCHING ASSIGNMENTS");
    console.log("=================================");

    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    if (!token) {
      setError("No login token found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/assignments");

      console.log("✅ RESPONSE STATUS:", response.status);
      console.log("✅ RESPONSE DATA:", response.data);

      const data =
        response.data?.assignments ||
        response.data?.data ||
        [];

      console.log("✅ ASSIGNMENTS ARRAY:", data);

      if (Array.isArray(data)) {
        setAssignments(data);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("❌ ASSIGNMENT REQUEST FAILED");
      console.error(error);

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Backend:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);

      console.log("🔥 ASSIGNMENT FETCH FINISHED");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="w-full bg-gray-50 px-4 py-8 sm:px-6 md:px-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">
            Loading assignments...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================
  return (
    <div className="w-full bg-gray-50">
      <div className="w-full px-4 pb-8 pt-4 sm:px-6 md:px-8">

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Mentor Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and view your assignments.
          </p>
        </div>

        {/* ==========================================
            ERROR
        ========================================== */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAssignments}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ==========================================
            SEPARATED QUICK ACTIONS
        ========================================== */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* ==========================================
              ANNOUNCEMENTS SPACE
          ========================================== */}
          <div className="flex flex-col justify-between rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-6 shadow-sm">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                  <Megaphone size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Send Announcement
                  </h2>

                  <p className="text-xs text-gray-500">
                    Mentor Announcements Center
                  </p>
                </div>

              </div>

              <p className="mt-4 text-xs leading-5 text-gray-600">
                Broadcast updates, session reminders, guidelines,
                or event details directly to your assigned students
                and batch members.
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  navigate("/mentor/announcements")
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
              >
                <Megaphone size={16} />
                Send Announcement
              </button>
            </div>

          </div>

          {/* ==========================================
              ASSIGNMENTS SPACE
          ========================================== */}
          <div className="flex flex-col justify-between rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-6 shadow-sm">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                  <PlusCircle size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Create Assignment & Tasks
                  </h2>

                  <p className="text-xs text-gray-500">
                    Assignment Workspace
                  </p>
                </div>

              </div>

              <p className="mt-4 text-xs leading-5 text-gray-600">
                Create new coding tasks, homework assignments,
                or lab exercises and track student submissions.
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  navigate("/mentor/assignments")
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md sm:w-auto"
              >
                <PlusCircle size={16} />
                Create Assignment
              </button>
            </div>

          </div>

        </div>

        {/* ==========================================
            STATISTICS
        ========================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Assignments
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {assignments.length}
            </p>
          </div>

          {/* COURSES */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Courses
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {
                new Set(
                  assignments
                    .map(
                      (assignment) =>
                        assignment.course?._id
                    )
                    .filter(Boolean)
                ).size
              }
            </p>
          </div>

          {/* UPCOMING */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {
                assignments.filter(
                  (assignment) =>
                    assignment.deadline &&
                    new Date(assignment.deadline) >=
                      new Date()
                ).length
              }
            </p>
          </div>

        </div>

        {/* ==========================================
            ASSIGNMENTS
        ========================================== */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* TITLE */}
          <div className="border-b border-gray-200 p-5">

            <h2 className="text-lg font-semibold text-gray-900">
              Assignments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Assignments fetched from the backend.
            </p>

          </div>

          {/* ==========================================
              EMPTY
          ========================================== */}
          {assignments.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <p className="text-gray-500">
                No assignments available.
              </p>

              <button
                type="button"
                onClick={fetchAssignments}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Refresh
              </button>

            </div>
          ) : (

            /* ==========================================
               LIST
            ========================================== */
            <div className="divide-y divide-gray-100">

              {assignments.map((assignment) => (

                <div
                  key={assignment._id}
                  className="p-5 transition hover:bg-gray-50"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    {/* ==========================================
                        LEFT
                    ========================================== */}
                    <div className="min-w-0">

                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {assignment.description ||
                          "No description available."}
                      </p>

                      {/* ==========================================
                          BADGES
                      ========================================== */}
                      <div className="mt-3 flex flex-wrap gap-2">

                        {/* COURSE */}
                        {assignment.course && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            Course:{" "}
                            {assignment.course?.name ||
                              "Unknown Course"}
                          </span>
                        )}

                        {/* BATCH */}
                        {assignment.batchId && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Batch:{" "}
                            {assignment.batchId?.name ||
                              assignment.batchId}
                          </span>
                        )}

                      </div>

                      {/* ==========================================
                          DETAILS
                      ========================================== */}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">

                        <span>
                          Students:{" "}
                          {assignment.assignedStudents?.length ||
                            0}
                        </span>

                        <span>
                          Max Score:{" "}
                          {assignment.maxScore ?? 0}
                        </span>

                        {assignment.deadline && (
                          <span>
                            Deadline:{" "}
                            {new Date(
                              assignment.deadline
                            ).toLocaleDateString()}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ==========================================
                        RIGHT
                    ========================================== */}
                    <div className="shrink-0">

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/mentor/assignments/${assignment._id}`
                          )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                      >
                        View Assignment
                      </button>

                    </div>

                  </div>

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