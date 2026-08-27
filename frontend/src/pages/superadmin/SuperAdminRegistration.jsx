import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

function SuperAdminRegistration() {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/registration-settings"
      );

      setRegistrationOpen(
        Boolean(response.data?.registrationOpen)
      );

      setOpensAt(
        formatDateTimeLocal(response.data?.opensAt)
      );

      setClosesAt(
        formatDateTimeLocal(response.data?.closesAt)
      );
    } catch (error) {
      console.error(
        "Failed to load registration settings:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load registration settings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const toggleRegistration = async () => {
    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const newStatus = !registrationOpen;

      const response = await apiClient.patch(
        "/registration-settings/toggle",
        {
          registrationOpen: newStatus,
        }
      );

      setRegistrationOpen(
        Boolean(response.data?.registrationOpen)
      );

      setMessage(
        response.data?.message ||
          "Registration status updated successfully"
      );
    } catch (error) {
      console.error(
        "Failed to update registration status:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update registration status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const savePeriod = async (event) => {
    event.preventDefault();

    try {
      setSavingPeriod(true);
      setError("");
      setMessage("");

      if (!opensAt || !closesAt) {
        setError(
          "Registration opening and closing dates are required."
        );
        return;
      }

      const openingDate = new Date(opensAt);
      const closingDate = new Date(closesAt);

      if (
        Number.isNaN(openingDate.getTime()) ||
        Number.isNaN(closingDate.getTime())
      ) {
        setError("Please enter valid dates.");
        return;
      }

      if (openingDate >= closingDate) {
        setError(
          "Registration opening time must be before closing time."
        );
        return;
      }

      const response = await apiClient.patch(
        "/registration-settings/period",
        {
          opensAt: openingDate.toISOString(),
          closesAt: closingDate.toISOString(),
        }
      );

      setRegistrationOpen(
        Boolean(response.data?.registrationOpen)
      );

      setOpensAt(
        formatDateTimeLocal(response.data?.opensAt)
      );

      setClosesAt(
        formatDateTimeLocal(response.data?.closesAt)
      );

      setMessage(
        response.data?.message ||
          "Registration period saved successfully"
      );
    } catch (error) {
      console.error(
        "Failed to save registration period:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save registration period"
      );
    } finally {
      setSavingPeriod(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            SYSTEM MANAGEMENT
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Registration
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Control whether students can submit new bootcamp
            applications.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex min-h-[250px] items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading registration settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          SYSTEM MANAGEMENT
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Registration
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Control whether students can submit new bootcamp
          applications.
        </p>
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

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Registration Status
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control when students can register for the
              bootcamp.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                registrationOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {registrationOpen
                ? "Open"
                : "Closed"}
            </span>

            <button
              type="button"
              onClick={toggleRegistration}
              disabled={updating}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
                registrationOpen
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {updating
                ? "Updating..."
                : registrationOpen
                ? "Close Registration"
                : "Open Registration"}
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={savePeriod}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Registration Period
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Set when registration opens and closes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="registration-opens"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Registration Opens
            </label>

            <input
              id="registration-opens"
              type="datetime-local"
              value={opensAt}
              onChange={(event) =>
                setOpensAt(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="registration-closes"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Registration Closes
            </label>

            <input
              id="registration-closes"
              type="datetime-local"
              value={closesAt}
              onChange={(event) =>
                setClosesAt(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={savingPeriod}
            className="rounded-lg bg-[#071629] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10263f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingPeriod
              ? "Saving..."
              : "Save Registration Period"}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
}

export default SuperAdminRegistration;