import hero from "../assets/Hero.png";

function Hero({ onRegistered}) {
  return (
    <section
      className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#06152d] bg-cover bg-center"
      style={{ backgroundImage: `url(${hero})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#06152d]/45" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-8 py-16">
        <div className="max-w-2xl">

          {/* Arabic text */}
          <p className="mb-5 text-2xl font-serif text-[#d8a84e] md:text-3xl">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Small heading */}
          <div className="mb-5 flex items-center gap-3">
            <p className="text-sm font-semibold tracking-[0.15em] text-[#d8a84e]">
              ASTU MSJ SUMMER BOOTCAMP
            </p>

            <span className="h-px w-10 bg-[#d8a84e]" />
          </div>

          {/* Main heading */}
          <h1 className="max-w-2xl font-serif text-5xl font-bold leading-[1.05] text-white md:text-6xl lg:text-7xl">
            Learn.
            <span className="text-[#d8a84e]">Build.</span>
            <br />
            Grow Together.
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-xl text-base leading-7 text-gray-200 md:text-lg">
            Develop practical skills, build real projects, and grow
            together through knowledge, faith, and community.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">

            <button
              onClick={onRegistered}
              className="rounded-md bg-[#1769e0] px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-[#2878ed]"
            >
              Join the Bootcamp
              <span className="ml-3">→</span>
            </button>

            <a
              href="#about"
              className="rounded-md border border-white/60 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Learn More
              <span className="ml-3">⌄</span>
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;