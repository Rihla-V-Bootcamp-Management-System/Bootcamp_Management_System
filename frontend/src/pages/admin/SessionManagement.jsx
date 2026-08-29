import { useEffect, useState } from "react";
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
  const [season, setSeason] = useState(null);

  const [form, setForm] = useState({
    title: "Application Form",
    description: "",
    fields: DEFAULT_APPLICATION_SCHEMA,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fieldTypes = [
    { value: "text", label: "Short Text" },
    { value: "textarea", label: "Long Text" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "select", label: "Dropdown" },
    { value: "radio", label: "Radio" },
    { value: "checkbox", label: "Checkbox" },
    { value: "file", label: "File Upload" },
  ];

  // =========================================================
  // LOAD CURRENT SEASON
  // =========================================================

  useEffect(() => {
    loadCurrentSeason();
  }, []);

  const loadCurrentSeason = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/seasons/current");

      const currentSeason =
        response.data?.data ||
        response.data?.season ||
        response.data;

      if (!currentSeason?._id) {
        setError(
          "No registration season has been created yet. Please ask the Super Admin to create a registration season."
        );
        return;
      }

      setSeason(currentSeason);

      // Once we know the season, load its application form.
      await loadApplicationForm(currentSeason._id);
    } catch (err) {
      console.error("LOAD CURRENT SEASON ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load the current registration season."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD APPLICATION FORM FOR CURRENT SEASON
  // =========================================================

  const loadApplicationForm = async (seasonId) => {
    try {
      setError("");

      const response = await apiClient.get(
        `/application-forms/${seasonId}`
      );

      const data =
        response.data?.data ||
        response.data?.form ||
        response.data;

      if (data && typeof data === "object") {
        const rawFields = Array.isArray(data.fields) && data.fields.length > 0
          ? data.fields
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

        setForm({
          title: data.title || "Application Form",
          description: data.description || "",
          fields: [...baseSchema, ...customOnly],
          _id: data._id,
        });
      }
    } catch (err) {
      console.error(
        "FETCH APPLICATION FORM ERROR:",
        err
      );

      if (err.response?.status === 404) {
        setForm({
          title: "Application Form",
          description: "",
          fields: [],
        });

        setError("");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to manage the application form. Please log in as Admin."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to load the application form."
      );
    }
  };

  // =========================================================
  // UPDATE FORM DETAILS
  // =========================================================

  const updateFormDetails = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================================
  // ADD FIELD
  // =========================================================

  const addField = () => {
    const timestamp = Date.now();

    const newField = {
      id: `field_${timestamp}`,
      label: "New Field",
      name: `field_${timestamp}`,
      type: "text",
      required: false,
      placeholder: "",
      options: [],
    };

    setForm((previous) => ({
      ...previous,
      fields: [
        ...previous.fields,
        newField,
      ],
    }));
  };

  // =========================================================
  // UPDATE FIELD
  // =========================================================

  const updateField = (index, key, value) => {
    setForm((previous) => {
      const fields = [...previous.fields];

      fields[index] = {
        ...fields[index],
        [key]: value,
      };

      return {
        ...previous,
        fields,
      };
    });
  };

  // =========================================================
  // DELETE FIELD
  // =========================================================

  const deleteField = (index) => {
    setForm((previous) => ({
      ...previous,
      fields: previous.fields.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // =========================================================
  // MOVE FIELD
  // =========================================================

  const moveField = (index, direction) => {
    setForm((previous) => {
      const fields = [...previous.fields];
      const newIndex = index + direction;

      if (newIndex < 0 || newIndex >= fields.length) {
        return previous;
      }

      [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];

      return {
        ...previous,
        fields,
      };
    });
  };

  // =========================================================
  // SAVE FORM
  // =========================================================

  const saveForm = async () => {
    if (!season?._id) {
      setError(
        "There is no active registration season. Please ask the Super Admin to create one first."
      );
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a form title.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        seasonId: season._id,
        title: form.title.trim(),
        description: form.description.trim(),
        fields: form.fields,
      };

      let response;

      if (form._id) {
        response = await apiClient.put(
          `/application-forms/${form._id}`,
          payload
        );
      } else {
        response = await apiClient.post(
          "/application-forms",
          payload
        );
      }

      const savedForm =
        response.data?.data ||
        response.data?.form ||
        response.data;

      if (savedForm?._id) {
        setForm({
          title: savedForm.title || payload.title,
          description: savedForm.description || payload.description,
          fields: Array.isArray(savedForm.fields)
            ? savedForm.fields
            : payload.fields,
          _id: savedForm._id,
        });
      }

      setSuccess("Application form saved successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6f5b] border-t-transparent" />
      </div>
    );
  }

  // =========================================================
  // NO SEASON
  // =========================================================

  if (!season) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
          <h1 className="text-base font-bold text-amber-800 dark:text-amber-300">
            Application Form Builder
          </h1>

          <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
            {error || "No registration season has been created yet."}
          </p>

          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            The Super Admin must create an active registration season before you can configure the application form fields.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* TOP MESSAGES */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          {success}
        </div>
      )}

      {/* HEADER BLOCK */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-6 shadow-xs dark:border-slate-800 dark:bg-[#1f6f5b]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Application Form Builder
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Configure global form properties and season applicant questions.
            </p>
          </div>
          <button
            type="button"
            onClick={saveForm}
            disabled={saving}
            className="rounded-xl bg-[#1f6f5b] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#185848] active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Form"}
          </button>
        </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                Form Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateFormDetails("title", e.target.value)}
                className="w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 outline-none focus:border-[#1f6f5b]"
                placeholder="e.g. Summer Bootcamp Application"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                Form Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => updateFormDetails("description", e.target.value)}
                className="w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 outline-none focus:border-[#1f6f5b]"
                placeholder="Brief guidelines for applicants"
              />
            </div>
          </div>
        </div>

        {/* FIELD BUILDER CONTAINER */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#15253f] p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Form Fields</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Add and arrange the fields applicants will complete.
              </p>
            </div>

            <button
              type="button"
              onClick={addField}
              className="rounded-lg border border-[#1f6f5b] px-4 py-2 text-sm font-medium text-[#1f6f5b] hover:bg-[#e5f1ed]"
            >
              + Add Field
            </button>
          </div>

          <div className="p-6">
            {form.fields.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-[#15253f] p-10 text-center">
                <p className="font-medium text-gray-600 dark:text-slate-300">No fields added yet</p>
                <p className="mt-1 text-sm text-gray-400">
                  Click "Add Field" to start building the application form.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {form.fields.map((field, index) => (
                  <div
                    key={field.id || field._id || index}
                    className="rounded-xl border border-gray-200 dark:border-[#15253f] bg-slate-50 dark:bg-[#070e1b] p-5"
                  >
                    {/* FIELD HEADER */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-[#185848]">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-slate-100">
                          {field.label || `Field ${index + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveField(index, -1)}
                          disabled={index === 0}
                          className="rounded border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-2.5 py-1.5 text-sm disabled:opacity-30"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() => moveField(index, 1)}
                          disabled={index === form.fields.length - 1}
                          className="rounded border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-2.5 py-1.5 text-sm disabled:opacity-30"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteField(index)}
                          className="rounded border dark:border-[#15253f] border-red-200 bg-white dark:bg-[#0b1528] px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* FIELD SETTINGS */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* LABEL */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label || ""}
                          onChange={(e) => updateField(index, "label", e.target.value)}
                          className="w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 outline-none focus:border-[#1f6f5b]"
                          placeholder="Full Name"
                        />
                      </div>

                      {/* TYPE */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                          Field Type
                        </label>
                        <select
                          value={field.type || "text"}
                          onChange={(e) => updateField(index, "type", e.target.value)}
                          className="w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 outline-none focus:border-[#1f6f5b]"
                        >
                          {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* FIELD NAME */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                          Field Name (Key)
                        </label>
                        <input
                          type="text"
                          value={field.name || field.id || ""}
                          onChange={(e) => updateField(index, "name", e.target.value)}
                          className="w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 outline-none focus:border-[#1f6f5b]"
                          placeholder="fullName"
                        />
                      </div>

                      {/* PLACEHOLDER */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(index, "placeholder", e.target.value)}
                          className="w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 outline-none focus:border-[#1f6f5b]"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* REQUIRED */}
                    <div className="mt-4 flex items-center">
                      <input
                        type="checkbox"
                        checked={Boolean(field.required)}
                        onChange={(e) => updateField(index, "required", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-[#15253f]"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-slate-200">
                        Required field
                      </label>
                    </div>

                    {/* OPTIONS */}
                    {["select", "radio", "checkbox"].includes(field.type) && (
                      <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
                          Options
                        </label>
                        <input
                          type="text"
                          value={
                            Array.isArray(field.options)
                              ? field.options.join(", ")
                              : field.options || ""
                          }
                          onChange={(e) =>
                            updateField(
                              index,
                              "options",
                              e.target.value.split(",").map((opt) => opt.trimStart())
                            )
                          }
                          onBlur={(e) =>
                            updateField(
                              index,
                              "options",
                              e.target.value
                                .split(",")
                                .map((opt) => opt.trim())
                                .filter(Boolean)
                            )
                          }
                          className="w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] px-3 py-2.5 outline-none focus:border-[#1f6f5b]"
                          placeholder="Option 1, Option 2, Option 3"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Separate options with commas.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

export default FormBuilder;