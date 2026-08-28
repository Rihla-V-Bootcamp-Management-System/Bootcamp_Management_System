
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

function FormBuilder() {
  const [season, setSeason] = useState(null);

  const [form, setForm] = useState({
    title: "Application Form",
    description: "",
    fields: [],
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
        setForm({
          title: data.title || "Application Form",
          description: data.description || "",
          fields: Array.isArray(data.fields)
            ? data.fields
            : [],
          _id: data._id,
        });
      }
    } catch (err) {
      console.error(
        "FETCH APPLICATION FORM ERROR:",
        err
      );

      // A form does not exist yet.
      // That is NOT a fatal error.
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

      if (
        newIndex < 0 ||
        newIndex >= fields.length
      ) {
        return previous;
      }

      [
        fields[index],
        fields[newIndex],
      ] = [
        fields[newIndex],
        fields[index],
      ];

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

      // -------------------------------------------------------
      // UPDATE EXISTING FORM
      // -------------------------------------------------------

      if (form._id) {
        response = await apiClient.put(
          `/application-forms/${form._id}`,
          payload
        );
      }

      // -------------------------------------------------------
      // CREATE FORM FOR CURRENT SEASON
      // -------------------------------------------------------

      else {
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
          title:
            savedForm.title ||
            payload.title,

          description:
            savedForm.description ||
            payload.description,

          fields:
            Array.isArray(savedForm.fields)
              ? savedForm.fields
              : payload.fields,

          _id: savedForm._id,
        });
      }

      setSuccess(
        "Application form saved successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <p className="text-gray-500">
              Loading application form...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO SEASON
  // =========================================================

  if (!season) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-xl font-semibold text-red-800">
              Application Form Builder
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "No registration season has been created yet."}
            </p>

            <p className="mt-3 text-sm text-red-600">
              The Super Admin must create a registration
              season before the Admin can build the
              application form.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Application Form Builder
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage the application form
              displayed on the Apply Now page.
            </p>

            <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              Season: {season.name}
            </div>
          </div>

          <button
            type="button"
            onClick={saveForm}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Form"}
          </button>
        </div>

        {/* =====================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            FORM INFORMATION
        ====================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Form Information
          </h2>

          <div className="grid gap-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Form Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  updateFormDetails(
                    "title",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Application Form"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateFormDetails(
                    "description",
                    e.target.value
                  )
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter instructions for applicants..."
              />
            </div>

          </div>
        </div>

        {/* =====================================================
            APPLICATION FIELDS
        ====================================================== */}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Application Fields
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add and arrange the fields applicants
                will complete.
              </p>
            </div>

            <button
              type="button"
              onClick={addField}
              className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              + Add Field
            </button>

          </div>

          <div className="p-6">

            {form.fields.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 p-10 text-center">

                <p className="font-medium text-gray-600">
                  No fields added yet
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Click "Add Field" to start building
                  the application form.
                </p>

              </div>
            ) : (
              <div className="space-y-5">

                {form.fields.map(
                  (field, index) => (
                    <div
                      key={
                        field.id ||
                        field._id ||
                        index
                      }
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >

                      {/* FIELD HEADER */}

                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {index + 1}
                          </span>

                          <span className="font-medium text-gray-800">
                            Field {index + 1}
                          </span>

                        </div>

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              moveField(
                                index,
                                -1
                              )
                            }
                            disabled={
                              index === 0
                            }
                            className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm disabled:opacity-30"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveField(
                                index,
                                1
                              )
                            }
                            disabled={
                              index ===
                              form.fields
                                .length -
                                1
                            }
                            className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm disabled:opacity-30"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteField(
                                index
                              )
                            }
                            className="rounded border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>
                      </div>

                      {/* FIELD SETTINGS */}

                      <div className="grid gap-4 md:grid-cols-2">

                        {/* LABEL */}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Label
                          </label>

                          <input
                            type="text"
                            value={
                              field.label ||
                              ""
                            }
                            onChange={(e) =>
                              updateField(
                                index,
                                "label",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="Full Name"
                          />
                        </div>

                        {/* TYPE */}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Field Type
                          </label>

                          <select
                            value={
                              field.type ||
                              "text"
                            }
                            onChange={(e) =>
                              updateField(
                                index,
                                "type",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                          >
                            {fieldTypes.map(
                              (type) => (
                                <option
                                  key={
                                    type.value
                                  }
                                  value={
                                    type.value
                                  }
                                >
                                  {
                                    type.label
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* FIELD NAME */}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Field Name
                          </label>

                          <input
                            type="text"
                            value={
                              field.name ||
                              ""
                            }
                            onChange={(e) =>
                              updateField(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="fullName"
                          />
                        </div>

                        {/* PLACEHOLDER */}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Placeholder
                          </label>

                          <input
                            type="text"
                            value={
                              field.placeholder ||
                              ""
                            }
                            onChange={(e) =>
                              updateField(
                                index,
                                "placeholder",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="Enter your full name"
                          />
                        </div>

                      </div>

                      {/* REQUIRED */}

                      <div className="mt-4 flex items-center">

                        <input
                          type="checkbox"
                          checked={Boolean(
                            field.required
                          )}
                          onChange={(e) =>
                            updateField(
                              index,
                              "required",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />

                        <label className="ml-2 text-sm text-gray-700">
                          Required field
                        </label>

                      </div>

                      {/* OPTIONS */}

                      {[
                        "select",
                        "radio",
                        "checkbox",
                      ].includes(
                        field.type
                      ) && (
                        <div className="mt-5">

                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Options
                          </label>

                          <input
                            type="text"
                            value={
                              Array.isArray(
                                field.options
                              )
                                ? field.options.join(
                                    ", "
                                  )
                                : ""
                            }
                            onChange={(e) =>
                              updateField(
                                index,
                                "options",
                                e.target.value
                                  .split(",")
                                  .map(
                                    (option) =>
                                      option.trim()
                                  )
                                  .filter(
                                    Boolean
                                  )
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                            placeholder="Option 1, Option 2, Option 3"
                          />

                          <p className="mt-1 text-xs text-gray-400">
                            Separate options with commas.
                          </p>

                        </div>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default FormBuilder;

