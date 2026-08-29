import { useState, useMemo } from "react";
import { Sparkles, Code2, Cpu, Network, Database, Layers } from "lucide-react";

import sulamImg from "../assets/5798480543283351394_120.jpg";
import abdulazizImg from "../assets/5798480543283351407_121.jpg";
import nebiyuImg from "../assets/5888653338713197840_121.jpg";
import fatiyaImg from "../assets/13721973862246817.jpg";
import nihamImg from "../assets/19069998418494225.jpg";
import laluImg from "../assets/°❀•_˚⋆｡𖦹 •_𖤓.jpg";
import temkinImg from "../assets/pro.jpg";

function Mentors() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "AI Track", "Algorithm", "Network", "Update"];

  const mentorsList = [
    {
      id: "temkin",
      name: "Temkin Abdulmelik",
      badge: "Full-Stack Development",
      roleTitle: "FULL-STACK WEB DEVELOPMENT MENTOR",
      category: "AI Track",
      bio: "Dedicated instructor guiding students through modern full-stack web architecture, React component systems, and scalable backend services.",
      image: temkinImg,
      icon: Code2,
    },
    {
      id: "sulam",
      name: "Sulam Husen",
      badge: "Web Dev & Architecture",
      roleTitle: "LEAD WEB MENTOR & SYSTEM ARCHITECT",
      category: "AI Track",
      bio: "Software engineer & system architect focused on scalable modern web apps, clean code standards, and mentoring junior developers.",
      image: sulamImg,
      icon: Layers,
    },
    {
      id: "abdulaziz",
      name: "Abdulaziz Isa",
      badge: "Competitive Programming",
      roleTitle: "SENIOR MENTOR & COMPETITIVE PROGRAMMING LEAD",
      category: "Algorithm",
      bio: "Specialized in data structures, algorithmic complexity, ICPC problem-solving strategies, and dynamic programming.",
      image: abdulazizImg,
      icon: Cpu,
    },
    {
      id: "nebiyu",
      name: "Nebiyu Musbah",
      badge: "Full-Stack Development",
      roleTitle: "FULL-STACK WEB DEVELOPMENT MENTOR",
      category: "Network",
      bio: "Experienced developer dedicated to mentoring students on end-to-end full-stack web architecture and industry best practices.",
      image: nebiyuImg,
      icon: Network,
    },
    {
      id: "niham",
      name: "Niham Kassim",
      badge: "Artificial Intelligence",
      roleTitle: "LEAD INTELLIGENCE & AI DEVELOPMENT",
      category: "AI Track",
      bio: "Passionate about machine learning algorithms, intelligent automation, and guiding students on practical AI application architectures.",
      image: nihamImg,
      icon: Sparkles,
    },
    {
      id: "lalu",
      name: "Lalu Mohammed",
      badge: "Competitive Programming",
      roleTitle: "ALGORITHMS & LOGIC MENTOR",
      category: "Algorithm",
      bio: "Focusing on algorithmic thinking, mathematical problem decomposition, code optimization, and competitive coding logic.",
      image: laluImg,
      icon: Cpu,
    },
    {
      id: "fatiya",
      name: "Fatiya Yusuf",
      badge: "Backend & Databases",
      roleTitle: "BACKEND & DATABASE ARCHITECTURE MENTOR",
      category: "Update",
      bio: "Guiding students through database modeling, RESTful API design, data normalization, security best practices, and server architecture.",
      image: fatiyaImg,
      icon: Database,
    },
  ];

  const filteredMentors = useMemo(() => {
    if (activeCategory === "All") return mentorsList;
    return mentorsList.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  return (
    <section
      id="mentors"
      className="relative bg-[#050c18] px-6 py-28 text-white overflow-hidden"
    >
      {/* BACKGROUND GLOWS */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#1f6f5b]/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#d8a84e]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8a84e]/40 bg-[#d8a84e]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#d8a84e] shadow-sm">
            <Sparkles size={14} className="text-[#d8a84e]" />
            MEET YOUR MENTORS
          </div>

          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
            Learn from experienced engineers & mentors.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Dedicated instructors committed to guiding your learning journey with continuous code reviews,
            technical guidance, and real-world project experience.
          </p>

          {/* CATEGORY FILTER PILLS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#d8a84e] text-slate-950 shadow-lg shadow-[#d8a84e]/20 scale-105 font-bold"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* MENTORS GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#09152a] p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d8a84e]/50 hover:shadow-2xl hover:shadow-[#1f6f5b]/10"
            >
              <div>
                {/* PHOTO CONTAINER */}
                <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-900">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09152a] via-transparent to-transparent opacity-80" />

                  {/* FLOATING TOP-RIGHT BADGE */}
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-[#d8a84e]/40 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-[#d8a84e] backdrop-blur-md">
                    <Sparkles size={11} />
                    {mentor.badge}
                  </span>
                </div>

                {/* INFO */}
                <div className="px-2 pt-4 pb-2">
                  <p className="text-[10px] font-bold tracking-wider text-[#d8a84e] uppercase">
                    {mentor.roleTitle}
                  </p>

                  <h3 className="mt-1.5 font-serif text-lg font-bold text-white group-hover:text-[#d8a84e] transition-colors">
                    {mentor.name}
                  </h3>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-300/90 line-clamp-3">
                    {mentor.bio}
                  </p>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 px-2 pt-3 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-400 tracking-wide">
                  ASTU MSJ
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#d8a84e]">
                  Instructor
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Mentors;