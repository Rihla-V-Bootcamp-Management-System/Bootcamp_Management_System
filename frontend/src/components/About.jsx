import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import apiClient from "../services/apiClient";

function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const response = await apiClient.get("/about");

        setAbout(response.data);
      } catch (error) {
        console.error("LOAD PUBLIC ABOUT ERROR:", error);
        setAbout(null);
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  if (loading || !about) {
    return null;
  }

  return (
    <section
      id="about"
      className="scroll-mt-24 bg-[#06152d] px-6 py-20 text-white"
    >
      <div className="mx-auto max-w-6xl">

        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Info size={20} />
            </div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
              About Us
            </p>
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {about.title}
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">
            {about.description}
          </p>
        </div>

      </div>
    </section>
  );
}

export default About;