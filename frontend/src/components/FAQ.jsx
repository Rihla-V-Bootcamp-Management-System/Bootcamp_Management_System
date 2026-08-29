import { useEffect, useState } from "react";
import { Plus, Minus, HelpCircle, Sparkles } from "lucide-react";
import apiClient from "../services/apiClient";

const DEFAULT_FAQS = [
  {
    _id: "faq-1",
    question: "How long does the bootcamp take?",
    answer:
      "The bootcamp runs for 8 intensive weeks during the summer. It consists of structured daily learning sessions, hands-on tasks, weekly code reviews, and an end-to-end capstone milestone project.",
  },
  {
    _id: "faq-2",
    question: "What will I learn in the bootcamp?",
    answer:
      "You will master full-stack software development including modern HTML/CSS, JavaScript (ES6+), React, Node.js, Express.js, MongoDB database modeling, Git/GitHub collaborative workflows, and competitive algorithmic problem solving.",
  },
  {
    _id: "faq-3",
    question: "How is my attendance and daily progress tracked?",
    answer:
      "Mentors take real-time attendance during every morning session. Your daily task submissions and curriculum topic statuses are tracked directly in the student dashboard.",
  },
  {
    _id: "faq-4",
    question: "Are absolute beginners eligible to apply?",
    answer:
      "Yes! The curriculum begins with solid foundation modules and ramps up smoothly with personal mentor support, dedicated Q&A sessions, and peer collaboration.",
  },
  {
    _id: "faq-5",
    question: "Will I receive an official certificate upon graduation?",
    answer:
      "Yes. Students who maintain satisfactory attendance and successfully complete all milestone modules and their final capstone project will be awarded an official ASTU MSJ Summer Bootcamp Certificate of Excellence.",
  },
];

function FAQ() {
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [openIndex, setOpenIndex] = useState(0); // First open by default for rich feel
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/faqs");
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setFaqs(response.data);
        }
      } catch (error) {
        console.warn("Using default FAQ dataset.");
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative bg-[#050b14] px-6 py-28 text-white overflow-hidden"
    >
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#1f6f5b]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8a84e]/40 bg-[#d8a84e]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#d8a84e]">
            <HelpCircle size={14} className="text-[#d8a84e]" />
            QUESTIONS & ANSWERS
          </div>

          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
            Questions students often ask.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
            Find answers to common questions about the ASTU MSJ Summer Bootcamp curriculum, requirements, and schedule.
          </p>
        </div>

        {/* ACCORDION */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq._id || index}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-[#d8a84e]/50 bg-[#09152a] shadow-xl shadow-black/20"
                    : "border-white/10 bg-[#071020]/70 hover:border-white/20 hover:bg-[#071020]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition"
                >
                  <span className="font-serif text-base font-bold text-white sm:text-lg">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 ${
                      isOpen
                        ? "border-[#d8a84e] bg-[#d8a84e] text-slate-950 rotate-180"
                        : "border-[#d8a84e]/50 text-[#d8a84e] hover:bg-[#d8a84e]/10"
                    }`}
                  >
                    {isOpen ? (
                      <Minus size={15} strokeWidth={2.5} />
                    ) : (
                      <Plus size={15} strokeWidth={2.5} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 px-6 pt-3 pb-6 animate-in fade-in-50 duration-200">
                    <p className="text-sm leading-relaxed text-slate-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;