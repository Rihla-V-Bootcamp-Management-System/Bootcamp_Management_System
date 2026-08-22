import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";

function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
    deadline: "",
    batchId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [assignmentRes, batchRes] =
        await Promise.all([
          apiClient.get("/assignments"),
          apiClient.get("/batches"),
        ]);

      setAssignments(
        assignmentRes.data.assignments || []
      );

      setBatches(batchRes.data.batches || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createAssignment = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!form.course.trim()) {
      setError("Course / Phase is required");
      return;
    }

    if (!form.deadline) {
      setError("Deadline is required");
      return;
    }

    if (!form.batchId) {
      setError("Batch is required");
      return;
    }

    try {
      setSaving(true);

      const response = await apiClient.post(
        "/assignments",
        {
          title: form.title.trim(),
          description: form.description.trim(),
          course: form.course.trim(),
          deadline: form.deadline,
          batchId: form.batchId,
        }
      );

      setAssignments((prev) => [
        response.data.assignment,
        ...prev,
      ]);

      setSuccess(
        "Assignment created successfully."
      );

      setForm({
        title: "",
        description: "",
        course: "",
        deadline: "",
        batchId: "",
      });

      setShowForm(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create assignment"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAssignment = async (id) => {
    const confirmed = window.confirm(
      "Delete this assignment?"
    );

    if (!confirmed) return;

    try {
      await apiClient.delete(`/assignments/${id}`);

      setAssignments((prev) =>
        prev.filter(
          (assignment) =>
            assignment._id !== id
        )
      );

      setSuccess(
        "Assignment deleted successfully."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete assignment"
      );
    }
  };

  const getBatchName = (assignment) => {
    if (assignment.batchId?.name) {
      return assignment.batchId.name;
    }

    const batch = batches.find(
      (item) =>
        item._id === assignment.batchId
    );

    return batch?.name || "Unknown Batch";
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center px-8">
        <h1 className="text-[22px] font-bold text-[#0f1b3d]">
          ASTU MSJ
        </h1>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0f1b3d]">
              Assignments
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Create and manage assignments for students.
            </p>
          </div>

          <button
            onClick={() =>
              setShowForm(!showForm)
            }
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Assignment
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {showForm && (
          <section className="bg-white rounded-xl p-6 md:p-8 shadow-[0_4px_15px_rgba(0,0,0,0.08)] mb-8">
            <h3 className="text-xl font-bold text-[#0f1b3d] mb-6">
              Create Assignment
            </h3>

            <form
              onSubmit={createAssignment}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Build a Personal Portfolio"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Course / Phase
                </label>

                <input
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="React"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the assignment..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Deadline
                </label>

                <input
                  type="datetime-local"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Assigned Batch
                </label>

                <select
                  name="batchId"
                  value={form.batchId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select Batch
                  </option>

                  {batches.map((batch) => (
                    <option
                      key={batch._id}
                      value={batch._id}
                    >
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-lg border border-blue-600 px-6 py-3 text-sm font-medium text-blue-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? "Creating..."
                    : "Create Assignment"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-[#0f1b3d]">
              All Assignments
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {assignments.length} assignments
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No assignments created yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500">
                      TITLE
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500">
                      COURSE
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500">
                      BATCH
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500">
                      DEADLINE
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-500">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map(
                    (assignment) => (
                      <tr
                        key={assignment._id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-sm">
                            {assignment.title}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {assignment.description}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {assignment.course}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {getBatchName(
                            assignment
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {assignment.deadline
                            ? new Date(
                                assignment.deadline
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              deleteAssignment(
                                assignment._id
                              )
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminAssignments;