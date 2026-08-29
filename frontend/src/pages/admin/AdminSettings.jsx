import { useState } from "react";
import { User, Bell, Shield, Mail, Save } from "lucide-react";

function AdminSettings() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [message, setMessage] = useState("");

  const handleSave = () => {
    setMessage("Settings saved successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            SYSTEM CONFIGURATION
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            Settings
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage account, notifications, security, and system settings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:bg-[#0b1528] dark:text-slate-900 dark:text-white dark:hover:bg-slate-200"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {message}
        </div>
      )}

      {/* GENERAL SETTINGS */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm dark:border-slate-800 dark:bg-[#1f6f5b]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <User className="h-5 w-5" />
              General Settings
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Basic information about the bootcamp management system.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              System Name
            </label>

            <input
              type="text"
              defaultValue="Bootcamp Management System"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Organization Name
            </label>

            <input
              type="text"
              defaultValue="Rihla V Bootcamp"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Administrator Email
            </label>

            <input
              type="email"
              defaultValue="admin@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm dark:border-slate-800 dark:bg-[#1f6f5b]">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Bell className="h-5 w-5" />
            Notifications
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Control how system notifications are delivered.
          </p>
        </div>

        <div className="space-y-4">
          <SettingToggle
            title="System Notifications"
            description="Receive notifications about important system activity."
            enabled={notifications}
            onToggle={() => setNotifications(!notifications)}
          />

          <SettingToggle
            title="Email Notifications"
            description="Receive important updates through email."
            enabled={emailNotifications}
            onToggle={() =>
              setEmailNotifications(!emailNotifications)
            }
          />
        </div>
      </section>

      {/* EMAIL CONFIGURATION */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm dark:border-slate-800 dark:bg-[#1f6f5b]">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Mail className="h-5 w-5" />
            Email Configuration
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure the email sender used by the system.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Sender Name
            </label>

            <input
              type="text"
              defaultValue="Bootcamp Management System"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Sender Email
            </label>

            <input
              type="email"
              defaultValue="no-reply@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm dark:border-slate-800 dark:bg-[#1f6f5b]">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Shield className="h-5 w-5" />
            System Security
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage important system access preferences.
          </p>
        </div>

        <SettingToggle
          title="Maintenance Mode"
          description="Temporarily restrict access while system maintenance is performed."
          enabled={maintenanceMode}
          onToggle={() => setMaintenanceMode(!maintenanceMode)}
        />
      </section>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onToggle,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-[#1f6f5b] dark:bg-white"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          } ${
            enabled ? "dark:bg-[#1f6f5b]" : "dark:bg-slate-300"
          }`}
        />
      </button>
    </div>
  );
}

export default AdminSettings;