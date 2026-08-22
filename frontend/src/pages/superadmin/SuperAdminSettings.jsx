import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Shield,
  Mail,
  Save,
  ClipboardList,
} from "lucide-react";

function SuperAdminSettings() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [loadingRegistration, setLoadingRegistration] = useState(true);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRegistrationSettings = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/registration-settings"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load registration settings"
          );
        }

        setRegistrationOpen(Boolean(data.registrationOpen));
      } catch (err) {
        setError(
          err.message || "Failed to load registration settings"
        );
      } finally {
        setLoadingRegistration(false);
      }
    };

    loadRegistrationSettings();
  }, []);

  const toggleRegistration = async () => {
    try {
      setSavingRegistration(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      const nextValue = !registrationOpen;

      const response = await fetch(
        "http://localhost:5000/api/registration-settings/toggle",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            registrationOpen: nextValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update registration settings"
        );
      }

      setRegistrationOpen(Boolean(data.registrationOpen));
      setMessage(data.message || "Registration settings updated.");
    } catch (err) {
      setError(
        err.message || "Failed to update registration settings"
      );
    } finally {
      setSavingRegistration(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <p className="settings-eyebrow">SYSTEM CONFIGURATION</p>
          <h2>Settings</h2>
          <p>
            Manage account, notifications, security, and registration settings.
          </p>
        </div>

        <button className="settings-save-button">
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {message && <div className="settings-message">{message}</div>}
      {error && <div className="settings-error">{error}</div>}

      <div className="settings-layout">
        <div className="settings-sidebar">
          <div className="settings-menu active">
            <User size={17} />
            <span>General</span>
          </div>

          <div className="settings-menu">
            <Bell size={17} />
            <span>Notifications</span>
          </div>

          <div className="settings-menu">
            <Shield size={17} />
            <span>Security</span>
          </div>

          <div className="settings-menu">
            <Mail size={17} />
            <span>Email</span>
          </div>

          <div className="settings-menu">
            <ClipboardList size={17} />
            <span>Registration</span>
          </div>
        </div>

        <div className="settings-content">
          <section className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>General Settings</h3>
                <p>Basic information about the bootcamp management system.</p>
              </div>
              <User size={19} />
            </div>

            <div className="settings-form">
              <div className="settings-field">
                <label>System Name</label>
                <input
                  type="text"
                  defaultValue="Bootcamp Management System"
                />
              </div>

              <div className="settings-field">
                <label>Organization Name</label>
                <input
                  type="text"
                  defaultValue="Rihla V Bootcamp"
                />
              </div>

              <div className="settings-field">
                <label>Administrator Email</label>
                <input
                  type="email"
                  defaultValue="admin@example.com"
                />
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>Notifications</h3>
                <p>Control how system notifications are delivered.</p>
              </div>
              <Bell size={19} />
            </div>

            <div className="settings-options">
              <div className="settings-option">
                <div>
                  <strong>System Notifications</strong>
                  <span>
                    Receive notifications about important system activity.
                  </span>
                </div>

                <button
                  className={`settings-toggle ${
                    notifications ? "active" : ""
                  }`}
                  onClick={() => setNotifications(!notifications)}
                >
                  <span></span>
                </button>
              </div>

              <div className="settings-option">
                <div>
                  <strong>Email Notifications</strong>
                  <span>
                    Receive important updates through email.
                  </span>
                </div>

                <button
                  className={`settings-toggle ${
                    emailNotifications ? "active" : ""
                  }`}
                  onClick={() =>
                    setEmailNotifications(!emailNotifications)
                  }
                >
                  <span></span>
                </button>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>Registration Settings</h3>
                <p>
                  Control whether new bootcamp applications are accepted.
                </p>
              </div>
              <ClipboardList size={19} />
            </div>

            <div className="settings-options">
              <div className="settings-option">
                <div>
                  <strong>Open Registrations</strong>
                  <span>
                    {loadingRegistration
                      ? "Loading registration status..."
                      : registrationOpen
                        ? "New applications are currently being accepted."
                        : "New applications are currently closed."}
                  </span>
                </div>

                <button
                  className={`settings-toggle ${
                    registrationOpen ? "active" : ""
                  }`}
                  onClick={toggleRegistration}
                  disabled={
                    loadingRegistration || savingRegistration
                  }
                >
                  <span></span>
                </button>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>System Security</h3>
                <p>Manage important system access preferences.</p>
              </div>
              <Shield size={19} />
            </div>

            <div className="settings-options">
              <div className="settings-option">
                <div>
                  <strong>Maintenance Mode</strong>
                  <span>
                    Temporarily restrict access while system maintenance is performed.
                  </span>
                </div>

                <button
                  className={`settings-toggle ${
                    maintenanceMode ? "active" : ""
                  }`}
                  onClick={() =>
                    setMaintenanceMode(!maintenanceMode)
                  }
                >
                  <span></span>
                </button>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>Email Configuration</h3>
                <p>Configure the email sender used by the system.</p>
              </div>
              <Mail size={19} />
            </div>

            <div className="settings-form">
              <div className="settings-field">
                <label>Sender Name</label>
                <input
                  type="text"
                  defaultValue="Bootcamp Management System"
                />
              </div>

              <div className="settings-field">
                <label>Sender Email</label>
                <input
                  type="email"
                  defaultValue="no-reply@example.com"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminSettings;