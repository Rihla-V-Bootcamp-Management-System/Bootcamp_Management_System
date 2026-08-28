import { useEffect, useState } from "react";
import { Save, Info } from "lucide-react";
import apiClient from "../../services/apiClient";

function About() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAbout = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get("/about/admin");

        setTitle(response.data?.title || "");
        setDescription(response.data?.description || "");
        setPublished(response.data?.published !== false);
      } catch (error) {
        console.error("LOAD ABOUT ERROR:", error);

        if (error.response?.status === 404) {
          setTitle("About Rihla V Bootcamp");
          setDescription(
            "Rihla V Bootcamp is a summer bootcamp designed to help students develop technical skills, practical experience, and professional confidence."
          );
          setPublished(true);
        } else {
          setError(
            error.response?.data?.message ||
              "Failed to load About information."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setError("Title and description are required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      let response;

      try {
        response = await apiClient.patch("/about", {
          title: trimmedTitle,
          description: trimmedDescription,
          published,
        });
      } catch (error) {
        if (error.response?.status === 404) {
          response = await apiClient.post("/about", {
            title: trimmedTitle,
            description: trimmedDescription,
            published,
          });
        } else {
          throw error;
        }
      }

      setTitle(response.data?.about?.title || trimmedTitle);
      setDescription(
        response.data?.about?.description || trimmedDescription
      );
      setPublished(
        response.data?.about?.published !== false
      );

      setMessage("About information saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("SAVE ABOUT ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save About information."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading About information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500">
              WEBSITE CONTENT
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[#071629]">
              About
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage the About section displayed on the public landing page.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1769e0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2878ed] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#071629]">
              <Info size={20} />
              About Section
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              This content will be shown to visitors on the landing page.
            </p>
          </div>

          <div className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter About title"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter information about the bootcamp"
                rows={8}
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                Publish this About section
              </span>
            </label>

          </div>
        </section>

      </div>
    </div>
  );
}

export default About;