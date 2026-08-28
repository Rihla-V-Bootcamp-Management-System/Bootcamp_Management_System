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

  // =====================================================
  // LOAD REGISTRATION SETTINGS
  // =====================================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/registration-settings");

      setRegistrationOpen(
        Boolean(response.data?.registrationOpen)
      );

      setOpensAt(formatDateTimeLocal(response.data?.opensAt));
      setClosesAt(formatDateTimeLocal(response.data?.closesAt));
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

  // =====================================================
  // TOGGLE REGISTRATION
  // =====================================================

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
          "Registration status updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update registration status:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update registration status."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // SAVE REGISTRATION PERIOD
  // =====================================================

  const savePeriod = async (event) => {
    event.preventDefault();

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

    try {
      setSavingPeriod(true);

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
          "Registration period saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save registration period:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save registration period."
      );
    } finally {
      setSavingPeriod(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              SYSTEM MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Registration
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Control when students can submit new bootcamp
              applications.
            </p>
          </div>

          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <p className="text-sm text-gray-500">
              Loading registration settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* PAGE HEADER */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            SYSTEM MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Registration
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Manage student registration and control when new
            bootcamp applications can be submitted.
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-green-800">
                Success
              </p>

              <p className="mt-1 text-sm text-green-700">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-red-800">
                Error
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            REGISTRATION STATUS
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Registration Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Control whether students can currently submit
                  applications.
                </p>
              </div>

              {/* STATUS */}
              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  registrationOpen
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                    : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    registrationOpen
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />

                {registrationOpen ? "Open" : "Closed"}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {registrationOpen
                  ? "Students can register"
                  : "Student registration is closed"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {registrationOpen
                  ? "New applications are currently being accepted."
                  : "Students cannot submit new applications right now."}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleRegistration}
              disabled={updating}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                registrationOpen
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {updating
                ? "Updating..."
                : registrationOpen
                ? "Close Registration"
                : "Open Registration"}
            </button>
          </div>
        </section>

        {/* =================================================
            REGISTRATION PERIOD
        ================================================= */}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-900">
              Registration Period
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Set when student registration opens and closes.
            </p>
          </div>

          <form onSubmit={savePeriod} className="p-6">

            <div className="grid gap-6 md:grid-cols-2">

              {/* OPEN DATE */}
              <div>
                <label
                  htmlFor="registration-opens"
                  className="mb-2 block text-sm font-semibold text-gray-700"
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Students can begin submitting applications
                  from this time.
                </p>
              </div>

              {/* CLOSE DATE */}
              <div>
                <label
                  htmlFor="registration-closes"
                  className="mb-2 block text-sm font-semibold text-gray-700"
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Applications will stop being accepted after
                  this time.
                </p>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                The opening time must be before the closing time.
              </p>

              <button
                type="submit"
                disabled={savingPeriod}
                className="rounded-xl bg-[#071629] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#10263f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPeriod
                  ? "Saving..."
                  : "Save Registration Period"}
              </button>
            </div>
          </form>
        </section>

        {/* INFORMATION */}
        <section className="rounded-2xl border border-blue-100 bg-blue-50 px-6 py-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
              i
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Registration Control
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                Use the status button to immediately open or
                close registration. The registration period
                controls the scheduled opening and closing times.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// =====================================================
// FORMAT DATETIME FOR datetime-local INPUT
// =====================================================

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