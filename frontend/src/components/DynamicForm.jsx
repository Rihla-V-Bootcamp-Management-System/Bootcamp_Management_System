import { useState } from "react";

function DynamicForm({
  schema = [],
  onSubmit,
  submitting = false,
}) {
  const [responses, setResponses] = useState({});

  const handleChange = (fieldId, value) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(
      "DYNAMIC FORM RESPONSES:",
      JSON.stringify(responses, null, 2)
    );

    const success = await onSubmit(responses);

    if (success) {
      setResponses({});
    }
  };

  if (!Array.isArray(schema) || schema.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500 dark:text-slate-400">
        No application fields have been configured yet.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {schema.map((field) => {
        // IMPORTANT:
        // Use the application's "id" first.
        // Example: fullName, email, gender, etc.
        const fieldKey = field.id || field._id;

        if (!fieldKey) {
          console.error(
            "Application field has no id:",
            field
          );

          return null;
        }

        return (
          <div key={fieldKey}>

            {/* =========================================
                LABEL
            ========================================= */}

            {field.type !== "checkbox" && (
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                {field.label}

                {field.required && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}
              </label>
            )}

            {/* =========================================
                TEXT / URL / TEL / LINK
            ========================================= */}

            {(field.type === "text" ||
              field.type === "url" ||
              field.type === "tel" ||
              field.type === "link" ||
              !field.type) && (
              <input
                type={
                  field.type === "url"
                    ? "url"
                    : field.type === "tel"
                    ? "tel"
                    : "text"
                }
                value={responses[fieldKey] || ""}
                onChange={(e) =>
                  handleChange(
                    fieldKey,
                    e.target.value
                  )
                }
                placeholder={field.placeholder || ""}
                required={field.required}
                className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}

            {/* =========================================
                EMAIL
            ========================================= */}

            {field.type === "email" && (
              <input
                type="email"
                value={responses[fieldKey] || ""}
                onChange={(e) =>
                  handleChange(
                    fieldKey,
                    e.target.value
                  )
                }
                required={field.required}
                className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}

            {/* =========================================
                NUMBER
            ========================================= */}


            {field.type === "number" && (
              <input
                type="number"
                value={
                  responses[fieldKey] ?? ""
                }
                onChange={(e) =>
                  handleChange(
                    fieldKey,
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                  )
                }
                required={field.required}
                className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}

            {/* =========================================
                TEXTAREA
            ========================================= */}

            {field.type === "textarea" && (
              <textarea
                value={
                  responses[fieldKey] || ""
                }
                onChange={(e) =>
                  handleChange(
                    fieldKey,
                    e.target.value
                  )
                }
                required={field.required}
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}

            {/* =========================================
                SELECT
            ========================================= */}

            {field.type === "select" && (
              <select
                value={
                  responses[fieldKey] || ""
                }
                onChange={(e) =>
                  handleChange(
                    fieldKey,
                    e.target.value
                  )
                }
                required={field.required}
                className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">
                  Select an option
                </option>

                {field.options?.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            )}

            {/* =========================================
                CHECKBOX
            ========================================= */}

            {field.type === "checkbox" && (
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(
                    responses[fieldKey]
                  )}
                  onChange={(e) =>
                    handleChange(
                      fieldKey,
                      e.target.checked
                    )
                  }
                  required={field.required}
                  className="h-4 w-4 rounded border-gray-300 dark:border-[#15253f] text-black focus:ring-black"
                />

                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  {field.label}

                  {field.required && (
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  )}
                </span>
              </label>
            )}

            {/* =========================================
                RADIO
            ========================================= */}


            {field.type === "radio" && (
              <div className="space-y-2">
                {field.options?.map(
                  (option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        name={fieldKey}
                        value={option}
                        checked={
                          responses[fieldKey] ===
                          option
                        }
                        onChange={(e) =>
                          handleChange(
                            fieldKey,
                            e.target.value
                          )
                        }
                        required={
                          field.required
                        }
                        className="h-4 w-4 text-black focus:ring-black"
                      />

                      <span className="text-sm text-gray-700 dark:text-slate-200">
                        {option}
                      </span>
                    </label>
                  )
                )}
              </div>
            )}

            {/* =========================================
                DATE
            ========================================= */}

            {field.type === "date" && (
              <input
                type="date"
                value={
                  responses[fieldKey] || ""
                }
                onChange={(e) =>
                  handleChange(
                    fieldKey,
                    e.target.value
                  )
                }
                required={field.required}
                className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          </div>
        );
      })}

      {/* =========================================
          SUBMIT
      ========================================= */}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-[#185848] disabled:opacity-50"
      >
        {submitting
          ? "Submitting Application..."
          : "Submit Application"}
      </button>
    </form>
  );
}

export default DynamicForm;