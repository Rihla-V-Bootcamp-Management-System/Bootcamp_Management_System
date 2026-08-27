import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

const templateTypes = [
  {
    type: "SHORTLISTED",
    label: "Shortlisted",
    description: "Sent when an applicant is shortlisted.",
  },
  {
    type: "ACCEPTED",
    label: "Accepted",
    description: "Sent when an applicant is accepted.",
  },
  {
    type: "REJECTED",
    label: "Rejected",
    description: "Sent when an applicant is rejected.",
  },
];

function EmailTemplates() {
  const [selectedType, setSelectedType] = useState("SHORTLISTED");

  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [html, setHtml] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadTemplate = async (type) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/email-templates/${type}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load email template"
        );
      }

      setSubject(data.template.subject || "");
      setText(data.template.text || "");
      setHtml(data.template.html || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate(selectedType);
  }, [selectedType]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/email-templates/${selectedType}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            text,
            html,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update email template"
        );
      }

      setMessage("Email template updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-[#071629]">
          Email Templates
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage the emails sent to applicants during the
          registration process.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#071629]">
            Email Types
          </h2>

          <div className="space-y-2">
            {templateTypes.map((template) => (
              <button
                key={template.type}
                type="button"
                onClick={() => setSelectedType(template.type)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                  selectedType === template.type
                    ? "border-[#071629] bg-[#071629] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">
                  {template.label}
                </div>

                <div
                  className={`mt-1 text-xs ${
                    selectedType === template.type
                      ? "text-gray-300"
                      : "text-gray-500"
                  }`}
                >
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#071629]">
                {selectedType} Email
              </h2>

              <p className="text-sm text-gray-500">
                Edit the message that applicants will receive.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {selectedType}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading template...
            </div>
          ) : (
            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#071629]"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Plain Text
                </label>

                <textarea
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  rows={10}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#071629]"
                  placeholder="Plain text email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  HTML
                </label>

                <textarea
                  value={html}
                  onChange={(e) =>
                    setHtml(e.target.value)
                  }
                  rows={10}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-[#071629]"
                  placeholder="HTML email"
                />
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-600">
                  Available variables
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {"{{fullName}}"}{" "}
                  {"{{studentId}}"}{" "}
                  {"{{otp}}"}{" "}
                  {"{{otpExpiresAt}}"}
                </p>
              </div>

              {message && (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-[#071629] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#10243b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailTemplates;