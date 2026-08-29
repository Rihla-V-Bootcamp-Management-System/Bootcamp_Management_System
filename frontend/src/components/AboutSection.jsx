import { Info, Sparkles, Code2, Cpu, HeartHandshake, CheckCircle2, ShieldCheck, Terminal, Award } from "lucide-react";

function AboutSection({ about }) {
  const title =
    about?.title || "Empowering Future Tech Leaders & Software Engineers";
  const description =
    about?.description ||
    "The ASTU MSJ Summer Bootcamp is an intensive learning program designed to equip students with hands-on software engineering, competitive programming, and collaborative problem-solving skills.\n\nThrough structured learning modules, daily hands-on tasks, and direct mentorship from experienced engineers, participants build real-world projects, hone competitive coding abilities, and prepare for top-tier technology careers.";

  const highlights = [
    {
      icon: Code2,
      title: "Real-World Engineering",
      desc: "Learn modern full-stack development through production architectures, clean code patterns, and daily hands-on builds.",
    },
    {
      icon: Cpu,
      title: "Algorithmic Problem Solving",
      desc: "Sharpen competitive programming skills, data structure mastery, and algorithmic complexity decomposition.",
    },
    {
      icon: HeartHandshake,
      title: "Faith, Ethics & Community",
      desc: "Grounded in shared Islamic values, fostering collaborative brotherhood, mutual growth, and lifelong mentorship.",
    },
  ];

  const stats = [
    { value: "8 Weeks", label: "Intensive Guided Program" },
    { value: "7 Tracks", label: "End-to-End Roadmap" },
    { value: "1-on-1", label: "Dedicated Mentor Reviews" },
    { value: "100%", label: "Hands-On Real Projects" },
  ];

  return (
    <section
      id="about"
      className="relative bg-[#06152d] px-6 py-28 text-white overflow-hidden"
    >
      {/* BACKGROUND ACCENTS */}
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#1f6f5b]/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full bg-[#d8a84e]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* TOP BADGE & TITLE */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8a84e]/40 bg-[#d8a84e]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#d8a84e] shadow-sm">
            <Sparkles size={14} className="text-[#d8a84e]" />
            ABOUT OUR BOOTCAMP
          </div>

          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
            {title}
          </h2>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-300 sm:text-base">
            {description}
          </p>
        </div>

        {/* 3 CORE PILLARS */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/10 bg-[#09152a] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#d8a84e]/50 hover:shadow-xl hover:shadow-[#1f6f5b]/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d8a84e]/40 bg-[#d8a84e]/10 text-[#d8a84e] transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 font-serif text-lg font-bold text-white group-hover:text-[#d8a84e] transition-colors">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* METRICS STRIP */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#09152a] via-[#0b1b36] to-[#09152a] p-6 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="pt-4 md:pt-0">
                <p className="font-serif text-3xl font-bold text-[#d8a84e] lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
