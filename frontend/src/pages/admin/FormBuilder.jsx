import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

const DEFAULT_APPLICATION_SCHEMA = [
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter your full name",
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    required: true,
    placeholder: "+251 912 345 678",
  },
  {
    id: "telegramUsername",
    label: "Telegram Username",
    type: "text",
    required: true,
    placeholder: "@username",
  },
  {
    id: "gender",
    label: "Gender",
    type: "select",
    required: true,
    options: ["Male", "Female"],
  },
  {
    id: "educationLevel",
    label: "Education Level / Year",
    type: "select",
    required: true,
    options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate"],
  },
  {
    id: "educationInstitution",
    label: "University / Institution",
    type: "text",
    required: true,
    placeholder: "e.g. Adama Science and Technology University",
  },
  {
    id: "fieldOfStudy",
    label: "Field of Study",
    type: "text",
    required: true,
    placeholder: "e.g. Software Engineering / Computer Science",
  },
  {
    id: "programmingExperience",
    label: "Programming Experience Level",
    type: "select",
    required: true,
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "githubLink",
    label: "GitHub Profile Link (optional)",
    type: "url",
    required: false,
    placeholder: "https://github.com/your-username",
  },
  {
    id: "codeforcesLink",
    label: "Codeforces Profile Link (optional)",
    type: "url",
    required: false,
    placeholder: "https://codeforces.com/profile/username",
  },
  {
    id: "motivation",
    label: "Why do you want to join this bootcamp?",
    type: "textarea",
    required: false,
    placeholder: "Tell us about your goals and motivations...",
  },
];

function FormBuilder() {
  const [seasonId, setSeasonId] = useState("");
  const [season, setSeason] = useState(null);
  const [fields, setFields] = useState(DEFAULT_APPLICATION_SCHEMA);

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

      const applicationForm = response.data?.applicationForm;
      const currentSeason = response.data?.season;

      if (!applicationForm) {
        setError("Application form was not found.");
        setFields(DEFAULT_APPLICATION_SCHEMA);
        return;
      }

      setSeason(currentSeason || null);
      setSeasonId(applicationForm.seasonId);

      const rawFields = Array.isArray(applicationForm.fields) && applicationForm.fields.length > 0
        ? applicationForm.fields
        : DEFAULT_APPLICATION_SCHEMA;

      const coreIds = new Set(DEFAULT_APPLICATION_SCHEMA.map((f) => f.id));
      const customMap = new Map();
      rawFields.forEach((f) => {
        const key = f.id || f._id;
        if (key) customMap.set(key, f);
      });

      const baseSchema = DEFAULT_APPLICATION_SCHEMA.map((coreField) => {
        return customMap.get(coreField.id) || coreField;
      });

      const customOnly = rawFields.filter(
        (f) => f && (f.id || f._id) && !coreIds.has(f.id || f._id)
      );


      setFields([...baseSchema, ...customOnly]);
    } catch (err) {
      console.error("FETCH APPLICATION FORM ERROR:", err);
      setFields(DEFAULT_APPLICATION_SCHEMA);
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

    if (newType === "select" || newType === "radio") {
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
        optionIndex === index ? value : option
      )
    );
  };

  const handleAddOption = () => {
    setOptions((previous) => [...previous, ""]);
  };

  const handleRemoveOption = (index) => {
    setOptions((previous) =>
      previous.filter(
        (_, optionIndex) => optionIndex !== index
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
      type === "select" || type === "radio";

    let cleanOptions = [];

    if (needsOptions) {
      cleanOptions = options
        .map((option) => option.trim())
        .filter(Boolean);

      if (cleanOptions.length < 2) {
        setError("Please provide at least two choices.");
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

    setFields((previous) => [...previous, newField]);

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
      previous.filter((field) => field.id !== id)
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
      setError("No active application season was found.");
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

      const updatedForm = response.data?.applicationForm;

      setFields(
        Array.isArray(updatedForm?.fields)
          ? updatedForm.fields
          : fields
      );

      setMessage("Application form saved successfully.");
    } catch (err) {
      console.error("SAVE APPLICATION FORM ERROR:", err);

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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-[#15253f] border-t-slate-800" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading application form...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#070e1b] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Application Form Builder
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Create and manage the questions students will
                see on the application form.
              </p>
            </div>

            {season && (
              <div className="shrink-0 rounded-xl border border-blue-100 bg-[#e5f1ed] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                  Current Season
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-900">
                  {season.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span className="font-bold">✓</span>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">

          {/* =================================================
              ADD QUESTION
          ================================================= */}

          <div className="xl:col-span-2">
            <div className="h-full rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

              <div className="border-b border-slate-200 dark:border-[#15253f] px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Add Application Question
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create a question and choose how students
                  should answer it.
                </p>
              </div>

              <form
                onSubmit={handleAddField}
                className="space-y-5 p-6"
              >

                {/* QUESTION */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Question
                  </label>


                  <input
                    type="text"
                    value={label}
                    onChange={(e) =>
                      setLabel(e.target.value)
                    }
                    placeholder="Example: What is your motivation for joining?"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#15253f] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* TYPE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Answer Type
                  </label>

                  <select
                    value={type}
                    onChange={(e) =>
                      handleTypeChange(e.target.value)
                    }
                    className="w-full rounded-xl border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
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

                {(type === "select" || type === "radio") && (
                  <div className="rounded-xl border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-4">

                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Choices
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Add the choices students can select.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2"
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
                            placeholder={`Choice ${index + 1}`}
                            className="min-w-0 flex-1 rounded-lg border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                          />

                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveOption(index)
                              }
                              className="shrink-0 rounded-lg border border-red-200 px-3 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>


                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="mt-4 rounded-lg border dark:border-[#15253f] border-slate-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:bg-[#070e1b]"
                    >
                      + Add Choice
                    </button>
                  </div>
                )}

                {/* REQUIRED */}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) =>
                      setRequired(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 dark:border-[#15253f]"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Required question
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Students must answer this question.
                    </p>
                  </div>
                </label>

                {/* ADD BUTTON */}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1f6f5b] hover:bg-[#185848] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f6f5b] hover:bg-[#185848]"
                >
                  + Add Question
                </button>

              </form>
            </div>
          </div>

          {/* =================================================
              CURRENT QUESTIONS
          ================================================= */}

          <div className="xl:col-span-3">
            <div className="h-full rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

              {/* HEADER */}

              <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-[#15253f] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Current Application Questions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    These are the questions students will see
                    on the application form.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-slate-100 dark:bg-[#070e1b] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {fields.length}{" "}
                  {fields.length === 1
                    ? "Question"
                    : "Questions"}
                </span>
              </div>

              {/* QUESTIONS */}

              <div className="p-6">
                {fields.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-6 text-center">

                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-[#0b1528] text-xl shadow-sm">
                      ?
                    </div>

                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      No application questions yet
                    </p>

                    <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                      Add your first question using the form
                      on the left.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-5 transition hover:border-slate-300 dark:border-[#15253f] hover:shadow-sm"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0 flex-1">


                            {/* QUESTION NUMBER */}

                            <div className="flex items-start gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#070e1b] text-xs font-bold text-slate-700 dark:text-slate-200">
                                {index + 1}
                              </span>

                              <p className="pt-1 text-sm font-semibold leading-6 text-slate-900 dark:text-white">
                                {field.label}
                              </p>
                            </div>

                            {/* BADGES */}

                            <div className="mt-3 flex flex-wrap gap-2 pl-10">

                              <span className="rounded-full bg-slate-100 dark:bg-[#070e1b] px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                                {field.type === "text"
                                  ? "Short Answer"
                                  : field.type === "textarea"
                                  ? "Long Answer"
                                  : field.type === "select"
                                  ? "Multiple Choice"
                                  : field.type === "radio"
                                  ? "Radio Choice"
                                  : field.type === "checkbox"
                                  ? "Checkbox"
                                  : field.type === "email"
                                  ? "Email"
                                  : field.type === "number"
                                  ? "Number"
                                  : field.type === "date"
                                  ? "Date"
                                  : field.type}
                              </span>

                              {field.required && (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-[#185848]">
                                  Required
                                </span>
                              )}
                            </div>

                            {/* CHOICES */}

                            {(field.type === "select" ||
                              field.type === "radio") &&
                              field.options?.length > 0 && (
                                <div className="mt-4 pl-10">
                                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Choices
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {field.options.map(
                                      (option, optionIndex) => (
                                        <span
                                          key={`${option}-${optionIndex}`}
                                          className="rounded-lg border border-slate-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                                        >
                                          {option}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* REMOVE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveField(field.id)
                            }
                            className="shrink-0 rounded-lg border dark:border-[#15253f] border-red-200 bg-white dark:bg-[#0b1528] px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Remove
                          </button>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* =================================================
            SAVE BAR
        ================================================= */}

        <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528]/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Ready to publish your changes?
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save the application form after adding or
                removing questions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-[#1f6f5b] hover:bg-[#185848] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f6f5b] hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving
                ? "Saving..."
                : "Save Application Form"}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default FormBuilder;