import { useEffect, useState } from "react";
import { Plus, Minus, Star } from "lucide-react";
import apiClient from "../services/apiClient";

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const response = await apiClient.get("/faqs");
        setFaqs(response.data || []);
      } catch (error) {
        console.error("LOAD FAQ ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <section
      id="faq"
      className="bg-[#06152d] px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-5xl">

        <div className="mb-14 text-center">

          <div className="mb-4 flex justify-center">
            <Star
              size={16}
              strokeWidth={1.5}
              className="text-[#d8a84e]"
            />
          </div>

          <p className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#d8a84e]">
            FREQUENTLY ASKED QUESTIONS
          </p>

          <h2 className="font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
            Questions students often ask.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-300">
            Find answers to common questions about the ASTU MSJ Summer Bootcamp.
          </p>

        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">
            Loading questions...
          </div>
        ) : faqs.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No frequently asked questions are available yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq._id}
                  className="border-b border-white/10 last:border-b-0"
                >

                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left transition hover:bg-white/[0.04] md:px-8"
                  >

                    <span className="font-serif text-base font-semibold text-white md:text-lg">
                      {faq.question}
                    </span>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8a84e]/60 text-[#d8a84e]">
                      {isOpen ? (
                        <Minus size={16} strokeWidth={1.5} />
                      ) : (
                        <Plus size={16} strokeWidth={1.5} />
                      )}
                    </span>

                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 md:px-8 md:pb-7">

                      <div className="border-l border-[#d8a84e]/50 pl-5">

                        <p className="text-sm leading-7 text-gray-300">
                          {faq.answer}
                        </p>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}

export default FAQ;