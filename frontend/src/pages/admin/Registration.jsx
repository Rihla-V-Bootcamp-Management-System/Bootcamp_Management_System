import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

function Registration() {
  const [settings, setSettings] = useState({
    registrationOpen: false,
    opensAt: null,
    closesAt: null,
  });

  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");

  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] =
    useState(true);

  const [savingPeriod, setSavingPeriod] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formatDateTimeForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();

    const month = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsedDate.getDate()
    ).padStart(2, "0");

    const hours = String(
      parsedDate.getHours()
    ).padStart(2, "0");

    const minutes = String(
      parsedDate.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/registration-settings"
      );

      const data = response.data;

      setSettings({
        registrationOpen:
          data.registrationOpen,

        opensAt:
          data.opensAt,

        closesAt:
          data.closesAt,
      });

      setOpensAt(
        formatDateTimeForInput(
          data.opensAt
        )
      );

      setClosesAt(
        formatDateTimeForInput(
          data.closesAt
        )
      );
    } catch (err) {
      console.error(
        "FETCH REGISTRATION SETTINGS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load registration settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoadingRegistrations(true);

      const response = await apiClient.get(
        "/registrations"
      );

      console.log(
        "REGISTRATIONS RESPONSE:",
        response.data
      );

      const data =
        response.data?.registrations ||
        response.data ||
        [];

      setRegistrations(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "FETCH REGISTRATIONS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load registrations."
      );

      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchRegistrations();
  }, []);

  const handleSavePeriod = async () => {
    setMessage("");
    setError("");

    if (!opensAt || !closesAt) {
      setError(
        "Please select both opening and closing dates."
      );

      return;
    }

    const openingDate = new Date(opensAt);
    const closingDate = new Date(closesAt);

    if (
      Number.isNaN(
        openingDate.getTime()
      ) ||
      Number.isNaN(
        closingDate.getTime()
      )
    ) {
      setError(
        "Please select valid dates."
      );

      return;
    }

    if (openingDate >= closingDate) {
      setError(
        "Opening time must be before closing time."
      );

      return;
    }

    try {
      setSavingPeriod(true);

      const response =
        await apiClient.patch(
          "/registration-settings/period",
          {
            opensAt:
              openingDate.toISOString(),

            closesAt:
              closingDate.toISOString(),
          }
        );

      setSettings((previous) => ({
        ...previous,

        opensAt:
          response.data.opensAt,

        closesAt:
          response.data.closesAt,
      }));

      setMessage(
        "Registration period saved successfully."
      );
    } catch (err) {
      console.error(
        "SAVE PERIOD ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save registration period."
      );
    } finally {
      setSavingPeriod(false);
    }
  };

  const handleToggleRegistration =
    async () => {
      try {
        setToggling(true);
        setMessage("");
        setError("");

        const newStatus =
          !settings.registrationOpen;

        const response =
          await apiClient.patch(
            "/registration-settings/toggle",
            {
              registrationOpen:
                newStatus,
            }
          );

        setSettings((previous) => ({
          ...previous,

          registrationOpen:
            response.data
              .registrationOpen,
        }));

        setMessage(
          newStatus
            ? "Registration opened successfully."
            : "Registration closed successfully."
        );
      } catch (err) {
        console.error(
          "TOGGLE REGISTRATION ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to update registration status."
        );
      } finally {
        setToggling(false);
      }
    };

  const handleStatusChange = async (
    registrationId,
    status
  ) => {
    try {
      setUpdatingStatus(
        registrationId
      );

      setMessage("");
      setError("");

      console.log(
        "UPDATING REGISTRATION:",
        registrationId
      );

      console.log(
        "NEW STATUS:",
        status
      );

      const response =
        await apiClient.patch(
          `/registrations/${registrationId}/status`,
          {
            status,
          }
        );

      console.log(
        "STATUS UPDATE RESPONSE:",
        response.data
      );

      setMessage(
        response.data?.message ||
          `Registration changed to ${status}.`
      );

      await fetchRegistrations();
    } catch (err) {
      console.error(
        "STATUS UPDATE ERROR:",
        err
      );

      console.error(
        "BACKEND STATUS:",
        err.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to update registration status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-slate-100 text-slate-700";

      case "SHORTLISTED":
        return "bg-blue-100 text-blue-700";

      case "INTERVIEWED":
        return "bg-purple-100 text-purple-700";

      case "ACCEPTED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading registration settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Registration Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage registration and review student applications.
          </p>
        </div>

        <Link
          to="/admin/form-builder"
          className="inline-flex items-center justify-center rounded-lg bg-[#071629] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#10233b]"
        >
          Application Form Builder
        </Link>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registration Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Control when students can register.
            </p>
          </div>

          <div className="flex items-center gap-4">

            {settings.registrationOpen ? (
              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                Open
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
                Closed
              </span>
            )}

            <button
              type="button"
              onClick={
                handleToggleRegistration
              }
              disabled={toggling}
              className={`rounded-lg px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                settings.registrationOpen
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#071629] hover:bg-[#10233b]"
              }`}
            >
              {toggling
                ? "Updating..."
                : settings.registrationOpen
                ? "Close Registration"
                : "Open Registration"}
            </button>

          </div>

        </div>

      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900">
          Registration Period
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Set when registration opens and closes.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Registration Opens
            </label>

            <input
              type="datetime-local"
              value={opensAt}
              onChange={(e) =>
                setOpensAt(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Registration Closes
            </label>

            <input
              type="datetime-local"
              value={closesAt}
              onChange={(e) =>
                setClosesAt(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end">

          <button
            type="button"
            onClick={
              handleSavePeriod
            }
            disabled={savingPeriod}
            className="rounded-lg bg-[#071629] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#10233b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingPeriod
              ? "Saving..."
              : "Save Registration Period"}
          </button>

        </div>

      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Student Applications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review applicants and update their status.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {registrations.length} Applications
          </div>

        </div>

        {loadingRegistrations ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">
              Loading applications...
            </p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              No applications found.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">

            {registrations.map(
              (registration) => (

                <div
                  key={
                    registration._id
                  }
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div>

                      <h3 className="text-lg font-semibold text-slate-900">
                        {
                          registration.fullName
                        }
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          registration.email
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          registration.phoneNumber
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Student ID:{" "}
                        {
                          registration.studentId
                        }
                      </p>

                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusClass(
                        registration.status
                      )}`}
                    >
                      {
                        registration.status
                      }
                    </span>

                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Gender
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {
                          registration.gender
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Education
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {
                          registration.educationInstitution
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Field
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {
                          registration.fieldOfStudy
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Programming
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {
                          registration.programmingExperience
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Hours / Week
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {
                          registration.hoursPerWeek
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase text-slate-400">
                        Telegram
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {
                          registration.telegramUsername
                        }
                      </p>
                    </div>

                  </div>

                  {registration.motivation && (
                    <div className="mt-5 border-t border-slate-100 pt-5">

                      <p className="text-xs font-medium uppercase text-slate-400">
                        Motivation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {
                          registration.motivation
                        }
                      </p>

                    </div>
                  )}

                  {registration.rejectionReason && (
                    <div className="mt-5 rounded-lg bg-red-50 p-4">

                      <p className="text-xs font-semibold uppercase text-red-600">
                        Rejection Reason
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        {
                          registration.rejectionReason
                        }
                      </p>

                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">

                    {registration.status ===
                      "SUBMITTED" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            updatingStatus ===
                            registration._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              registration._id,
                              "SHORTLISTED"
                            )
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingStatus ===
                          registration._id
                            ? "Updating..."
                            : "Shortlist"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingStatus ===
                            registration._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              registration._id,
                              "REJECTED"
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {registration.status ===
                      "SHORTLISTED" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            updatingStatus ===
                            registration._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              registration._id,
                              "INTERVIEWED"
                            )
                          }
                          className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingStatus ===
                          registration._id
                            ? "Updating..."
                            : "Mark Interviewed"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingStatus ===
                            registration._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              registration._id,
                              "REJECTED"
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {registration.status ===
                      "INTERVIEWED" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            updatingStatus ===
                            registration._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              registration._id,
                              "ACCEPTED"
                            )
                          }
                          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingStatus ===
                          registration._id
                            ? "Accepting..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            updatingStatus ===
                            registration._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              registration._id,
                              "REJECTED"
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {registration.status ===
                      "ACCEPTED" && (
                      <span className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                        Student Accepted
                      </span>
                    )}

                    {registration.status ===
                      "REJECTED" && (
                      <span className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                        Application Rejected
                      </span>
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}
      </div>

    </div>
  );
}

export default Registration;