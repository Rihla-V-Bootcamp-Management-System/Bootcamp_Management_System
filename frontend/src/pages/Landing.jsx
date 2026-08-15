import { Link } from "react-router-dom";
import loginImage from "../assets/login-image.png";
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      <header className="bg-gray-900 border-b">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

          <Link to="/" className="text-2xl font-bold text-white">
            ASTU MSJ
          </Link>

          <nav className="hidden md:flex items-center  gap-10">

            <a
              href="#about"
              className="text-gray-600 hover:text-white"
            >
              About
            </a>

            <a
              href="#tracks"
              className="text-gray-600 hover:text-white"
            >
              Tracks
            </a>

            <a
              href="#mentors"
              className="text-gray-600 hover:text-white"
            >
              Mentors
            </a>

            <a
              href="#faq"
              className="text-gray-600 hover:text-white"
            >
              FAQ
            </a>

            <button
              onClick={() => {
              setAuthMode("login");
              setLoginOpen(true);
              }}
              className="text-white hover:text-gray-600 font-medium"
            >
              Login
            </button>
             <button
           onClick={() => {
           setAuthMode("register");
          setLoginOpen(true);
          }}
         className="bg-yellow-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800"
         >
        Get Started
       </button>
           
          </nav>

        </div>
      </header>
      {loginOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

    <div className="relative w-[90%] max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl">

  {/* Close button */}
  <button
    onClick={() => setLoginOpen(false)}
    className="absolute top-5 right-5 z-20 text-gray-500 hover:text-gray-900 text-xl"
  >
    ✕
  </button>

   {/* Modal content */}
<div className="grid md:grid-cols-2 min-h-[550px]">

 {/* Left side - Image */}
<div className="relative hidden md:block overflow-hidden">

  <img
    src={loginImage}
    alt="ASTU MSJ Bootcamp"
    className="absolute inset-0 w-full h-full object-cover"
  />
  <div className="absolute inset-5 
  border-4 rounded-3xl border-white/70 pointer-events-none"></div>
  {/* Text over image */}
  <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
       <p className="mt-4 mb-2 font-medium">
     ASTU MSJ SUMMER BOOTCAMP
    </p>

    <h2 className="text-2xl font-extrabold leading-tight">
      Learn.  Build. Grow. Together.
    </h2>

   
  </div>

</div>

  {/* Right side */}
  <div className="p-10">

    {/* Login / Register buttons */}
    <div className="flex rounded-lg bg-gray-100 p-1 mb-8">

      <button
        onClick={() => setAuthMode("login")}
        className={`flex-1 py-2.5 rounded-md font-medium transition ${
          authMode === "login"
            ? "bg-gray-900 rounded-full text-white shadow "
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Login
      </button>

      <button
        onClick={() => setAuthMode("register")}
        className={`flex-1 py-2.5 rounded-md font-medium transition ${
          authMode === "register"
            ? "bg-gray-900 text-white shadow rounded-full"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Register
      </button>

    </div>

    {/* Form */}
    <div className="w-full">
      {authMode === "login" ? (
        <Login onRegister={() => setAuthMode("register")} />
      ) : (
        <Register onLogin={() => setAuthMode("login")} />
      )}
    </div>

  </div>

</div>
    

  

</div>

  </div>
)}
    </main>
  );
}

export default Landing;
