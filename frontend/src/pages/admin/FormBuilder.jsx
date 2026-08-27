import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

function FormBuilder() {
  const [seasonId, setSeasonId] = useState("");
  const [season, setSeason] = useState(null);
  const [fields, setFields] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState(["", ""]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD CURRENT APPLICATION FORM
  // =====================================================

  const fetchApplicationForm = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await apiClient.get("/application-forms");

      const applicationForm =
        response.data?.applicationForm;

      const currentSeason =
        response.data?.season;

      if (!applicationForm) {
        setError("Application form was not found.");
        return;
      }

      setSeason(currentSeason || null);
      setSeasonId(applicationForm.seasonId);

      setFields(
        Array.isArray(applicationForm.fields)
          ? applicationForm.fields
          : []
      );
    } catch (err) {
      console.error(
        "FETCH APPLICATION FORM ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load application form."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationForm();
  }, []);

  // =====================================================
  // TYPE CHANGE
  // =====================================================

  const handleTypeChange = (newType) => {
    setType(newType);

    if (
      newType === "select" ||
      newType === "radio"
    ) {
      setOptions(["", ""]);
    } else {
      setOptions([""]);
    }
  };

  // =====================================================
  // OPTION HANDLING
  // =====================================================

  const handleOptionChange = (index, value) => {
    setOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index
          ? value
          : option
      )
    );
  };

  const handleAddOption = () => {
    setOptions((previous) => [
      ...previous,
      "",
    ]);
  };

  const handleRemoveOption = (index) => {
    setOptions((previous) =>
      previous.filter(
        (_, optionIndex) =>
          optionIndex !== index
      )
    );
  };

  // =====================================================
  // ADD FIELD
  // =====================================================

  const handleAddField = (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!label.trim()) {
      setError("Please enter the question.");
      return;
    }

    const needsOptions =
      type === "select" ||
      type === "radio";

    let cleanOptions = [];

    if (needsOptions) {
      cleanOptions = options
        .map((option) => option.trim())
        .filter(Boolean);

      if (cleanOptions.length < 2) {
        setError(
          "Please provide at least two choices."
        );
        return;
      }
    }

    const newField = {
      id: `${type}_${Date.now()}`,
      label: label.trim(),
      type,
      required,
      options: cleanOptions,
    };

    setFields((previous) => [
      ...previous,
      newField,
    ]);

    setLabel("");
    setType("text");
    setRequired(false);
    setOptions(["", ""]);

    setMessage(
      "Question added. Click Save Application Form to save it."
    );
  };

  // =====================================================
  // REMOVE FIELD
  // =====================================================

  const handleRemoveField = (id) => {
    setFields((previous) =>
      previous.filter(
        (field) => field.id !== id
      )
    );

    setMessage(
      "Question removed. Click Save Application Form to save the changes."
    );
  };

  // =====================================================
  // SAVE FORM
  // =====================================================

  const handleSave = async () => {
    if (!seasonId) {
      setError(
        "No active application season was found."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await apiClient.patch(
        `/application-forms/${seasonId}`,
        {
          fields,
        }
      );

      const updatedForm =
        response.data?.applicationForm;

      setFields(
        Array.isArray(updatedForm?.fields)
          ? updatedForm.fields
          : fields
      );

      setMessage(
        "Application form saved successfully."
      );
    } catch (err) {
      console.error(
        "SAVE APPLICATION FORM ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save application form."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading application form...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Application Form Builder
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create and manage the questions students
          will see on the application form.
        </p>

        {season && (
          <p className="mt-2 text-sm font-medium text-slate-700">
            Current Season: {season.name}
          </p>
        )}
      </div>

      {/* MESSAGES */}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ADD QUESTION */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900">
          Add Application Question
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          This question will appear on the student
          application form after you save the form.
        </p>

        <form
          onSubmit={handleAddField}
          className="mt-6 space-y-5"
        >

          {/* QUESTION */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Question
            </label>

            <input
              type="text"
              value={label}
              onChange={(e) =>
                setLabel(e.target.value)
              }
              placeholder="Example: What is your motivation for joining?"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* TYPE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Answer Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                handleTypeChange(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="text">
                Short Answer
              </option>

              <option value="textarea">
                Long Answer
              </option>

              <option value="email">
                Email
              </option>

              <option value="number">
                Number
              </option>

              <option value="date">
                Date
              </option>

              <option value="select">
                Multiple Choice
              </option>

              <option value="radio">
                Radio Choice
              </option>

              <option value="checkbox">
                Checkbox
              </option>
            </select>
          </div>

          {/* OPTIONS */}

          {(type === "select" ||
            type === "radio") && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">

              <h3 className="text-sm font-semibold text-slate-800">
                Choices
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Add the choices students can select.
              </p>

              <div className="mt-4 space-y-3">

                {options.map(
                  (option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >

                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            e.target.value
                          )
                        }
                        placeholder={`Choice ${
                          index + 1
                        }`}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveOption(
                              index
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}

                    </div>
                  )
                )}

              </div>

              <button
                type="button"
                onClick={handleAddOption}
                className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                + Add Choice
              </button>

            </div>
          )}

          {/* REQUIRED */}

          <label className="flex items-center gap-3 text-sm text-slate-700">

            <input
              type="checkbox"
              checked={required}
              onChange={(e) =>
                setRequired(
                  e.target.checked
                )
              }
              className="h-4 w-4"
            />

            Required question

          </label>

          {/* ADD BUTTON */}

          <div className="flex justify-end">

            <button
              type="submit"
              className="rounded-lg bg-[#071629] px-5 py-3 text-sm font-medium text-white hover:bg-[#10233b]"
            >
              Add Question
            </button>

          </div>

        </form>
      </div>

      {/* CURRENT QUESTIONS */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Current Application Questions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              These are the questions students will
              see on the application form.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {fields.length} Questions
          </span>

        </div>

        {fields.length === 0 ? (

          <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              No application questions have been
              configured yet.
            </p>
          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {fields.map(
              (field, index) => (

                <div
                  key={field.id}
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between"
                >

                  <div>

                    <p className="text-sm font-semibold text-slate-900">
                      {index + 1}.{" "}
                      {field.label}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {field.type ===
                        "text"
                          ? "Short Answer"
                          : field.type ===
                            "textarea"
                          ? "Long Answer"
                          : field.type ===
                            "select"
                          ? "Multiple Choice"
                          : field.type ===
                            "radio"
                          ? "Radio Choice"
                          : field.type ===
                            "checkbox"
                          ? "Checkbox"
                          : field.type ===
                            "email"
                          ? "Email"
                          : field.type ===
                            "number"
                          ? "Number"
                          : field.type ===
                            "date"
                          ? "Date"
                          : field.type}
                      </span>

                      {field.required && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                          Required
                        </span>
                      )}

                    </div>

                    {(field.type ===
                      "select" ||
                      field.type ===
                        "radio") &&
                      field.options?.length >
                        0 && (
                        <div className="mt-3">

                          <p className="text-xs font-medium text-slate-500">
                            Choices:
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">

                            {field.options.map(
                              (option) => (
                                <span
                                  key={option}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                                >
                                  {option}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveField(
                        field.id
                      )
                    }
                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Remove
                  </button>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* SAVE */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#071629] px-6 py-3 text-sm font-semibold text-white hover:bg-[#10233b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Application Form"}
        </button>

      </div>

    </div>
  );
}

export default FormBuilder;