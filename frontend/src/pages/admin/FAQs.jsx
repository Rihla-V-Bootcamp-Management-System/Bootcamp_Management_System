import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import apiClient from "../../services/apiClient";

function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [published, setPublished] = useState(true);

  const loadFAQs = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get("/faqs/admin");

      setFaqs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("LOAD FAQ ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setPublished(true);
    setEditingFaq(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setQuestion(faq.question || "");
    setAnswer(faq.answer || "");
    setPublished(faq.published !== false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    if (!trimmedQuestion || !trimmedAnswer) {
      toast.error("Question and answer are required.");
      return;
    }

    try {
      setSaving(true);

      if (editingFaq) {
        const response = await apiClient.patch(
          `/faqs/${editingFaq._id}`,
          {
            question: trimmedQuestion,
            answer: trimmedAnswer,
            published,
          }
        );

        const updatedFaq = response.data?.faq;

        if (updatedFaq) {
          setFaqs((currentFaqs) =>
            currentFaqs.map((faq) =>
              faq._id === updatedFaq._id
                ? updatedFaq
                : faq
            )
          );
        } else {
          await loadFAQs();
        }
      } else {
        const response = await apiClient.post(
          "/faqs",
          {
            question: trimmedQuestion,
            answer: trimmedAnswer,
            published,
          }
        );

        const newFaq = response.data?.faq;

        if (newFaq) {
          setFaqs((currentFaqs) => [
            newFaq,
            ...currentFaqs,
          ]);
        } else {
          await loadFAQs();
        }
      }

      toast.success(editingFaq ? "FAQ updated successfully!" : "FAQ created successfully!");
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("SAVE FAQ ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faq) => {
    try {
      setDeletingId(faq._id);

      await apiClient.delete(`/faqs/${faq._id}`);
      toast.success("FAQ deleted successfully");

      setFaqs((currentFaqs) =>
        currentFaqs.filter(
          (item) => item._id !== faq._id
        )
      );
    } catch (error) {
      console.error("DELETE FAQ ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to delete FAQ.");
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublished = async (faq) => {
    try {
      setUpdatingId(faq._id);

      const response = await apiClient.patch(
        `/faqs/${faq._id}`,
        {
          published: !faq.published,
        }
      );

      const updatedFaq = response.data?.faq;

      if (updatedFaq) {
        setFaqs((currentFaqs) =>
          currentFaqs.map((item) =>
            item._id === updatedFaq._id
              ? updatedFaq
              : item
          )
        );
      } else {
        setFaqs((currentFaqs) =>
          currentFaqs.map((item) =>
            item._id === faq._id
              ? {
                  ...item,
                  published: !item.published,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "UPDATE FAQ STATUS ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update FAQ status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Manage the questions and answers shown on the public website.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#185848]"
          >
            <Plus size={18} />
            Add FAQ
          </button>

        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#15253f] dark:bg-[#0b1528] shadow-sm">

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500 dark:text-slate-400">
              Loading FAQs...
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-12 text-center">

              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                No FAQs yet
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                Add the first frequently asked question.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Add FAQ
              </button>

            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#15253f]">

              {faqs.map((faq) => (
                <div
                  key={faq._id}
                  className="p-6 transition hover:bg-slate-50 dark:bg-[#070e1b]"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0 flex-1">

                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {faq.question}
                      </h3>

                      <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600 dark:text-slate-300">
                        {faq.answer}
                      </p>

                      <div className="mt-4">

                        <button
                          type="button"
                          onClick={() =>
                            togglePublished(faq)
                          }
                          disabled={
                            updatingId === faq._id
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            faq.published
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {updatingId === faq._id
                            ? "Updating..."
                            : faq.published
                            ? "Published"
                            : "Hidden"}
                        </button>

                      </div>

                    </div>

                    <div className="flex shrink-0 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(faq)
                        }
                        disabled={
                          deletingId === faq._id
                        }
                        className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-[#15253f] px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 transition hover:bg-gray-100 dark:bg-[#070e1b] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(faq)
                        }
                        disabled={
                          deletingId === faq._id
                        }
                        className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />

                        {deletingId === faq._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">

          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0b1528] shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#15253f] px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingFaq
                    ? "Edit FAQ"
                    : "Add FAQ"}
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  This information can appear on the public FAQ section.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 dark:bg-[#070e1b] hover:text-gray-700 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Question
                </label>

                <input
                  type="text"
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  placeholder="Enter the frequently asked question"
                  className="w-full rounded-lg border border-gray-200 dark:border-[#15253f] px-4 py-3 text-sm outline-none transition focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Answer
                </label>

                <textarea
                  value={answer}
                  onChange={(e) =>
                    setAnswer(e.target.value)
                  }
                  placeholder="Enter the answer"
                  rows={6}
                  className="w-full resize-none rounded-lg border border-gray-200 dark:border-[#15253f] px-4 py-3 text-sm outline-none transition focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
                  required
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) =>
                    setPublished(e.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                  Publish this FAQ
                </span>

              </label>

              <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-[#15253f] pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 dark:border-[#15253f] px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#070e1b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? editingFaq
                      ? "Saving Changes..."
                      : "Adding FAQ..."
                    : editingFaq
                    ? "Save Changes"
                    : "Add FAQ"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default FAQs;