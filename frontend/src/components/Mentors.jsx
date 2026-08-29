import { UserRound } from "lucide-react";

import sadamImage from "../assets/5798480543283351394_120.jpg";
import abdulazizImage from "../assets/5798480543283351407_121.jpg";
import nebiyuImage from "../assets/5888653338713197840_121.jpg";

function Mentors() {
  const founders = [
    {
      name: "Abdulaziz Isa",
      role: "co-Founder",
      bio: "Leading the vision and direction of the ASTU MSJ Summer Bootcamp.",
      image: sadamImage,
    },
    {
      name: "sadam Hussein",
      role: "Co-Founder",
      bio: "Supporting the development and growth of the bootcamp community.",
      image: abdulazizImage,
    },
    {
      name: "Nebiyu Musbah",
      role: "Co-Founder",
      bio: "Helping students build practical skills and achieve their goals.",
      image: nebiyuImage,
    },
  ];

  return (
    <section
      id="mentors"
      className="bg-[#06152d] px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">

        <div className="mb-16 text-center">

          <div className="mb-4 flex justify-center">
            <UserRound
              size={18}
              strokeWidth={1.5}
              className="text-[#d8a84e]"
            />
          </div>

          <p className="mb-3 text-[10px] font-medium tracking-[0.25em] text-[#d8a84e]">
            MEET THE FOUNDERS
          </p>

          <h2 className="font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
            The people behind the bootcamp.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-300">
            Meet the founders who built the vision, community, and learning
            experience behind the ASTU MSJ Summer Bootcamp.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

          {founders.map((founder, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#d8a84e]/50"
            >

              <div className="h-72 overflow-hidden bg-[#0b203d]">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-7">

                <p className="text-[10px] font-medium tracking-[0.2em] text-[#d8a84e]">
                  {founder.role}
                </p>

                <h3 className="mt-2 font-serif text-2xl font-bold">
                  {founder.name}
                </h3>

                <p className="mt-4 text-sm leading-6 text-gray-300">
                  {founder.bio}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Mentors;