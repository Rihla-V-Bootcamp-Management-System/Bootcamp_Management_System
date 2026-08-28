import { useEffect, useState } from "react";
import axios from "axios";
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
  });

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMentors, setLoadingMentors] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken")
    );
  };

  // =====================================================
  // LOAD REGISTERED MENTORS
  // =====================================================

  const loadMentors = async () => {
    try {
      setLoadingMentors(true);
      setError("");

      const token = getToken();

      const response = await axios.get(
        "http://localhost:5000/api/mentors/mentors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "REGISTERED MENTORS RESPONSE:",
        response.data
      );

      setMentors(response.data.mentors || []);
    } catch (error) {
      console.error(
        "LOAD MENTORS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load registered mentors."
      );
    } finally {
      setLoadingMentors(false);
    }
  };

  // =====================================================
  // LOAD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    loadMentors();
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
      setError(
        "Please fill in all mentor information."
      );
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      const response = await axios.post(
        "http://localhost:5000/api/mentors/register",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          telegramUsername:
            formData.telegramUsername.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "MENTOR REGISTER RESPONSE:",
        response.data
      );

      setMessage(
        response.data.message ||
          "Mentor registered successfully."
      );

      // ---------------------------------------------------
      // CLEAR FORM
      // ---------------------------------------------------

      setFormData({
        name: "",
        email: "",
        phone: "",
        telegramUsername: "",
      });

      // ---------------------------------------------------
      // REFRESH MENTOR LIST
      // ---------------------------------------------------

      await loadMentors();
    } catch (error) {
      console.error(
        "MENTOR REGISTRATION ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to register mentor."
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

      const token = getToken();

      const response = await axios.get(
        `http://localhost:5000/api/mentors/${mentorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-7xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mentor Registration
              </h1>

              <p className="mt-2 text-gray-500">
                Register mentors and manage their
                information.
              </p>
            </div>

            <button
              onClick={loadMentors}
              disabled={loadingMentors}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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

        <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserPlus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Mentor
              </h2>

              <p className="text-sm text-gray-500">
                Enter the mentor's contact information.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>
              </div>

              {/* PHONE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>
              </div>

              {/* TELEGRAM */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

            </div>

            {/* BUTTON */}

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users size={20} />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Registered Mentors
                </h2>

                <p className="text-sm text-gray-500">
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

            <div className="flex items-center justify-center py-16 text-gray-500">
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

              <p className="font-medium text-gray-700">
                No mentors registered yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Register your first mentor above.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Mentor
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Telegram
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {mentors.map((mentor) => (

                    <tr
                      key={mentor._id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* NAME */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                            {mentor.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>

                            <p className="font-medium text-gray-900">
                              {mentor.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              Mentor
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {mentor.email}
                      </td>

                      {/* PHONE */}

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {mentor.phone || "Not provided"}
                      </td>

                      {/* TELEGRAM */}

                      <td className="px-6 py-4 text-sm text-gray-600">
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
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
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

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Mentor Details
                </h2>

                <p className="text-sm text-gray-500">
                  Registered mentor information
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedMentor(null)
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL BODY */}

            {loadingDetails ? (

              <div className="flex justify-center py-16">

                <RefreshCw
                  size={24}
                  className="animate-spin text-blue-600"
                />

              </div>

            ) : (

              <div className="p-6">

                {/* PROFILE */}

                <div className="mb-6 flex items-center gap-4 rounded-xl bg-gray-50 p-5">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">

                    {selectedMentor.mentor?.name
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedMentor.mentor?.name}
                    </h3>

                    <p className="text-sm text-blue-600">
                      Mentor
                    </p>

                  </div>

                </div>

                {/* INFORMATION */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div className="rounded-xl border border-gray-200 p-4">

                    <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                      Email
                    </p>

                    <p className="text-sm font-medium text-gray-800">
                      {selectedMentor.mentor?.email ||
                        "Not provided"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">

                    <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                      Phone
                    </p>

                    <p className="text-sm font-medium text-gray-800">
                      {selectedMentor.mentor?.phone ||
                        "Not provided"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">

                    <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                      Telegram
                    </p>

                    <p className="text-sm font-medium text-gray-800">
                      {selectedMentor.mentor
                        ?.telegramUsername ||
                        "Not provided"}
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">

                    <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                      Batch
                    </p>

                    <p className="text-sm font-medium text-gray-800">
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

                      <h3 className="font-semibold text-gray-900">
                        Assigned Students
                      </h3>

                      <p className="text-sm text-gray-500">
                        Students currently assigned
                        to this mentor
                      </p>

                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                      {
                        selectedMentor
                          .totalAssignedStudents
                      }{" "}
                      students
                    </span>

                  </div>

                  {selectedMentor.assignedStudents
                    ?.length === 0 ? (

                    <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center">

                      <Users
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />

                      <p className="text-sm text-gray-500">
                        No students assigned yet.
                      </p>

                    </div>

                  ) : (

                    <div className="overflow-hidden rounded-xl border border-gray-200">

                      <table className="w-full">

                        <thead className="bg-gray-50">

                          <tr>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                              Student
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                              Email
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                              Batch
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                          {selectedMentor.assignedStudents.map(
                            (student) => (

                              <tr
                                key={student._id}
                              >

                                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                  {student.name}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {student.email}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-600">
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