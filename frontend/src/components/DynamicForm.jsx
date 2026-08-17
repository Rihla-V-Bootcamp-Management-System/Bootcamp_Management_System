import { useState } from "react";

function DynamicForm({ schema, onSubmit }) {
  const [responses, setResponses] = useState({});

  const handleChange = (id, value) => {
    setResponses((previousResponses) => ({
      ...previousResponses,
      [id]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const success = await onSubmit(responses);

    if (success) {
      setResponses({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {schema.map((field) => (
        <div key={field.id}>

          
          {field.type !== "checkbox" && (
            <label className="block mb-2 font-medium text-gray-700">
              {field.label}

              {field.required && (
                <span className="text-red-500 ml-1">
                  *
                </span>
              )}
            </label>
          )}

        
          {field.type === "text" && (
            <input
              type="text"
              value={responses[field.id] || ""}
              onChange={(event) =>
                handleChange(
                  field.id,
                  event.target.value
                )
              }
              required={field.required}
              className="w-full border rounded-lg p-3"
            />
          )}

         
          {field.type === "email" && (
            <input
              type="email"
              value={responses[field.id] || ""}
              onChange={(event) =>
                handleChange(
                  field.id,
                  event.target.value
                )
              }
              required={field.required}
              className="w-full border rounded-lg p-3"
            />
          )}

          
          {field.type === "number" && (
            <input
              type="number"
              value={responses[field.id] ?? ""}
              onChange={(event) =>
                handleChange(
                  field.id,
                  event.target.value === ""
                    ? ""
                    : Number(event.target.value)
                )
              }
              required={field.required}
              className="w-full border rounded-lg p-3"
            />
          )}

          
          {field.type === "textarea" && (
            <textarea
              value={responses[field.id] || ""}
              onChange={(event) =>
                handleChange(
                  field.id,
                  event.target.value
                )
              }
              required={field.required}
              rows="4"
              className="w-full border rounded-lg p-3"
            />
          )}

          
          {field.type === "select" && (
            <select
              value={responses[field.id] || ""}
              onChange={(event) =>
                handleChange(
                  field.id,
                  event.target.value
                )
              }
              required={field.required}
              className="w-full border rounded-lg p-3"
            >
              <option value="">
                Select an option
              </option>

              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          
          {field.type === "checkbox" && (
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={responses[field.id] || false}
                onChange={(event) =>
                  handleChange(
                    field.id,
                    event.target.checked
                  )
                }
                required={field.required}
                className="h-4 w-4"
              />

              <span className="text-gray-700">
                {field.label}

                {field.required && (
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                )}
              </span>
            </label>
          )}

         
          {field.type === "radio" && (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2"
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={
                      responses[field.id] === option
                    }
                    onChange={(event) =>
                      handleChange(
                        field.id,
                        event.target.value
                      )
                    }
                    required={field.required}
                  />

                  <span className="text-gray-700">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          )}

         
          {field.type === "date" && (
            <input
              type="date"
              value={responses[field.id] || ""}
              onChange={(event) =>
                handleChange(
                  field.id,
                  event.target.value
                )
              }
              required={field.required}
              className="w-full border rounded-lg p-3"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full rounded-lg bg-black py-3 text-white hover:bg-yellow-900"
      >
        Submit Application
      </button>
    </form>
  );
}

export default DynamicForm;