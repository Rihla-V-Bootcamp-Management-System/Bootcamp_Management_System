import { useCallback, useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

function Attendance() {
  // =========================================================
  // STATE
  // =========================================================

  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [attendance, setAttendance] = useState({});
  const [savedAttendance, setSavedAttendance] = useState([]);

  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // HELPERS
  // =========================================================

  const getId = (item) => {
    if (!item) return "";

    if (typeof item === "object") {
      return String(
        item._id ||
          item.id ||
          item.userId ||
          item.studentId ||
          ""
      );
    }

    return String(item);
  };

  const getStudentName = (student) => {
    if (!student) {
      return "Unknown Student";
    }

    if (typeof student === "string") {
      return student;
    }

    if (typeof student === "object") {
      const fullName =
        `${student.firstName || ""} ${
          student.lastName || ""
        }`.trim();

      return (
        student.name ||
        student.fullName ||
        fullName ||
        student.username ||
        student.email ||
        "Unknown Student"
      );
    }

    return "Unknown Student";
  };

  const getStudentEmail = (student) => {
    if (!student || typeof student !== "object") {
      return "";
    }

    return student.email || "";
  };

  const getRecordStudentId = (record) => {
    if (!record) {
      return "";
    }

    return getId(
      record.studentId ||
        record.student ||
        record.userId
    );
  };

  const getDateKey = (date) => {
    if (!date) {
      return "";
    }

    // Backend may return YYYY-MM-DD directly.
    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return date;
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toISOString().split("T")[0];
  };

  // =========================================================
  // EXTRACT ARRAY FROM API RESPONSE
  // =========================================================

  const extractArray = (responseData, possibleKeys = []) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (!responseData) {
      return [];
    }

    for (const key of possibleKeys) {
      if (Array.isArray(responseData[key])) {
        return responseData[key];
      }
    }

    if (Array.isArray(responseData.data)) {
      return responseData.data;
    }

    return [];
  };

  // =========================================================
  // LOAD BATCHES
  // =========================================================

  const loadBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      setError("");

      const response = await apiClient.get("/batches");

      console.log(
        "BATCHES RESPONSE:",
        response.data
      );

      const data = extractArray(response.data, [
        "batches",
        "data",
        "results",
      ]);

      setBatches(data);
    } catch (err) {
      console.error(
        "LOAD BATCHES ERROR:",
        err.response?.data || err
      );

      setBatches([]);

      setError(
        err.response?.data?.message ||
          "Failed to load batches."
      );
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  // =========================================================
  // LOAD STUDENTS FOR SELECTED BATCH
  // =========================================================

  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      setAttendance({});
      setSavedAttendance([]);
      return;
    }

    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        setError("");
        setSuccess("");

        // Reset old batch information immediately.
        setStudents([]);
        setAttendance({});
        setSavedAttendance([]);

        const response = await apiClient.get(
          `/batches/${selectedBatch}`
        );

        console.log(
          "BATCH DETAILS RESPONSE:",
          response.data
        );

        const batch =
          response.data?.batch ||
          response.data?.data ||
          response.data;

        // -----------------------------------------------------
        // Support different backend structures
        // -----------------------------------------------------

        let batchStudents =
          batch?.students ||
          batch?.studentIds ||
          batch?.members ||
          batch?.users ||
          [];

        // Some APIs return:
        // { data: { students: [...] } }

        if (
          !Array.isArray(batchStudents) &&
          Array.isArray(response.data?.data?.students)
        ) {
          batchStudents =
            response.data.data.students;
        }

        if (!Array.isArray(batchStudents)) {
          batchStudents = [];
        }

        console.log(
          "STUDENTS FOUND:",
          batchStudents
        );

        setStudents(batchStudents);
      } catch (err) {
        console.error(
          "LOAD STUDENTS ERROR:",
          err.response?.data || err
        );

        setStudents([]);

        setError(
          err.response?.data?.message ||
            "Failed to load students."
        );
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedBatch]);

 
  useEffect(() => {
    if (
      !selectedBatch ||
      !selectedWeek ||
      !selectedDate ||
      loadingStudents
    ) {
      return;
    }

    if (students.length === 0) {
      setSavedAttendance([]);
      setAttendance({});
      return;
    }

    loadExistingAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBatch,
    selectedWeek,
    selectedDate,
    loadingStudents,
    students,
  ]);

  

  const loadExistingAttendance = async () => {
    try {
      setLoadingAttendance(true);
      setError("");

      const response = await apiClient.get(
        `/attendance?batchId=${selectedBatch}`
      );

      console.log(
        "ATTENDANCE RESPONSE:",
        response.data
      );

      const records = extractArray(
        response.data,
        [
          "attendance",
          "records",
          "data",
          "results",
        ]
      );

      // -----------------------------------------------------
      // Filter by selected week and selected date
      // -----------------------------------------------------

      const filteredRecords = records.filter(
        (record) => {
          const recordWeek =
            Number(record?.week);

          const recordDate = getDateKey(
            record?.sessionDate ||
              record?.date ||
              record?.attendanceDate ||
              record?.createdAt
          );

          return (
            recordWeek === Number(selectedWeek) &&
            recordDate === selectedDate
          );
        }
      );

      console.log(
        "FILTERED ATTENDANCE:",
        filteredRecords
      );

      setSavedAttendance(filteredRecords);

      // -----------------------------------------------------
      // Create map of existing records
      // -----------------------------------------------------

      const existing = {};

      filteredRecords.forEach((record) => {
        const studentId =
          getRecordStudentId(record);

        if (!studentId) {
          return;
        }

        existing[String(studentId)] = {
          status:
            record.status || "Present",
          notes: record.notes || "",
          attendanceId:
            record._id || record.id,
        };
      });

      // -----------------------------------------------------
      // Build attendance form
      //
      // Existing record:
      //     use existing status
      //
      // No existing record:
      //     default to Present
      // -----------------------------------------------------

      const initialAttendance = {};

      students.forEach((student) => {
        const studentId = getId(student);

        if (!studentId) {
          return;
        }

        initialAttendance[studentId] =
          existing[studentId] || {
            status: "Present",
            notes: "",
            attendanceId: null,
          };
      });

      setAttendance(initialAttendance);
    } catch (err) {
      console.error(
        "LOAD EXISTING ATTENDANCE ERROR:",
        err.response?.data || err
      );

      setSavedAttendance([]);
      setAttendance({});

      setError(
        err.response?.data?.message ||
          "Failed to load existing attendance."
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const handleStatusChange = (
    studentId,
    status
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status,
      },
    }));

    setSuccess("");
    setError("");
  };

  // =========================================================
  // NOTES CHANGE
  // =========================================================

  const handleNotesChange = (
    studentId,
    notes
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        notes,
      },
    }));

    setSuccess("");
    setError("");
  };

  // =========================================================
  // SAVE ATTENDANCE
  // =========================================================

  const handleSaveAttendance = async () => {
    setError("");
    setSuccess("");

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!selectedBatch) {
      setError("Please select a batch.");
      return;
    }

    if (!selectedWeek) {
      setError("Please select a week.");
      return;
    }

    if (!selectedDate) {
      setError("Please select a session date.");
      return;
    }

    if (students.length === 0) {
      setError(
        "There are no students in this batch."
      );
      return;
    }

    try {
      setSaving(true);

      // -----------------------------------------------------
      // FIRST FETCH THE LATEST RECORDS
      //
      // This prevents duplicate records if the page was
      // opened in another tab or attendance was recently saved.
      // -----------------------------------------------------

      const latestResponse = await apiClient.get(
        `/attendance?batchId=${selectedBatch}`
      );

      const latestRecords = extractArray(
        latestResponse.data,
        [
          "attendance",
          "records",
          "data",
          "results",
        ]
      );

      const existingForSession =
        latestRecords.filter((record) => {
          const recordWeek =
            Number(record?.week);

          const recordDate = getDateKey(
            record?.sessionDate ||
              record?.date ||
              record?.attendanceDate ||
              record?.createdAt
          );

          return (
            recordWeek === Number(selectedWeek) &&
            recordDate === selectedDate
          );
        });

      // -----------------------------------------------------
      // MAP EXISTING RECORDS BY STUDENT
      // -----------------------------------------------------

      const existingMap = {};

      existingForSession.forEach((record) => {
        const studentId =
          getRecordStudentId(record);

        if (!studentId) {
          return;
        }

        existingMap[String(studentId)] =
          record;
      });

      // -----------------------------------------------------
      // SAVE EACH STUDENT
      // -----------------------------------------------------

      const results = [];

      for (const student of students) {
        const studentId = getId(student);

        if (!studentId) {
          continue;
        }

        const current =
          attendance[studentId] || {
            status: "Present",
            notes: "",
          };

        const existing =
          existingMap[studentId];

        const payload = {
          studentId,
          batchId: selectedBatch,
          week: Number(selectedWeek),
          sessionDate: selectedDate,
          status:
            current.status || "Present",
          notes: current.notes || "",
        };

        console.log(
          "SAVING ATTENDANCE:",
          payload
        );

        // ---------------------------------------------------
        // UPDATE EXISTING
        // ---------------------------------------------------

        if (existing?._id || existing?.id) {
          const attendanceId =
            existing._id || existing.id;

          const response =
            await apiClient.put(
              `/attendance/${attendanceId}`,
              payload
            );

          results.push(response.data);
        }

        // ---------------------------------------------------
        // CREATE NEW
        // ---------------------------------------------------

        else {
          const response =
            await apiClient.post(
              "/attendance",
              payload
            );

          results.push(response.data);
        }
      }

      console.log(
        "SAVE RESULTS:",
        results
      );

      setSuccess(
        "Attendance saved successfully."
      );

      // -----------------------------------------------------
      // LOAD THE SAVED DATA AGAIN
      // -----------------------------------------------------

      await loadExistingAttendance();
    } catch (err) {
      console.error(
        "SAVE ATTENDANCE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // GET SAVED STUDENT
  // =========================================================

  const getSavedStudent = (record) => {
    const recordStudentId =
      getRecordStudentId(record);

    // If backend populated student
    if (
      record?.studentId &&
      typeof record.studentId === "object"
    ) {
      return record.studentId;
    }

    // Otherwise find student from batch
    return students.find(
      (student) =>
        getId(student) ===
        String(recordStudentId)
    );
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefreshAttendance =
    async () => {
      if (
        selectedBatch &&
        selectedWeek &&
        selectedDate &&
        students.length > 0
      ) {
        await loadExistingAttendance();
      }
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-[#071629]">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-[#718096]">
          Mark and manage student attendance.
        </p>
      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-3">
          {/* BATCH */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#071629]">
              Batch
            </label>

            <select
              value={selectedBatch}
              onChange={(e) => {
                const value = e.target.value;

                setSelectedBatch(value);
                setSelectedWeek("");
                setSelectedDate("");

                setStudents([]);
                setAttendance({});
                setSavedAttendance([]);

                setError("");
                setSuccess("");
              }}
              className="w-full rounded-xl border border-[#D9DEE7] bg-white px-4 py-3 text-sm outline-none focus:border-[#071629]"
            >
              <option value="">
                {loadingBatches
                  ? "Loading batches..."
                  : "Select batch"}
              </option>

              {batches.map((batch) => {
                const batchId = getId(batch);

                return (
                  <option
                    key={batchId}
                    value={batchId}
                  >
                    {batch.name ||
                      batch.batchName ||
                      batch.title ||
                      `Batch ${batchId}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* WEEK */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#071629]">
              Week
            </label>

            <select
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(
                  e.target.value
                );

                setSuccess("");
                setError("");
              }}
              className="w-full rounded-xl border border-[#D9DEE7] bg-white px-4 py-3 text-sm outline-none focus:border-[#071629]"
            >
              <option value="">
                Select week
              </option>

              {Array.from(
                { length: 12 },
                (_, index) => index + 1
              ).map((week) => (
                <option
                  key={week}
                  value={week}
                >
                  Week {week}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#071629]">
              Session Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(
                  e.target.value
                );

                setSuccess("");
                setError("");
              }}
              className="w-full rounded-xl border border-[#D9DEE7] bg-white px-4 py-3 text-sm outline-none focus:border-[#071629]"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          MARK ATTENDANCE
      ====================================================== */}

      {selectedBatch && (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          {/* HEADER */}

          <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#071629]">
                Mark Attendance
              </h2>

              <p className="mt-1 text-sm text-[#718096]">
                {selectedWeek
                  ? `Week ${selectedWeek}`
                  : "Select a week"}

                {selectedDate
                  ? ` · ${selectedDate}`
                  : ""}
              </p>
            </div>

            {selectedWeek &&
              selectedDate && (
                <button
                  type="button"
                  onClick={
                    handleRefreshAttendance
                  }
                  disabled={
                    loadingAttendance ||
                    loadingStudents
                  }
                  className="rounded-lg border border-[#D9DEE7] px-4 py-2 text-sm font-medium text-[#52627A] hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  {loadingAttendance
                    ? "Loading..."
                    : "Refresh"}
                </button>
              )}
          </div>

          {/* LOADING */}

          {loadingStudents ||
          loadingAttendance ? (
            <div className="px-6 py-12 text-center text-sm text-[#718096]">
              Loading attendance...
            </div>
          ) : students.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-[#52627A]">
                No students found in this
                batch.
              </p>

              <p className="mt-1 text-xs text-[#94A3B8]">
                Make sure students have been
                assigned to this batch.
              </p>
            </div>
          ) : !selectedWeek ||
            !selectedDate ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-[#52627A]">
                Select a week and session date
                to mark attendance.
              </p>
            </div>
          ) : (
            <>
              {/* TABLE */}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-left">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#718096]">
                        Student
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#718096]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#718096]">
                        Notes
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map(
                      (student) => {
                        const studentId =
                          getId(student);

                        if (!studentId) {
                          return null;
                        }

                        const current =
                          attendance[
                            studentId
                          ] || {
                            status: "Present",
                            notes: "",
                          };

                        return (
                          <tr
                            key={studentId}
                            className="border-b border-[#F0F2F5] last:border-0"
                          >
                            {/* STUDENT */}

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF0F6] font-semibold text-[#071629]">
                                  {getStudentName(
                                    student
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <div className="text-sm font-semibold text-[#071629]">
                                    {getStudentName(
                                      student
                                    )}
                                  </div>

                                  {getStudentEmail(
                                    student
                                  ) && (
                                    <div className="mt-1 text-xs text-[#718096]">
                                      {getStudentEmail(
                                        student
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-4">
                              <select
                                value={
                                  current.status ||
                                  "Present"
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleStatusChange(
                                    studentId,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className="rounded-lg border border-[#D9DEE7] bg-white px-3 py-2 text-sm outline-none focus:border-[#071629]"
                              >
                                <option value="Present">
                                  Present
                                </option>

                                <option value="Absent">
                                  Absent
                                </option>

                                <option value="Late">
                                  Late
                                </option>

                                <option value="Excused">
                                  Excused
                                </option>
                              </select>
                            </td>

                            {/* NOTES */}

                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={
                                  current.notes ||
                                  ""
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleNotesChange(
                                    studentId,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Optional note"
                                className="w-full min-w-[200px] rounded-lg border border-[#D9DEE7] px-3 py-2 text-sm outline-none focus:border-[#071629]"
                              />
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* SAVE */}

              <div className="flex justify-end border-t border-[#E5E7EB] px-6 py-5">
                <button
                  type="button"
                  onClick={
                    handleSaveAttendance
                  }
                  disabled={saving}
                  className="rounded-xl bg-[#071629] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : savedAttendance.length >
                      0
                    ? "Update Attendance"
                    : "Save Attendance"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* =====================================================
          SAVED ATTENDANCE
      ====================================================== */}

      {selectedBatch &&
        selectedWeek &&
        selectedDate &&
        savedAttendance.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            {/* HEADER */}

            <div className="flex flex-col gap-3 border-b border-[#E5E7EB] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-[#071629]">
                  Saved Attendance
                </h2>

                <p className="mt-1 text-sm text-[#718096]">
                  Week {selectedWeek} ·{" "}
                  {selectedDate}
                </p>
              </div>

              <span className="text-sm font-medium text-[#718096]">
                {savedAttendance.length}{" "}
                record
                {savedAttendance.length !==
                1
                  ? "s"
                  : ""}
              </span>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#718096]">
                      Student
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#718096]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#718096]">
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {savedAttendance.map(
                    (record, index) => {
                      const student =
                        getSavedStudent(
                          record
                        );

                      return (
                        <tr
                          key={
                            record._id ||
                            record.id ||
                            `${getRecordStudentId(
                              record
                            )}-${index}`
                          }
                          className="border-b border-[#F0F2F5] last:border-0"
                        >
                          {/* STUDENT */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF0F6] text-sm font-semibold text-[#071629]">
                                {getStudentName(
                                  student
                                )
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>
                                <div className="text-sm font-semibold text-[#071629]">
                                  {getStudentName(
                                    student
                                  )}
                                </div>

                                {getStudentEmail(
                                  student
                                ) && (
                                  <div className="mt-1 text-xs text-[#718096]">
                                    {getStudentEmail(
                                      student
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-lg px-3 py-1.5 text-sm font-semibold ${
                                record.status ===
                                "Present"
                                  ? "bg-green-50 text-green-700"
                                  : record.status ===
                                    "Absent"
                                  ? "bg-red-50 text-red-700"
                                  : record.status ===
                                    "Late"
                                  ? "bg-orange-50 text-orange-700"
                                  : record.status ===
                                    "Excused"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-gray-50 text-gray-700"
                              }`}
                            >
                              {record.status ||
                                "Unknown"}
                            </span>
                          </td>

                          {/* NOTES */}

                          <td className="px-6 py-4 text-sm text-[#718096]">
                            {record.notes ||
                              "-"}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* =====================================================
          NO SAVED RECORDS
      ====================================================== */}

      {selectedBatch &&
        selectedWeek &&
        selectedDate &&
        !loadingStudents &&
        !loadingAttendance &&
        savedAttendance.length === 0 &&
        students.length > 0 && (
          <div className="rounded-2xl border border-dashed border-[#D9DEE7] bg-white px-6 py-8 text-center">
            <p className="text-sm font-medium text-[#52627A]">
              No attendance has been saved for
              this session yet.
            </p>

            <p className="mt-1 text-xs text-[#94A3B8]">
              Mark the students above and click
              Save Attendance.
            </p>
          </div>
        )}
    </div>
  );
}

export default Attendance;