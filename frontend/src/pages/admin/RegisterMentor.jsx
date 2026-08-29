import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import {
  UserPlus,
  Mail,
  Phone,
  Send,
  Eye,
  X,
  Users,
  RefreshCw,
} from "lucide-react";

function RegisterMentor() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    telegramUsername: "",
    batchId: "",
  });

  const [mentors, setMentors] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // =====================================================
  // LOAD DATA (MENTORS & BATCHES)
  // =====================================================

  const loadData = async () => {
    try {
      setLoadingMentors(true);
      setError("");

      const [mentorsRes, batchesRes] = await Promise.all([
        apiClient.get("/mentors/mentors"),
        apiClient.get("/batches"),
      ]);

      setMentors(mentorsRes.data.mentors || []);
      setBatches(batchesRes.data.batches || []);
    } catch (error) {
      console.error("LOAD DATA ERROR:", error);
      setError(
        error.response?.data?.message || "Failed to load mentors and batches."
      );
    } finally {
      setLoadingMentors(false);
    }
  };

  const loadMentors = async () => {
    try {
      const response = await apiClient.get("/mentors/mentors");
      setMentors(response.data.mentors || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // REGISTER MENTOR
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.telegramUsername.trim()
    ) {
      setError("Please fill in all mentor information.");
      return;
    }

    if (!formData.batchId) {
      setError("Please select a batch assignment for the mentor.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post("/mentors/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        telegramUsername: formData.telegramUsername.trim(),
        batchId: formData.batchId,
      });

      setMessage(
        response.data.message || "Mentor registered successfully."
      );

      // CLEAR FORM
      setFormData({
        name: "",
        email: "",
        phone: "",
        telegramUsername: "",
        batchId: "",
      });

      await loadMentors();
    } catch (error) {
      console.error("MENTOR REGISTRATION ERROR:", error);
      setError(
        error.response?.data?.message || "Failed to register mentor."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VIEW MENTOR DETAILS
  // =====================================================

  const handleViewMentor = async (mentorId) => {
    try {
      setLoadingDetails(true);
      setError("");

      const response = await apiClient.get(`/mentors/${mentorId}`);


      console.log(
        "MENTOR DETAILS RESPONSE:",
        response.data
      );

      setSelectedMentor(response.data);
    } catch (error) {
      console.error(
        "LOAD MENTOR DETAILS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load mentor details."
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] dark:bg-[#070e1b] p-6">

      <div className="mx-auto max-w-7xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Mentor Registration
              </h1>

              <p className="mt-2 text-gray-500 dark:text-slate-400">
                Register mentors and manage their
                information.
              </p>
            </div>

            <button
              onClick={loadMentors}
              disabled={loadingMentors}
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-[#15253f] bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 transition hover:bg-slate-50 dark:bg-[#070e1b]"
            >
              <RefreshCw
                size={17}
                className={
                  loadingMentors
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* MESSAGES */}
        {/* ================================================= */}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* REGISTER FORM */}
        {/* ================================================= */}

        <div className="mb-10 rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-8 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e5f1ed] text-[#1f6f5b]">
              <UserPlus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Add New Mentor
              </h2>

              <p className="text-sm text-gray-500 dark:text-slate-400">
                Enter the mentor's contact information.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Full Name
                </label>

                <div className="relative">

                  <UserPlus
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter mentor name"
                    className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-lg border border-gray-300 dark:border-[#15253f] py-3 pl-10 pr-4 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
                  />

                </div>
              </div>

              {/* EMAIL */}


              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="mentor@example.com"
                    className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-lg border border-gray-300 dark:border-[#15253f] py-3 pl-10 pr-4 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
                  />

                </div>
              </div>

              {/* PHONE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Phone Number
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+251 9XX XXX XXX"
                    className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-lg border border-gray-300 dark:border-[#15253f] py-3 pl-10 pr-4 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
                  />

                </div>
              </div>

              {/* TELEGRAM */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Telegram Username
                </label>

                <div className="relative">

                  <Send
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="telegramUsername"
                    value={formData.telegramUsername}
                    onChange={handleChange}
                    placeholder="@username"
                    className="dark:bg-[#070e1b] dark:text-white dark:border-[#15253f] w-full rounded-lg border border-gray-300 dark:border-[#15253f] py-3 pl-10 pr-4 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed]"
                  />

                </div>

              </div>

              {/* BATCH ASSIGNMENT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Assign to Batch <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] py-3 px-4 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#e5f1ed] bg-white dark:bg-[#0b1528]"
                  >
                    <option value="">-- Select Assigned Batch --</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name} {batch.startDate ? `(Starts: ${new Date(batch.startDate).toLocaleDateString()})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* BUTTON */}

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[#1f6f5b] px-6 py-3 font-semibold text-white transition hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={18} />

                {loading
                  ? "Registering..."
                  : "Register Mentor"}
              </button>

            </div>

          </form>

        </div>

        {/* ================================================= */}
        {/* REGISTERED MENTORS */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#15253f] px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e5f1ed] text-[#1f6f5b]">
                <Users size={20} />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Registered Mentors
                </h2>


                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {mentors.length} mentor
                  {mentors.length !== 1
                    ? "s"
                    : ""}{" "}
                  registered
                </p>

              </div>

            </div>

          </div>

          {/* TABLE */}

          {loadingMentors ? (

            <div className="flex items-center justify-center py-16 text-gray-500 dark:text-slate-400">
              <RefreshCw
                size={20}
                className="mr-2 animate-spin"
              />
              Loading mentors...
            </div>

          ) : mentors.length === 0 ? (

            <div className="py-16 text-center">

              <Users
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />

              <p className="font-medium text-gray-700 dark:text-slate-200">
                No mentors registered yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Register your first mentor above.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 dark:bg-[#070e1b]">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Mentor
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Telegram
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-[#15253f]">

                  {mentors.map((mentor) => (

                    <tr
                      key={mentor._id}
                      className="transition hover:bg-slate-50 dark:bg-[#070e1b]"
                    >

                      {/* NAME */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-[#185848]">
                            {mentor.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>

                            <p className="font-medium text-slate-900 dark:text-white">
                              {mentor.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              Mentor
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {mentor.email}
                      </td>

                      {/* PHONE */}

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {mentor.phone || "Not provided"}
                      </td>

                      {/* TELEGRAM */}

                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300">
                        {mentor.telegramUsername ||
                          "Not provided"}
                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4 text-right">


                        <button
                          onClick={() =>
                            handleViewMentor(
                              mentor._id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 transition hover:border-blue-300 hover:bg-[#e5f1ed] hover:text-[#1f6f5b]"
                        >
                          <Eye size={16} />
                          View Details
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* DETAILS MODAL */}
      {/* ================================================= */}

      {selectedMentor && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white dark:bg-[#0b1528] shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#15253f] px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Mentor Details
                </h2>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Registered mentor information
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedMentor(null)
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 dark:bg-[#070e1b] hover:text-gray-700 dark:text-slate-200"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL BODY */}

            {loadingDetails ? (

              <div className="flex justify-center py-16">

                <RefreshCw
                  size={24}
                  className="animate-spin text-[#1f6f5b]"
                />

              </div>

            ) : (

              <div className="p-6">

                {/* PROFILE */}

                <div className="mb-6 flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-[#070e1b] p-5">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-[#185848]">

                    {selectedMentor.mentor?.name
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedMentor.mentor?.name}
                    </h3>

                    <p className="text-sm text-[#1f6f5b]">
                      Mentor
                    </p>

                  </div>

                </div>

                {/* INFORMATION */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div className="rounded-xl border border-gray-200 dark:border-[#15253f] p-4">

                    <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                      Email
                    </p>

                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                      {selectedMentor.mentor?.email ||
                        "Not provided"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-[#15253f] p-4">

                    <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                      Phone
                    </p>

                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                      {selectedMentor.mentor?.phone ||
                        "Not provided"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-[#15253f] p-4">


                    <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                      Telegram
                    </p>

                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                      {selectedMentor.mentor
                        ?.telegramUsername ||
                        "Not provided"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-[#15253f] p-4">

                    <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                      Batch
                    </p>

                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                      {selectedMentor.mentor
                        ?.batchId?.name ||
                        "Not assigned"}
                    </p>

                  </div>

                </div>

                {/* ASSIGNED STUDENTS */}

                <div className="mt-8">

                  <div className="mb-4 flex items-center justify-between">

                    <div>

                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Assigned Students
                      </h3>

                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Students currently assigned
                        to this mentor
                      </p>

                    </div>

                    <span className="rounded-full bg-[#e5f1ed] px-3 py-1 text-sm font-semibold text-[#1f6f5b]">
                      {
                        selectedMentor
                          .totalAssignedStudents
                      }{" "}
                      students
                    </span>

                  </div>

                  {selectedMentor.assignedStudents
                    ?.length === 0 ? (

                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-[#15253f] py-10 text-center">

                      <Users
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />

                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        No students assigned yet.
                      </p>

                    </div>

                  ) : (

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#15253f]">

                      <table className="w-full">

                        <thead className="bg-slate-50 dark:bg-[#070e1b]">

                          <tr>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                              Student
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                              Email
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                              Batch
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-[#15253f]">

                          {selectedMentor.assignedStudents.map(
                            (student) => (

                              <tr
                                key={student._id}
                              >

                                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-slate-100">
                                  {student.name}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">
                                  {student.email}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">
                                  {student.batchId
                                    ?.name ||
                                    "Not assigned"}
                                </td>

                              </tr>


                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default RegisterMentor;