import { useEffect, useMemo, useState } from "react";
import {
  Send,
  Users,
  Check,
  Loader2,
  Megaphone,
  Trash2,
} from "lucide-react";

import apiClient from "../services/apiClient";
import { getCurrentUserId } from "../utils/authUser";

function MentorAnnouncements() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [announcements, setAnnouncements] =
    useState([]);

  const [selectedStudents, setSelectedStudents] =
    useState([]);

  const [selectedBatch, setSelectedBatch] =
    useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // GET CURRENT MENTOR ID
  // ============================================================

  const mentorId = getCurrentUserId();

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!mentorId) {
      setError(
        "Mentor ID not found. Please login again."
      );
      setLoading(false);
      return;
    }

    loadData();
  }, [mentorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        studentsResponse,
        batchesResponse,
        announcementsResponse,
      ] = await Promise.all([
        apiClient.get(
          "/announcements/mentor/students",
          {
            params: {
              mentorId,
            },
          }
        ),

        apiClient.get(
          "/announcements/mentor/batches",
          {
            params: {
              mentorId,
            },
          }
        ),

        apiClient.get(
          "/announcements/mentor",
          {
            params: {
              mentorId,
            },
          }
        ),
      ]);

      setStudents(
        studentsResponse.data?.students || []
      );

      setBatches(
        batchesResponse.data?.batches || []
      );

      setAnnouncements(
        announcementsResponse.data?.announcements ||
          []
      );
    } catch (err) {
      console.error(
        "Load announcements error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load announcement data"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SELECT STUDENT
  // ============================================================

  const toggleStudent = (studentId) => {
    setSelectedStudents((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter(
          (id) => id !== studentId
        );
      }

      return [...previous, studentId];
    });
  };

  // ============================================================
  // SELECT ALL
  // ============================================================

  const selectAllStudents = () => {
    setSelectedStudents(
      students.map((student) => student._id)
    );
  };

  // ============================================================
  // CLEAR
  // ============================================================

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const selectedCount =
    selectedStudents.length;

  // ============================================================
  // CAN SEND
  // ============================================================

  const canSend = useMemo(() => {
    return (
      title.trim() &&
      message.trim() &&
      (selectedCount > 0 || selectedBatch)
    );
  }, [
    title,
    message,
    selectedCount,
    selectedBatch,
  ]);


  // ============================================================
  // SEND
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!mentorId) {
      setError(
        "Mentor ID not found. Please login again."
      );
      return;
    }

    if (!canSend) {
      setError(
        "Enter a title, message and select at least one student or batch."
      );
      return;
    }

    try {
      setSending(true);
      setError("");
      setSuccess("");

      const response = await apiClient.post(
        "/announcements/mentor",
        {
          mentorId,

          title: title.trim(),

          message: message.trim(),

          type,

          studentIds: selectedStudents,

          batchId:
            selectedBatch || null,
        }
      );

      setSuccess(
        `Announcement sent to ${
          response.data?.recipientCount || 0
        } student${
          response.data?.recipientCount === 1
            ? ""
            : "s"
        }.`
      );

      setTitle("");
      setMessage("");
      setType("general");
      setSelectedStudents([]);
      setSelectedBatch("");

      await loadData();
    } catch (err) {
      console.error(
        "Send announcement error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to send announcement"
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id) => {
    if (!mentorId) {
      setError(
        "Mentor ID not found. Please login again."
      );
      return;
    }

    try {
      await apiClient.delete(
        `/announcements/mentor/${id}`,
        {
          data: {
            mentorId,
          },
        }
      );

      setAnnouncements((previous) =>
        previous.filter(
          (announcement) =>
            announcement._id !== id
        )
      );
    } catch (err) {
      console.error(
        "Delete announcement error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete announcement"
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2
          className="animate-spin text-slate-600 dark:text-slate-300"
          size={32}
        />
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}

        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#1f6f5b] p-3 text-white">
              <Megaphone size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Announcements
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Send announcements to your assigned students.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* CREATE */}


        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2">
            <Send size={19} />

            <h2 className="font-semibold text-slate-900 dark:text-white">
              New Announcement
            </h2>
          </div>

          {/* TITLE */}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Announcement title"
              className="w-full rounded-lg border border-slate-300 dark:border-[#15253f] px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {/* TYPE */}

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Type
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 dark:border-[#15253f] px-4 py-3 outline-none focus:border-slate-900"
            >
              <option value="general">
                General
              </option>

              <option value="assignment">
                Assignment
              </option>

              <option value="attendance">
                Attendance
              </option>

              <option value="progress">
                Progress
              </option>

              <option value="custom">
                Custom
              </option>
            </select>
          </div>

          {/* MESSAGE */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Message
            </label>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Write your announcement..."
              rows={5}
              className="w-full resize-none rounded-lg border border-slate-300 dark:border-[#15253f] px-4 py-3 outline-none focus:border-slate-900"
            />
          </div>

          {/* BATCH */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Send to batch
            </label>

            <select
              value={selectedBatch}
              onChange={(event) =>
                setSelectedBatch(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 dark:border-[#15253f] px-4 py-3 outline-none focus:border-slate-900"
            >
              <option value="">
                No batch selected
              </option>

              {batches.map((batch) => (
                <option
                  key={batch._id}
                  value={batch._id}
                >
                  {batch.name || batch.title}
                </option>
              ))}
            </select>
          </div>

          {/* STUDENTS */}

          <div className="rounded-xl border border-slate-200 dark:border-[#15253f]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#15253f] p-4">
              <div className="flex items-center gap-2">
                <Users size={19} />

                <span className="font-semibold">
                  Select Students
                </span>

                <span className="rounded-full bg-slate-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-semibold">
                  {selectedCount} selected
                </span>
              </div>


              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllStudents}
                  className="rounded-lg border border-slate-300 dark:border-[#15253f] px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:bg-[#070e1b]"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-lg border border-slate-300 dark:border-[#15253f] px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:bg-[#070e1b]"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-3">
              {students.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  You don't have any assigned students.
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => {
                    const selected =
                      selectedStudents.includes(
                        student._id
                      );

                    return (
                      <button
                        type="button"
                        key={student._id}
                        onClick={() =>
                          toggleStudent(
                            student._id
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {student.name}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {student.email}
                          </p>

                          {student.batch && (
                            <p className="mt-1 text-xs text-slate-400">
                              {student.batch.name ||
                                student.batch.title}
                            </p>
                          )}
                        </div>

                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                            selected
                              ? "border-slate-900 bg-[#1f6f5b] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && (
                            <Check size={15} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SELECTED COUNT */}

          <div className="mt-5 rounded-lg bg-slate-100 dark:bg-[#070e1b] p-4 text-sm text-slate-700 dark:text-slate-200">
            <strong>{selectedCount}</strong>{" "}
            student
            {selectedCount === 1
              ? ""
              : "s"} selected

            {selectedBatch && (
              <>
                {" "}
                + selected batch
              </>
            )}
          </div>

          {/* SEND */}


          <button
            type="submit"
            disabled={!canSend || sending}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1f6f5b] px-4 py-3 font-semibold text-white transition hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Announcement
              </>
            )}
          </button>
        </form>

        {/* HISTORY */}

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
            Sent Announcements
          </h2>

          {announcements.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No announcements sent yet.
            </p>
          ) : (
            <div className="space-y-4">
              {announcements.map(
                (announcement) => (
                  <div
                    key={announcement._id}
                    className="rounded-xl border border-slate-200 dark:border-[#15253f] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {announcement.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {announcement.message}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            announcement._id
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        aria-label="Delete announcement"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                      Sent to{" "}
                      <strong>
                        {announcement.recipients
                          ?.length || 0}
                      </strong>{" "}
                      student
                      {announcement.recipients
                        ?.length === 1
                        ? ""
                        : "s"}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorAnnouncements;
