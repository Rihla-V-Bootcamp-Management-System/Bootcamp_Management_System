import { useEffect, useState } from "react";
import {
  Check,
  X,
  Clock,
  RefreshCw,
  UserCheck,
  AlertCircle,
} from "lucide-react";

import apiClient from "../../services/apiClient";

const STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Late",
  "Excused",
];

function Attendance() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] =
    useState({});

  const [selectedBatch, setSelectedBatch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [excuseStudent, setExcuseStudent] =
    useState(null);

  const [excuseReason, setExcuseReason] =
    useState("");

  // =========================================================
  // LOAD BATCHES
  // =========================================================

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiClient.get("/batches");

      const data =
        response.data?.batches ||
        response.data?.data ||
        response.data ||
        [];

      setBatches(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD BATCHES ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load batches."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  const loadStudents = async () => {
    if (!selectedBatch) {
      setStudents([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await apiClient.get(
          `/batches/${selectedBatch}/students`
        );

      const data =
        response.data?.students ||
        response.data?.data ||
        response.data ||
        [];

      setStudents(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD STUDENTS ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load students."
      );

      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD EXISTING ATTENDANCE
  // =========================================================

  const loadAttendance = async () => {
    if (!selectedBatch) {
      setAttendance({});
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await apiClient.get(
          `/attendance?batchId=${selectedBatch}`
        );

      const records =
        response.data?.attendance ||
        response.data?.records ||
        response.data?.data ||
        [];

      const map = {};

      records.forEach((record) => {
        const studentId =
          typeof record.studentId === "object"
            ? record.studentId._id
            : record.studentId;

        if (!studentId) {
          return;
        }

        map[String(studentId)] =
          record;
      });

      setAttendance(map);
    } catch (err) {
      console.error(
        "LOAD ATTENDANCE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadBatches();
  }, []);

  // =========================================================
  // BATCH CHANGE
  // =========================================================

  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      setAttendance({});
      return;
    }

    loadStudents();
    loadAttendance();
  }, [selectedBatch]);

  // =========================================================
  // STATUS CHANGE
  // =========================================================

  const handleStatusChange = async (
    studentId,
    status
  ) => {
    setError("");
    setSuccess("");

    const existing =
      attendance[String(studentId)];

    // No existing record:
    // status cannot be manually created here
    // because the new system uses time tracking.
    if (!existing?._id) {
      setError(
        "This student has no attendance record yet. Use check-in/check-out or approve an excuse."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await apiClient.put(
          `/attendance/${existing._id}`,
          {
            status,
          }
        );

      setAttendance((prev) => ({
        ...prev,

        [String(studentId)]:
          response.data?.attendance ||
          {
            ...existing,
            status,
          },
      }));

      setSuccess(
        "Attendance status updated."
      );
    } catch (err) {
      console.error(
        "UPDATE STATUS ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update status."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EXCUSE
  // =========================================================

  const handleExcuse = async () => {
    if (!excuseStudent) {
      return;
    }

    if (!excuseReason.trim()) {
      setError(
        "Please provide an excuse reason."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const studentId =
        excuseStudent._id ||
        excuseStudent.id;

      const response =
        await apiClient.post(
          "/attendance/excuse",
          {
            studentId,
            batchId: selectedBatch,
            reason:
              excuseReason.trim(),
          }
        );

      const record =
        response.data?.attendance;

      setAttendance((prev) => ({
        ...prev,
        [String(studentId)]:
          record,
      }));

      setExcuseStudent(null);
      setExcuseReason("");

      setSuccess(
        "Student marked as excused."
      );
    } catch (err) {
      console.error(
        "EXCUSE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to excuse attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getStudentId = (student) =>
    student?._id || student?.id;

  const getStudentName = (student) => {
    if (student?.name) {
      return student.name;
    }

    return [
      student?.firstName,
      student?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Unknown Student";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-50 text-green-700 border-green-200";

      case "Absent":
        return "bg-red-50 text-red-700 border-red-200";

      case "Late":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "Excused":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}

      <div>
        <div className="flex items-center gap-3">
          <UserCheck
            size={30}
            className="text-blue-600"
          />

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Attendance Tracker
            </h1>

            <p className="text-sm text-gray-500">
              Attendance is automatically calculated
              from student check-in and check-out time.
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      {/* BATCH */}

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Batch
        </label>

        <select
          value={selectedBatch}
          onChange={(e) =>
            setSelectedBatch(e.target.value)
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="">
            Select a batch
          </option>

          {batches.map((batch) => (
            <option
              key={batch._id}
              value={batch._id}
            >
              {batch.name ||
                batch.batchName ||
                batch.title ||
                "Unnamed Batch"}
            </option>
          ))}
        </select>
      </div>

      {/* SESSION INFORMATION */}

      {selectedBatch && (
        <div className="grid gap-4 md:grid-cols-4">

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Week
            </p>

            <p className="mt-1 text-xl font-bold">
              Automatically tracked
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Session date
            </p>

            <p className="mt-1 text-xl font-bold">
              Automatically tracked
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Session
            </p>

            <p className="mt-1 text-xl font-bold">
              09:00 - 13:00
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Students
            </p>

            <p className="mt-1 text-xl font-bold">
              {students.length}
            </p>
          </div>

        </div>
      )}

      {/* STUDENTS */}

      {selectedBatch && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          <div className="flex items-center justify-between border-b p-5">

            <div>
              <h2 className="font-semibold text-gray-900">
                Student Attendance
              </h2>

              <p className="text-sm text-gray-500">
                Time determines Present/Late/Absent.
                Excused has no time interval.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                loadStudents();
                loadAttendance();
              }}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>

          {loading ? (
            <div className="p-10 text-center">
              Loading...
            </div>
          ) : students.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left">
                      Check In
                    </th>

                    <th className="px-5 py-4 text-left">
                      Check Out
                    </th>

                    <th className="px-5 py-4 text-left">
                      Time
                    </th>

                    <th className="px-5 py-4 text-left">
                      Percentage
                    </th>

                    <th className="px-5 py-4 text-left">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {students.map((student) => {
                    const studentId =
                      getStudentId(student);

                    const record =
                      attendance[
                        String(studentId)
                      ];

                    return (
                      <tr
                        key={studentId}
                        className="border-t"
                      >

                        <td className="px-5 py-4 font-medium">
                          {getStudentName(student)}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {student.email || "-"}
                        </td>

                        <td className="px-5 py-4">
                          {record?.checkInTime
                            ? new Date(
                                record.checkInTime
                              ).toLocaleTimeString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          {record?.checkOutTime
                            ? new Date(
                                record.checkOutTime
                              ).toLocaleTimeString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          {record?.attendedMinutes
                            ? `${record.attendedMinutes} min`
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          {record
                            ? `${record.attendancePercentage || 0}%`
                            : "-"}
                        </td>

                        <td className="px-5 py-4">

                          <select
                            value={
                              record?.status ||
                              "Absent"
                            }
                            disabled={
                              saving ||
                              !record?._id
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                studentId,
                                e.target.value
                              )
                            }
                            className={`rounded-lg border px-3 py-2 text-sm font-medium ${getStatusClass(
                              record?.status
                            )}`}
                          >
                            {STATUS_OPTIONS.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              )
                            )}
                          </select>

                        </td>

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() => {
                              setExcuseStudent(
                                student
                              );
                              setExcuseReason("");
                            }}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            Excuse
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

      {/* EXCUSE MODAL */}

      {excuseStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h2 className="text-lg font-bold">
              Approve Excuse
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {getStudentName(excuseStudent)}
            </p>

            <textarea
              value={excuseReason}
              onChange={(e) =>
                setExcuseReason(
                  e.target.value
                )
              }
              placeholder="Enter the reason for the excuse..."
              className="mt-4 min-h-32 w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            />

            <div className="mt-5 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setExcuseStudent(null);
                  setExcuseReason("");
                }}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleExcuse}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              >
                Approve Excuse
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Attendance;