import { useState } from "react";

function DynamicForm({ schema = [], onSubmit, submitting = false }) {
  const [responses, setResponses] = useState({});

  const handleChange = (fieldId, value) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const success = await onSubmit(responses);

    if (success) {
      setResponses({});
    }
  };

  if (!Array.isArray(schema) || schema.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">
        No application fields have been configured yet.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.map((field) => {
        // Support MongoDB subdocument _id first, then fallback to id
        const fieldKey = field._id || field.id;

        return (
          <div key={fieldKey}>
            {field.type !== "checkbox" && (
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>
            )}

            {/* TEXT */}
            {field.type === "text" && (
              <input
                type="text"
                value={responses[fieldKey] || ""}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
                required={field.required}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}

            {/* EMAIL */}
            {field.type === "email" && (
              <input
                type="email"
                value={responses[fieldKey] || ""}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
                required={field.required}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}

            {/* NUMBER */}
            {field.type === "number" && (
              <input
                type="number"
                value={responses[fieldKey] ?? ""}
                onChange={(e) =>
                  handleChange(
                    fieldKey,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                required={field.required}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}

            {/* TEXTAREA */}
            {field.type === "textarea" && (
              <textarea
                value={responses[fieldKey] || ""}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
                required={field.required}
                rows={4}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}

            {/* SELECT */}
            {field.type === "select" && (
              <select
                value={responses[fieldKey] || ""}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
                required={field.required}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Select an option</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {/* CHECKBOX */}
            {field.type === "checkbox" && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(responses[fieldKey])}
                  onChange={(e) => handleChange(fieldKey, e.target.checked)}
                  required={field.required}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </span>
              </label>
            )}

            {/* RADIO */}
            {field.type === "radio" && (
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={fieldKey}
                      value={option}
                      checked={responses[fieldKey] === option}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      required={field.required}
                      className="h-4 w-4 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* DATE */}
            {field.type === "date" && (
              <input
                type="date"
                value={responses[fieldKey] || ""}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
                required={field.required}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {submitting ? "Submitting Application..." : "Submit Application"}
      </button>
    </form>
  );
}

export default DynamicForm;