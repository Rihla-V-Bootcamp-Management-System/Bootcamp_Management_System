import { Link } from "react-router-dom";

function Navbar({ onLogin, onRegister }) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#06152d]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

       
        <Link to="/" className="flex items-center gap-3">
        
          <div>
            <h1 className="font-serif text-lg font-bold text-white">
              ASTU MSJ
            </h1>
            <p className="text-xs tracking-wider text-[#d8a84e]">
              SUMMER BOOTCAMP
            </p>
          </div>
        </Link>

        
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="font-medium text-white transition hover:text-[#d8a84e]"
          >
            Home
          </Link>

          <a
            href="#about"
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
       <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="hidden rounded-md px-4 py-2 font-medium text-gray-200 transition hover:text-white sm:block"
          >
            Login
          </button>

          <button
            onClick={onRegister}
            className="rounded-md bg-[#1769e0] px-5 py-2.5 font-semibold text-white transition hover:bg-[#2878ed]"
          >
            Register
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;