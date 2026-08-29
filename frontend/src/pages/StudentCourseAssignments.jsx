import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

function StudentCourseAssignments() {
  const { courseName } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const decodedCourse = decodeURIComponent(courseName || "");

  // =========================================================
  // LOAD ASSIGNMENTS
  // =========================================================
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get("/assignments");

        console.log("Course assignments:", response.data);

        const allAssignments =
          response.data?.assignments ||
          response.data?.data ||
          [];

        if (!Array.isArray(allAssignments)) {
          setAssignments([]);
          return;
        }

        // Filter by selected course
        const filteredAssignments = allAssignments.filter(
          (assignment) =>
            String(assignment.course || "")
              .trim()
              .toLowerCase() ===
            decodedCourse.trim().toLowerCase()
        );

        setAssignments(filteredAssignments);
      } catch (err) {
        console.error(
          "Failed to load course assignments:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load course assignments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [decodedCourse]);

  // =========================================================
  // GROUP ASSIGNMENTS DYNAMICALLY
  // =========================================================
  const containers = assignments.reduce(
    (groups, assignment) => {
      const containerName =
        assignment.courseType ||
        assignment.topic ||
        "general";

      if (!groups[containerName]) {
        groups[containerName] = [];
      }

      groups[containerName].push(assignment);

      return groups;
    },
    {}
  );

  // =========================================================
  // FORMAT CONTAINER NAME
  // =========================================================
  const formatContainerName = (name) => {
    if (!name) {
      return "General";
    }

    return String(name)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================================================
  // OPEN ASSIGNMENT
  // =========================================================
  const openAssignment = (assignment) => {
    if (!assignment?._id) {
      setError("This assignment does not have a valid ID.");
      return;
    }

    console.log(
      "Opening assignment:",
      assignment._id
    );

    navigate(
      `/student/assignments/${assignment._id}`
    );
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">
          Loading course...
        </p>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================
  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] text-slate-800 dark:text-slate-100">
      <main className="mx-auto max-w-[1200px] px-5 py-10 md:px-8">

        {/* =================================================
            BACK
        ================================================= */}
        <button
          type="button"
          onClick={() =>
            navigate("/student/assignments")
          }
          className="mb-6 text-sm font-medium text-[#1f6f5b] transition hover:text-[#185848]"
        >
          ← Back to Courses
        </button>

        {/* =================================================
            COURSE HEADER
        ================================================= */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1f6f5b]">
            Course
          </p>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {decodedCourse}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Select a container to view its assignments.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            NO ASSIGNMENTS
        ================================================= */}
        {Object.keys(containers).length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-10 text-center shadow-sm">
            <p className="text-slate-500 dark:text-slate-400">
              No assignments found for this course.
            </p>
          </div>
        ) : (

          /* =================================================
             DYNAMIC CONTAINERS
          ================================================= */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {Object.entries(containers).map(
              ([containerName, containerAssignments]) => (

                <div
                  key={containerName}
                  className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm transition hover:shadow-md"
                >

                  {/* ICON */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f1ed] font-bold text-[#1f6f5b]">
                    {String(containerName)
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  {/* CONTAINER NAME */}
                  <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                    {formatContainerName(
                      containerName
                    )}
                  </h2>

                  {/* COUNT */}
                  <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                    {containerAssignments.length}{" "}
                    assignment
                    {containerAssignments.length !== 1
                      ? "s"
                      : ""}
                  </p>

                  {/* =================================================
                      ASSIGNMENTS
                  ================================================= */}
                  <div className="space-y-3">

                    {containerAssignments.map(
                      (assignment) => (

                        <button
                          key={assignment._id}
                          type="button"
                          onClick={() =>
                            openAssignment(
                              assignment
                            )
                          }
                          className="group flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-[#15253f] px-4 py-3 text-left transition hover:border-blue-300 hover:bg-[#e5f1ed]"
                        >

                          <div className="min-w-0">

                            <p className="font-medium text-slate-700 dark:text-slate-200">
                              {assignment.title ||
                                "Untitled Assignment"}
                            </p>

                            {assignment.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                                {assignment.description}
                              </p>
                            )}

                            {assignment.deadline && (
                              <p className="mt-2 text-xs text-slate-400">
                                Deadline:{" "}
                                {new Date(
                                  assignment.deadline
                                ).toLocaleDateString()}
                              </p>
                            )}

                          </div>

                          <span className="ml-3 shrink-0 text-lg text-[#1f6f5b] transition group-hover:translate-x-1">
                            →
                          </span>

                        </button>

                      )
                    )}

                  </div>

                </div>

              )
            )}

          </div>
        )}

      </main>
    </div>
  );
}

export default StudentCourseAssignments;

