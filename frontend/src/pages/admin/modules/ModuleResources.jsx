import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import apiClient from "../../../services/apiClient";

function ModuleResources() {
  const { moduleId } = useParams();

  const [module, setModule] = useState(null);
  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "link",
    url: "",
    fileUrl: "",
    order: 0,
  });

  // =========================================================
  // LOAD MODULE
  // =========================================================

  const loadModule = async () => {
    try {
      const response = await apiClient.get(
        `/modules/${moduleId}`
      );

      console.log(
        "MODULE RESPONSE:",
        response.data
      );

      setModule(response.data.module);
    } catch (err) {
      console.error(
        "LOAD MODULE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load module"
      );
    }
  };

  // =========================================================
  // LOAD RESOURCES
  // =========================================================

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        `/module-resources/module/${moduleId}`
      );

      console.log(
        "RESOURCES RESPONSE:",
        response.data
      );

      setResources(
        response.data.resources || []
      );
    } catch (err) {
      console.error(
        "LOAD RESOURCES ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load resources"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!moduleId) return;

    loadModule();
    loadResources();
  }, [moduleId]);

  // =========================================================
  // CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "link",
      url: "",
      fileUrl: "",
      order: 0,
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError(
        "Resource title is required."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        moduleId,
        title: form.title.trim(),
        description:
          form.description.trim(),
        type: form.type,
        url: form.url.trim(),
        fileUrl: form.fileUrl.trim(),
        order: Number(form.order) || 0,
      };

      if (editingId) {

        await apiClient.put(
          `/module-resources/${editingId}`,
          payload
        );

        setSuccess(
          "Resource updated successfully."
        );

      } else {

        await apiClient.post(
          "/module-resources",
          payload
        );

        setSuccess(
          "Resource created successfully."
        );
      }

      resetForm();

      await loadResources();

    } catch (err) {
      console.error(
        "SAVE RESOURCE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save resource"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (resource) => {
    setEditingId(resource._id);

    setForm({
      title: resource.title || "",
      description:
        resource.description || "",
      type: resource.type || "link",
      url: resource.url || "",
      fileUrl: resource.fileUrl || "",
      order: resource.order || 0,
    });

    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (resourceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await apiClient.delete(
        `/module-resources/${resourceId}`
      );

      setSuccess(
        "Resource deleted successfully."
      );

      await loadResources();

    } catch (err) {
      console.error(
        "DELETE RESOURCE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete resource"
      );
    }
  };

  // =========================================================
  // TYPE LABEL
  // =========================================================

  const getTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Video";

      case "pdf":
        return "PDF";

      case "document":
        return "Document";

      case "file":
        return "File";

      default:
        return "Link";
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* BACK */}

      <Link
        to={
          module?.batchId?._id
            ? `/admin/modules?batchId=${module.batchId._id}`
            : "/admin/modules"
        }
        className="inline-flex text-sm font-medium text-[#1D3866] hover:underline"
      >
        ← Back to Modules
      </Link>

      {/* HEADER */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
              Module
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#071629]">
              {module?.title ||
                "Loading module..."}
            </h1>

            {module?.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52627A]">
                {module.description}
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);
              setEditingId(null);
              setError("");
            }}
            className="w-fit rounded-lg bg-[#1D3866] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#162d52]"
          >
            {showForm
              ? "Close Form"
              : "+ Add Resource"}
          </button>

        </div>

      </div>

      {/* SUCCESS */}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            {success}
          </p>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* FORM */}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#E5E0D5] bg-white p-6 shadow-sm"
        >

          <h2 className="text-lg font-semibold text-[#071629]">
            {editingId
              ? "Edit Resource"
              : "Add Module Resource"}
          </h2>

          <p className="mt-1 text-sm text-[#8A96A8]">
            Add learning material for this module.
          </p>

          {/* TITLE */}

          <div className="mt-6">

            <label className="text-sm font-medium text-[#071629]">
              Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Introduction to HTML"
              className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
            />

          </div>

          {/* DESCRIPTION */}

          <div className="mt-5">

            <label className="text-sm font-medium text-[#071629]">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe this resource..."
              className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
            />

          </div>

          {/* TYPE + ORDER */}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div>

              <label className="text-sm font-medium text-[#071629]">
                Resource Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] bg-white px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
              >
                <option value="link">
                  Link
                </option>

                <option value="video">
                  Video
                </option>

                <option value="pdf">
                  PDF
                </option>

                <option value="document">
                  Document
                </option>

                <option value="file">
                  File
                </option>
              </select>

            </div>

            <div>

              <label className="text-sm font-medium text-[#071629]">
                Order
              </label>

              <input
                type="number"
                name="order"
                min="0"
                value={form.order}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
              />

            </div>

          </div>

          {/* URL */}

          <div className="mt-5">

            <label className="text-sm font-medium text-[#071629]">
              URL
            </label>

            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
            />

          </div>

          {/* FILE URL */}

          <div className="mt-5">

            <label className="text-sm font-medium text-[#071629]">
              File URL
            </label>

            <input
              type="text"
              name="fileUrl"
              value={form.fileUrl}
              onChange={handleChange}
              placeholder="File URL if applicable"
              className="mt-2 w-full rounded-lg border border-[#D9D5CB] px-4 py-3 text-sm outline-none focus:border-[#1D3866]"
            />

          </div>

          {/* BUTTONS */}

          <div className="mt-6 flex gap-3">

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#1D3866] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Resource"
                : "Create Resource"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-[#D9D5CB] px-5 py-2.5 text-sm font-medium text-[#52627A] hover:bg-[#F7F5EF]"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* RESOURCES */}

      <div className="rounded-xl border border-[#E5E0D5] bg-white shadow-sm">

        <div className="border-b border-[#E5E0D5] p-6">

          <h2 className="text-lg font-semibold text-[#071629]">
            Module Resources
          </h2>

          <p className="mt-1 text-sm text-[#8A96A8]">
            {resources.length} resource
            {resources.length === 1
              ? ""
              : "s"} available.
          </p>

        </div>

        <div className="p-6">

          {loading ? (

            <div className="py-10 text-center">
              <p className="text-sm text-[#8A96A8]">
                Loading resources...
              </p>
            </div>

          ) : resources.length === 0 ? (

            <div className="rounded-lg bg-[#F7F5EF] p-10 text-center">

              <div className="text-3xl">
                📚
              </div>

              <p className="mt-3 text-sm font-medium text-[#52627A]">
                No resources added yet.
              </p>

              <p className="mt-1 text-xs text-[#8A96A8]">
                Add the first resource for this module.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {resources.map(
                (resource, index) => (

                  <div
                    key={resource._id}
                    className="rounded-lg border border-[#E5E0D5] p-5"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2F7] text-sm font-bold text-[#1D3866]">
                          {index + 1}
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-base font-semibold text-[#071629]">
                              {resource.title}
                            </h3>

                            <span className="rounded-full bg-[#E4EFE9] px-3 py-1 text-xs font-medium text-[#35634F]">
                              {getTypeLabel(
                                resource.type
                              )}
                            </span>

                          </div>

                          {resource.description && (
                            <p className="mt-2 text-sm leading-6 text-[#52627A]">
                              {
                                resource.description
                              }
                            </p>
                          )}

                          {resource.url && (
                            <a
                              href={
                                resource.url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-block text-sm font-medium text-[#1D3866] hover:underline"
                            >
                              Open Resource →
                            </a>
                          )}

                          {!resource.url &&
                            resource.fileUrl && (
                              <a
                                href={
                                  resource.fileUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-block text-sm font-medium text-[#1D3866] hover:underline"
                              >
                                Open File →
                              </a>
                            )}

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              resource
                            )
                          }
                          className="rounded-lg border border-[#D9D5CB] px-3 py-2 text-sm font-medium text-[#52627A] hover:bg-[#F7F5EF]"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              resource._id
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default ModuleResources;