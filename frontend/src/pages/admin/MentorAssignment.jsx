import { useEffect, useMemo, useState } from "react";

import {
  Link2,
  Users,
  GraduationCap,
  Search,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";

import apiClient from "../../services/apiClient";

function MentorAssignment() {
  // =========================================================
  // STATE
  // =========================================================

  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");

  const [mentorRole, setMentorRole] = useState("junior");

  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD STUDENTS + MENTORS
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("========== LOADING MENTOR DATA ==========");

      const [studentsResponse, mentorsResponse] =
        await Promise.all([
          apiClient.get("/mentors/students"),
          apiClient.get("/mentors/mentors"),
        ]);

      console.log(
        "STUDENTS RESPONSE:",
        studentsResponse.data
      );

      console.log(
        "MENTORS RESPONSE:",
        mentorsResponse.data
      );

      const studentsData =
        studentsResponse.data?.students || [];

      const mentorsData =
        mentorsResponse.data?.mentors || [];

      setStudents(studentsData);
      setMentors(mentorsData);

      console.log(
        "Students loaded:",
        studentsData.length
      );

      console.log(
        "Mentors loaded:",
        mentorsData.length
      );
    } catch (error) {
      console.error(
        "❌ LOAD MENTOR DATA ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "BACKEND:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Failed to load students and mentors."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // FILTER STUDENTS
  // =========================================================

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return students;
    }

    return students.filter((student) => {
      const name = String(
        student.name || ""
      ).toLowerCase();

      const email = String(
        student.email || ""
      ).toLowerCase();

      return (
        name.includes(value) ||
        email.includes(value)
      );
    });
  }, [students, search]);

  // =========================================================
  // FILTER MENTORS
  // =========================================================

  const filteredMentors = useMemo(() => {
    if (!mentors.length) {
      return [];
    }

    return mentors.filter((mentor) => {
      const role = String(
        mentor.mentorRole ||
          mentor.level ||
          "junior"
      )
        .trim()
        .toLowerCase();

      return role === mentorRole;
    });
  }, [mentors, mentorRole]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const assignedStudents = students.filter(
    (student) => student.assignedMentor
  ).length;

  const activeLinks = assignedStudents;

  const juniorMentors = mentors.filter((mentor) => {
    const role = String(
      mentor.mentorRole ||
        mentor.level ||
        "junior"
    )
      .trim()
      .toLowerCase();

    return role === "junior";
  });

  const seniorMentors = mentors.filter((mentor) => {
    const role = String(
      mentor.mentorRole ||
        mentor.level ||
        "junior"
    )
      .trim()
      .toLowerCase();

    return role === "senior";
  });

  // =========================================================
  // ASSIGN MENTOR
  // =========================================================

  const handleAssign = async () => {
    // -------------------------------------------------------
    // VALIDATE STUDENT
    // -------------------------------------------------------

    if (!selectedStudent) {
      setError("Please select a student.");
      setSuccess("");
      return;
    }

    // -------------------------------------------------------
    // VALIDATE MENTOR
    // -------------------------------------------------------

    if (!selectedMentor) {
      setError("Please select a mentor.");
      setSuccess("");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      // -----------------------------------------------------
      // IMPORTANT
      // These values come directly from:
      //
      // <option value={student._id}>
      // <option value={mentor._id}>
      // -----------------------------------------------------

      const studentId = String(
        selectedStudent
      ).trim();

      const mentorId = String(
        selectedMentor
      ).trim();

      console.log(
        "\n========================================"
      );

      console.log(
        "          FRONTEND ASSIGN"
      );

      console.log(
        "========================================"
      );

      console.log(
        "studentId:",
        studentId
      );

      console.log(
        "mentorId:",
        mentorId
      );

      console.log(
        "mentorRole:",
        mentorRole
      );

      console.log(
        "notes:",
        notes
      );

      // -----------------------------------------------------
      // EXTRA VALIDATION
      // -----------------------------------------------------

      if (!studentId) {
        throw new Error(
          "Student ID is empty."
        );
      }

      if (!mentorId) {
        throw new Error(
          "Mentor ID is empty."
        );
      }

      // -----------------------------------------------------
      // SEND REQUEST
      // -----------------------------------------------------

      const response = await apiClient.post(
        "/mentors/assign",
        {
          studentId: studentId,
          mentorId: mentorId,

          // These are harmless extra fields.
          // Backend does not require them.
          mentorRole: mentorRole,
          notes: notes,
        }
      );

      console.log(
        "✅ ASSIGN RESPONSE:",
        response.data
      );

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      setSuccess(
        response.data?.message ||
          "Mentor assigned successfully."
      );

      setError("");

      // -----------------------------------------------------
      // CLEAR FORM
      // -----------------------------------------------------

      setSelectedStudent("");
      setSelectedMentor("");
      setNotes("");

      // -----------------------------------------------------
      // RELOAD
      // -----------------------------------------------------

      await loadData();
    } catch (error) {
      console.error(
        "\n========================================"
      );

      console.error(
        "       ❌ FRONTEND ASSIGN ERROR"
      );

      console.error(
        "========================================"
      );

      console.error(
        "Error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      console.error(
        "Backend message:",
        error.response?.data?.message
      );

      console.error(
        "Backend error:",
        error.response?.data?.error
      );

      // -----------------------------------------------------
      // SHOW REAL ERROR
      // -----------------------------------------------------

      const backendMessage =
        error.response?.data?.message;

      const backendError =
        error.response?.data?.error;

      setError(
        backendError ||
          backendMessage ||
          error.message ||
          "Failed to assign mentor."
      );

      setSuccess("");
    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // REMOVE MENTOR
  // =========================================================

  const handleRemove = async (studentId) => {
    try {
      setRemoving(studentId);
      setError("");
      setSuccess("");

      console.log(
        "Removing mentor from:",
        studentId
      );

      const response = await apiClient.delete(
        `/mentors/remove/${studentId}`
      );

      console.log(
        "REMOVE RESPONSE:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Mentor assignment removed successfully."
      );

      await loadData();
    } catch (error) {
      console.error(
        "❌ REMOVE MENTOR ERROR:",
        error
      );

      console.error(
        "Backend:",
        error.response?.data
      );

      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to remove mentor."
      );
    } finally {
      setRemoving(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-900">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#00b87c]" />

            <p className="text-slate-500">
              Loading mentor assignments...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Mentor Assignment
        </h1>

        <p className="mt-2 text-slate-500">
          Assign mentors to students and manage
          mentorship relationships.
        </p>
      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          <p className="font-medium">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* ACTIVE LINKS */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-200 bg-green-50">
              <Link2
                size={27}
                className="text-[#00a878]"
              />
            </div>

            <div>
              <p className="text-3xl font-bold text-slate-900">
                {activeLinks}
              </p>

              <p className="text-sm uppercase tracking-wide text-slate-500">
                Active Links
              </p>
            </div>
          </div>
        </div>

        {/* JUNIOR */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50">
              <Users
                size={27}
                className="text-blue-500"
              />
            </div>

            <div>
              <p className="text-3xl font-bold text-slate-900">
                {juniorMentors.length}
              </p>

              <p className="text-sm uppercase tracking-wide text-slate-500">
                Junior Slots
              </p>
            </div>
          </div>
        </div>

        {/* SENIOR */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-200 bg-purple-50">
              <GraduationCap
                size={27}
                className="text-purple-500"
              />
            </div>

            <div>
              <p className="text-3xl font-bold text-slate-900">
                {seniorMentors.length}
              </p>

              <p className="text-sm uppercase tracking-wide text-slate-500">
                Senior Slots
              </p>
            </div>
          </div>
        </div>

        {/* STUDENTS */}

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-200 bg-yellow-50">
              <Users
                size={27}
                className="text-yellow-500"
              />
            </div>

            <div>
              <p className="text-3xl font-bold text-slate-900">
                {students.length}
              </p>

              <p className="text-sm uppercase tracking-wide text-slate-500">
                Students Covered
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ASSIGNMENT FORM
      ===================================================== */}

      <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <Plus
              size={23}
              className="text-[#00a878]"
            />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Assign mentor slot
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">

          {/* STUDENT */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Student
            </label>

            <div className="relative">
              <select
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(
                    e.target.value
                  );

                  setError("");
                  setSuccess("");
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-4 pr-10 text-slate-900 outline-none transition focus:border-[#00b87c] focus:ring-2 focus:ring-[#00b87c]/20"
              >
                <option value="">
                  Select student
                </option>

                {students.map((student) => (
                  <option
                    key={student._id}
                    value={student._id}
                  >
                    {student.name} -{" "}
                    {student.email}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={20}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {students.length} student
              profile(s)
            </p>
          </div>

          {/* MENTOR ROLE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Mentor role
            </label>

            <div className="relative">
              <select
                value={mentorRole}
                onChange={(e) => {
                  setMentorRole(
                    e.target.value
                  );

                  setSelectedMentor("");

                  setError("");
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-4 pr-10 text-slate-900 outline-none transition focus:border-[#00b87c] focus:ring-2 focus:ring-[#00b87c]/20"
              >
                <option value="junior">
                  Junior mentor
                </option>

                <option value="senior">
                  Senior mentor
                </option>
              </select>

              <ChevronDown
                size={20}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* MENTOR */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Mentor ({mentorRole})
            </label>

            <div className="relative">
              <select
                value={selectedMentor}
                onChange={(e) => {
                  setSelectedMentor(
                    e.target.value
                  );

                  setError("");
                  setSuccess("");
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-4 pr-10 text-slate-900 outline-none transition focus:border-[#00b87c] focus:ring-2 focus:ring-[#00b87c]/20"
              >
                <option value="">
                  Select {mentorRole} mentor
                </option>

                {filteredMentors.map(
                  (mentor) => (
                    <option
                      key={mentor._id}
                      value={mentor._id}
                    >
                      {mentor.name} -{" "}
                      {mentor.email}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={20}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {filteredMentors.length}{" "}
              {mentorRole} mentor(s)
            </p>
          </div>

          {/* NOTES */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Notes
            </label>

            <input
              type="text"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00b87c] focus:ring-2 focus:ring-[#00b87c]/20"
            />
          </div>
        </div>

        {/* ASSIGN BUTTON */}

        <button
          type="button"
          onClick={handleAssign}
          disabled={
            assigning ||
            !selectedStudent ||
            !selectedMentor
          }
          className="mt-7 flex items-center gap-3 rounded-xl bg-[#00a878] px-7 py-4 font-semibold text-white transition hover:bg-[#00bf89] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {assigning ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Assigning...
            </>
          ) : (
            <>
              <Plus size={21} />
              Assign slot
            </>
          )}
        </button>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mb-6">
        <div className="relative">
          <Search
            size={22}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search students by name or email..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-5 pl-12 pr-5 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-[#00b87c] focus:ring-2 focus:ring-[#00b87c]/20"
          />
        </div>

        <div className="mt-2 flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            {search
              ? `${filteredStudents.length} student(s) found`
              : `${students.length} student(s)`}
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-sm font-medium text-[#00a878] hover:text-[#008f68]"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          STUDENTS TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-left">

                <th className="px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </th>

                <th className="px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Mentor
                </th>

                <th className="px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Course
                </th>

                <th className="px-6 py-5 text-right text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">

                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <Search
                          size={25}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="font-medium text-slate-700">
                        No students found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try another name or email.
                      </p>

                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(
                  (student) => (
                    <tr
                      key={student._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >

                      {/* STUDENT */}

                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          {student.name ||
                            "Unknown student"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {student.email ||
                            "No email"}
                        </p>
                      </td>

                      {/* ROLE */}

                      <td className="px-6 py-5">
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase text-blue-600">
                          Student
                        </span>
                      </td>

                      {/* MENTOR */}

                      <td className="px-6 py-5">
                        {student.assignedMentor ? (
                          <div>
                            <p className="font-medium text-slate-900">
                              {
                                student
                                  .assignedMentor
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {
                                student
                                  .assignedMentor
                                  .email
                              }
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">
                            Not assigned
                          </span>
                        )}
                      </td>

                      {/* COURSE */}

                      <td className="px-6 py-5 text-slate-600">
                        {student.course ||
                          student.program ||
                          "Full Stack Web Development"}
                      </td>

                      {/* REMOVE */}

                      <td className="px-6 py-5 text-right">
                        {student.assignedMentor && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemove(
                                student._id
                              )
                            }
                            disabled={
                              removing ===
                              student._id
                            }
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                            title="Remove mentor"
                          >
                            {removing ===
                            student._id ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                            ) : (
                              <Trash2
                                size={19}
                              />
                            )}
                          </button>
                        )}
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

export default MentorAssignment;