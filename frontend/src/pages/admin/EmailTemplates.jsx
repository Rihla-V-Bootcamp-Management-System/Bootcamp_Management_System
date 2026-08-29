import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

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

  const loadTemplate = async (type) => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await apiClient.get(`/email-templates/${type}`);
      const data = response.data;

      setSubject(data.template?.subject || "");
      setText(data.template?.text || "");
      setHtml(data.template?.html || "");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load email template");
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

      await apiClient.patch(`/email-templates/${selectedType}`, {
        subject,
        text,
        html,
      });

      setMessage("Email template updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update email template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Email Templates
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Manage the emails sent to applicants during the
          registration process.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
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
                    ? "border-[#071629] bg-[#1f6f5b] hover:bg-[#185848] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-slate-50 dark:bg-[#070e1b]"
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

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {selectedType} Email
              </h2>

              <p className="text-sm text-gray-500 dark:text-slate-400">
                Edit the message that applicants will receive.
              </p>
            </div>


            <span className="rounded-full bg-gray-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-semibold text-gray-600 dark:text-slate-300">
              {selectedType}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-slate-400">
              Loading template...
            </div>
          ) : (
            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] px-4 py-3 text-sm outline-none focus:border-[#071629]"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  Plain Text
                </label>

                <textarea
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  rows={10}
                  className="w-full resize-y rounded-lg border border-gray-300 dark:border-[#15253f] px-4 py-3 text-sm outline-none focus:border-[#071629]"
                  placeholder="Plain text email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                  HTML
                </label>

                <textarea
                  value={html}
                  onChange={(e) =>
                    setHtml(e.target.value)
                  }
                  rows={10}
                  className="w-full resize-y rounded-lg border border-gray-300 dark:border-[#15253f] px-4 py-3 font-mono text-sm outline-none focus:border-[#071629]"
                  placeholder="HTML email"
                />
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-[#070e1b] p-4">
                <p className="text-xs font-medium text-gray-600 dark:text-slate-300">
                  Available variables
                </p>

                <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
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
                  className="rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f6f5b] hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-50"
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