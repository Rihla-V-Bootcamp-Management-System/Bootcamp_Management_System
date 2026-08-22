import { useEffect, useMemo, useState } from "react";
import apiClient from "../../services/apiClient";

function Attendance() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendance, setAttendance] = useState({});

  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);
        setError("");

        const response = await apiClient.get("/batches");

        const data = response.data;

        const batchList = Array.isArray(data)
          ? data
          : data.batches || [];

        setBatches(batchList);
      } catch (error) {
        console.error("Failed to load batches:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load batches."
        );
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, []);

  
  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      setAttendance({});
      return;
    }

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        setError("");
        setSuccess("");

        const response = await apiClient.get(
          `/batches/${selectedBatch}`
        );

        const batch = response.data?.batch || response.data;

        const studentList = batch?.students || [];

        setStudents(studentList);

        // Default every student to Present
        const initialAttendance = {};

        studentList.forEach((student) => {
          const studentId =
            student._id || student.id;

          initialAttendance[studentId] = {
            status: "Present",
            notes: "",
          };
        });

        setAttendance(initialAttendance);
      } catch (error) {
        console.error("Failed to load students:", error);

        setStudents([]);
        setAttendance({});

        setError(
          error.response?.data?.message ||
            "Failed to load students for this batch."
        );
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedBatch]);

  const updateStatus = (studentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: {
        ...previous[studentId],
        status,
      },
    }));
  };

  const updateNotes = (studentId, notes) => {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: {
        ...previous[studentId],
        notes,
      },
    }));
  };

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    Object.values(attendance).forEach((item) => {
      if (item.status === "Present") present++;
      if (item.status === "Absent") absent++;
      if (item.status === "Late") late++;
      if (item.status === "Excused") excused++;
    });

    return {
      present,
      absent,
      late,
      excused,
      total: students.length,
    };
  }, [attendance, students]);

  
  const handleSaveAttendance = async () => {
    if (!selectedBatch) {
      setError("Please select a batch.");
      return;
    }

    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    if (students.length === 0) {
      setError("There are no students in this batch.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      for (const student of students) {
        const studentId =
          student._id || student.id;

        const record = attendance[studentId];

        await apiClient.post("/attendance", {
          studentId,
          batchId: selectedBatch,
          sessionDate: selectedDate,
          status: record.status,
          notes: record.notes,
        });
      }

      setSuccess(
        "Attendance has been saved successfully."
      );
    } catch (error) {
      console.error("Failed to save attendance:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  const markEveryone = (status) => {
    const updated = {};

    students.forEach((student) => {
      const studentId =
        student._id || student.id;

      updated[studentId] = {
        ...attendance[studentId],
        status,
      };
    });

    setAttendance(updated);
  };

  return (
    <div className="bg-[#F7F5EF] min-h-full">

     
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071629]">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-[#52627A]">
          Take and manage attendance for students in each batch.
        </p>
      </div>

      
      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <div className="grid gap-5 md:grid-cols-2">

          {/* BATCH */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#071629]">
              Batch
            </label>

            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setSuccess("");
                setError("");
              }}
              className="w-full rounded-lg border border-[#D9D4C9] bg-white px-4 py-3 text-sm text-[#071629] outline-none transition focus:border-[#071629]"
            >
              <option value="">
                {loadingBatches
                  ? "Loading batches..."
                  : "Select a batch"}
              </option>

              {batches.map((batch) => (
                <option
                  key={batch._id || batch.id}
                  value={batch._id || batch.id}
                >
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

      
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#071629]">
              Attendance Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSuccess("");
                setError("");
              }}
              className="w-full rounded-lg border border-[#D9D4C9] bg-white px-4 py-3 text-sm text-[#071629] outline-none transition focus:border-[#071629]"
            />
          </div>

        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {success && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

    
      {selectedBatch && (
        <div className="mt-6">

          {/* SUMMARY */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <SummaryCard
              label="Total Students"
              value={summary.total}
              text="text-[#071629]"
            />

            <SummaryCard
              label="Present"
              value={summary.present}
              text="text-emerald-600"
            />

            <SummaryCard
              label="Late"
              value={summary.late}
              text="text-amber-600"
            />

            <SummaryCard
              label="Absent"
              value={summary.absent}
              text="text-rose-600"
            />

            <SummaryCard
              label="Excused"
              value={summary.excused}
              text="text-sky-600"
            />

          </div>

       
          <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        
            <div className="flex flex-col gap-4 border-b border-[#E5E0D5] p-5 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-[#071629]">
                  Student Attendance
                </h2>

                <p className="mt-1 text-xs text-[#8A96A8]">
                  {selectedDate}
                </p>
              </div>

              
              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    markEveryone("Present")
                  }
                  className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Mark All Present
                </button>

                <button
                  type="button"
                  onClick={() =>
                    markEveryone("Absent")
                  }
                  className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Mark All Absent
                </button>

              </div>
            </div>

            
            {loadingStudents ? (
              <div className="px-6 py-16 text-center text-sm text-[#52627A]">
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-[#52627A]">
                No students found in this batch.
              </div>
            ) : (
              <>
              
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[800px]">

                    <thead>
                      <tr className="border-b border-[#E5E0D5] bg-[#FAF9F5]">

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#52627A]">
                          Student
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#52627A]">
                          Status
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#52627A]">
                          Notes
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {students.map((student) => {
                        const studentId =
                          student._id || student.id;

                        const record =
                          attendance[studentId] || {
                            status: "Present",
                            notes: "",
                          };

                        return (
                          <tr
                            key={studentId}
                            className="border-b border-[#E5E0D5] last:border-b-0"
                          >

                            <td className="px-5 py-4">

                              <div className="font-semibold text-sm text-[#071629]">
                                {student.name ||
                                  student.fullName ||
                                  "Unknown Student"}
                              </div>

                              {student.email && (
                                <div className="mt-1 text-xs text-[#8A96A8]">
                                  {student.email}
                                </div>
                              )}

                            </td>

                            {/* STATUS */}
                            <td className="px-5 py-4">

                              <div className="flex flex-wrap gap-2">

                                {[
                                  "Present",
                                  "Absent",
                                  "Late",
                                  "Excused",
                                ].map((status) => {

                                  const active =
                                    record.status ===
                                    status;

                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      onClick={() =>
                                        updateStatus(
                                          studentId,
                                          status
                                        )
                                      }
                                      className={`
                                        rounded-lg
                                        border
                                        px-3
                                        py-2
                                        text-xs
                                        font-semibold
                                        transition
                                        ${
                                          active
                                            ? status ===
                                              "Present"
                                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                              : status ===
                                                "Absent"
                                              ? "border-rose-500 bg-rose-50 text-rose-700"
                                              : status ===
                                                "Late"
                                              ? "border-amber-500 bg-amber-50 text-amber-700"
                                              : "border-sky-500 bg-sky-50 text-sky-700"
                                            : "border-[#E5E0D5] bg-white text-[#52627A] hover:bg-[#F7F5EF]"
                                        }
                                      `}
                                    >
                                      {status}
                                    </button>
                                  );
                                })}

                              </div>

                            </td>

                         
                            <td className="px-5 py-4">

                              <input
                                type="text"
                                value={
                                  record.notes || ""
                                }
                                onChange={(e) =>
                                  updateNotes(
                                    studentId,
                                    e.target.value
                                  )
                                }
                                placeholder="Optional note"
                                className="w-full rounded-lg border border-[#E5E0D5] px-3 py-2 text-sm outline-none focus:border-[#071629]"
                              />

                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>

                
                <div className="flex justify-end border-t border-[#E5E0D5] p-5">

                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    disabled={saving}
                    className="rounded-lg bg-[#071629] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#10263D] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving Attendance..."
                      : "Save Attendance"}
                  </button>

                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}



function SummaryCard({
  label,
  value,
  text,
}) {
  return (
    <div className="rounded-xl border border-[#E5E0D5] bg-white p-5 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A96A8]">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${text}`}
      >
        {value}
      </p>

    </div>
  );
}

export default Attendance;