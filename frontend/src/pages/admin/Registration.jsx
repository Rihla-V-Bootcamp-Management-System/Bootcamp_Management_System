import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

function Registration() {
  const [settings, setSettings] = useState({
    registrationOpen: false,
    opensAt: null,
    closesAt: null,
  });

  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // FETCH SETTINGS
  // ==========================================

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/registration-settings");

      const data = response.data;

      setSettings({
        registrationOpen: data.registrationOpen,
        opensAt: data.opensAt,
        closesAt: data.closesAt,
      });

      if (data.opensAt) {
        setOpensAt(formatDateTimeForInput(data.opensAt));
      }

      if (data.closesAt) {
        setClosesAt(formatDateTimeForInput(data.closesAt));
      }
    } catch (err) {
      console.error("FETCH REGISTRATION SETTINGS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load registration settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORMAT DATE FOR DATETIME-LOCAL
  // ==========================================

  const formatDateTimeForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ==========================================
  // SAVE REGISTRATION PERIOD
  // ==========================================

  const handleSavePeriod = async () => {
    try {
      setSavingPeriod(true);
      setMessage("");
      setError("");

      if (!opensAt || !closesAt) {
        setError("Please select both opening and closing dates.");
        return;
      }

      const openingDate = new Date(opensAt);
      const closingDate = new Date(closesAt);

      if (openingDate >= closingDate) {
        setError("Opening time must be before closing time.");
        return;
      }

      const response = await apiClient.patch(
        "/registration-settings/period",
        {
          opensAt: openingDate.toISOString(),
          closesAt: closingDate.toISOString(),
        }
      );

      setSettings((previous) => ({
        ...previous,
        opensAt: response.data.opensAt,
        closesAt: response.data.closesAt,
      }));

      setMessage("Registration period saved successfully.");
    } catch (err) {
      console.error("SAVE PERIOD ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save registration period."
      );
    } finally {
      setSavingPeriod(false);
    }
  };

  // ==========================================
  // TOGGLE REGISTRATION
  // ==========================================

  const handleToggleRegistration = async () => {
    try {
      setToggling(true);
      setMessage("");
      setError("");

      const newStatus = !settings.registrationOpen;

      const response = await apiClient.patch(
        "/registration-settings/toggle",
        {
          registrationOpen: newStatus,
        }
      );

      setSettings((previous) => ({
        ...previous,
        registrationOpen: response.data.registrationOpen,
      }));

      setMessage(
        newStatus
          ? "Registration opened successfully."
          : "Registration closed successfully."
      );
    } catch (err) {
      console.error("TOGGLE REGISTRATION ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update registration status."
      );
    } finally {
      setToggling(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading registration settings...
        </p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Registration Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage the registration period and registration form.
        </p>
      </div>

      {/* MESSAGE */}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==========================================
          REGISTRATION STATUS
      ========================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registration Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Control when students can register for the bootcamp.
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
              onClick={handleToggleRegistration}
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

      {/* ==========================================
          REGISTRATION PERIOD
      ========================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900">
          Registration Period
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Set the date and time when registration opens and closes.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* OPENING */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Registration Opens
            </label>

            <input
              type="datetime-local"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* CLOSING */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Registration Closes
            </label>

            <input
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end">

          <button
            type="button"
            onClick={handleSavePeriod}
            disabled={savingPeriod}
            className="rounded-lg bg-[#071629] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#10233b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingPeriod
              ? "Saving..."
              : "Save Registration Period"}
          </button>

        </div>

      </div>

      {/* ==========================================
          REGISTRATION FORM
      ========================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registration Form
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage the fields used by the student registration form.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Edit Registration Form
          </button>

        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-5">

          <p className="text-sm text-slate-600">
            Form questions will appear here after we connect the
            form builder.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Registration;