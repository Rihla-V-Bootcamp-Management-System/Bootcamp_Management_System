import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Navbar({ onLogin, onRegister }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#06152d]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <div>
            <h1 className="font-serif text-lg font-bold text-white sm:text-xl">
              ASTU MSJ
            </h1>
            <p className="text-[10px] tracking-wider text-[#d8a84e] sm:text-xs">
              SUMMER BOOTCAMP
            </p>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="font-medium text-white transition hover:text-[#d8a84e]"
          >
            Home
          </Link>

          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="font-medium text-gray-300 transition hover:text-[#d8a84e]"
          >
            About
          </a>

          <a
            href="#tracks"
            className="font-medium text-gray-300 transition hover:text-[#d8a84e]"
          >
            Tracks
          </a>

          <a
            href="#mentors"
            className="font-medium text-gray-300 transition hover:text-[#d8a84e]"
          >
            Mentors
          </a>

          <a
            href="#faq"
            className="font-medium text-gray-300 transition hover:text-[#d8a84e]"
          >
            FAQ
          </a>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onLogin}
            className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 sm:border-transparent sm:px-4 sm:py-2 sm:text-sm sm:font-medium sm:text-gray-200 sm:hover:text-white"
          >
            Login
          </button>

          <button
            type="button"
            onClick={onRegister}
            className="rounded-md bg-[#1769e0] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2878ed] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Apply now
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-1 rounded-md p-1.5 text-gray-300 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>


      {/* MOBILE NAV DROPDOWN */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#06152d] px-6 py-4 md:hidden">
          <div className="flex flex-col space-y-3 font-medium text-gray-300">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#d8a84e]"
            >
              Home
            </Link>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-[#d8a84e]"
            >
              About
            </a>
            <a
              href="#tracks"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#d8a84e]"
            >
              Tracks
            </a>
            <a
              href="#mentors"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#d8a84e]"
            >
              Mentors
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#d8a84e]"
            >
              FAQ
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;