import { useState } from "react";
function DynamicForm({ schema, onSubmit }) {
  const [responses, setResponses] = useState({});

  const handleChange = (id, value) => {
    setResponses((previousResponses) => ({
      ...previousResponses,
      [id]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit(responses);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {schema.map((field) => (
        <div key={field.id}>

          <label className="block mb-2 font-medium text-gray-700">
            {field.label}

            {field.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>

          {field.type === "text" && (
            <input
              type="text"
              value={responses[field.id] || ""}
              onChange={(event) =>
                handleChange(field.id, event.target.value)
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
                handleChange(field.id, event.target.value)
              }
              required={field.required}
              className="w-full border rounded-lg p-3"
            />
          )}

          {field.type === "number" && (
            <input
              type="number"
              value={responses[field.id] || ""}
              onChange={(event) =>
                handleChange(field.id, event.target.value)
              }
              required={field.required}
              className="w-full border rounded-lg p-3"
            />
          )}

          {field.type === "textarea" && (
            <textarea
              value={responses[field.id] || ""}
              onChange={(event) =>
                handleChange(field.id, event.target.value)
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
                handleChange(field.id, event.target.value)
              }
              required={field.required}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select an option</option>

              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-black text-white py-3 rounded-lg"
      >
        Submit Application
      </button>

    </form>
  );
}

export default DynamicForm;