
import { Star, Plus } from "lucide-react";
function Tracks() {
  const tracks = [
    {
      number: "01",
      title: "HTML / CSS",
      description:
        "Semantic markup and layout foundations for the modern web.",
      category: "FOUNDATIONS",
    },
    {
      number: "02",
      title: "JavaScript",
      description:
        "Core language fundamentals, DOM interaction, and logic building.",
      category: "FOUNDATIONS",
    },
    {
      number: "03",
      title: "React",
      description:
        "Component-driven interfaces, state, and client-side routing.",
      category: "FRONTEND",
    },
    {
      number: "04",
      title: "Node.js",
      description:
        "Server-side JavaScript and the runtime behind the API layer.",
      category: "BACKEND",
    },
    {
      number: "05",
      title: "Express.js",
      description:
        "Building REST APIs, middleware, and route structure.",
      category: "BACKEND",
    },
    {
      number: "06",
      title: "MongoDB",
      description:
        "Document modeling and data persistence with Mongoose.",
      category: "DATABASE",
    },
    {
      number: "07",
      title: "Git / GitHub",
      description:
        "Version control, collaboration, and submission workflow.",
      category: "TOOLING",
    },
  ];

  return (
    <section
      id="tracks"
      className="bg-[#f7f5ef] px-6 py-24 text-[#06152d]"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section heading */}
        <div className="mb-16 text-center">

         <div className="mb-4 flex justify-center">
            <Star
               size={16}
               strokeWidth={1.5}
               className="text-[#c89432]"
                />
               </div>

          <p className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#98752d]">
            CURRICULUM JOURNEY
          </p>

          <h2 className="font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
            Seven tracks, one continuous path.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#667085]">
            The topics mentors track progress against throughout the bootcamp.
          </p>

        </div>

        {/* Tracks */}
        <div className="mx-auto max-w-6xl">

          {/* First row */}
          <div className="grid grid-cols-1 md:grid-cols-4">

            {tracks.slice(0, 4).map((track, index) => (
              <div
                key={track.number}
                className="relative pb-12 md:pb-14"
              >

                {/* Connecting line */}
                {index < 3 && (
                  <div className="absolute left-[76px] right-0 top-[15px] hidden border-t border-dashed border-[#c89432] md:block" />
                )}

                {/* Number */}
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#c89432] bg-[#f7f5ef] text-[10px] font-bold text-[#06152d]">
                  {track.number}
                </div>

                {/* Content */}
                <div className="mt-4 max-w-[210px]">
                  <h3 className="font-serif text-sm font-bold text-[#06152d]">
                    {track.title}
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-4 text-[#667085]">
                    {track.description}
                  </p>

                  <p className="mt-2 text-[8px] font-medium tracking-[0.18em] text-[#a2a7b0]">
                    {track.category}
                  </p>
                </div>

              </div>
            ))}

          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 md:grid-cols-4">

            {tracks.slice(4).map((track, index) => (
              <div
                key={track.number}
                className="relative"
              >

                {/* Connecting line */}
                {index < 3 && (
                  <div className="absolute left-[76px] right-0 top-[15px] hidden border-t border-dashed border-[#c89432] md:block" />
                )}

                {/* Number */}
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#c89432] bg-[#f7f5ef] text-[10px] font-bold text-[#06152d]">
                  {track.number}
                </div>

                {/* Content */}
                <div className="mt-4 max-w-[210px]">
                  <h3 className="font-serif text-sm font-bold text-[#06152d]">
                    {track.title}
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-4 text-[#667085]">
                    {track.description}
                  </p>

                  <p className="mt-2 text-[8px] font-medium tracking-[0.18em] text-[#a2a7b0]">
                    {track.category}
                  </p>
                </div>

              </div>
            ))}

            {/* Progress */}
            <div className="relative">

             <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[#bfc2c7] bg-[#f7f5ef]">
                 <Plus
                  size={14}
                  strokeWidth={1.5}
                  className="text-[#9ca3af]"
                    />
                </div>

              <div className="mt-4 max-w-[210px]">
                <h3 className="font-serif text-sm font-bold text-[#9ca3af]">
                  Your Progress
                </h3>

                <p className="mt-1.5 text-[11px] leading-4 text-[#b0b3b8]">
                  Mentors track each topic&apos;s status against these seven
                  tracks.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Tracks;