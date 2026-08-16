import loginImage from "../assets/login-image.png";
import Tracks from "../components/Tracks";
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";

function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  return (
    <main className="min-h-screen bg-[#06152d] text-white">

      <Navbar
        onLogin={() => {
          setAuthMode("login");
          setLoginOpen(true);
        }}
        onRegister={() => {
          setAuthMode("register");
          setLoginOpen(true);
        }}
      />

      <Hero />
      <Tracks/>

      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="relative w-[90%] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Close button */}
            <button
              onClick={() => setLoginOpen(false)}
              className="absolute right-5 top-5 z-20 text-xl text-gray-500 hover:text-gray-900"
            >
              ✕
            </button>

            <div className="grid min-h-[550px] md:grid-cols-2">

              {/* Left image */}
              <div className="relative hidden overflow-hidden md:block">

                <img
                  src={loginImage}
                  alt="ASTU MSJ Bootcamp"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-5 rounded-3xl border-4 border-white/70" />

                <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
                  <p className="mb-2 mt-4 font-medium">
                    ASTU MSJ SUMMER BOOTCAMP
                  </p>

                  <h2 className="text-2xl font-extrabold leading-tight">
                    Learn. Build. Grow. Together.
                  </h2>
                </div>

              </div>

              {/* Authentication */}
              <div className="p-10">

                <div className="mb-8 flex rounded-lg bg-gray-100 p-1">

                  <button
                    onClick={() => setAuthMode("login")}
                    className={`flex-1 rounded-md py-2.5 font-medium transition ${
                      authMode === "login"
                        ? "rounded-full bg-gray-900 text-white shadow"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Login
                  </button>

                  <button
                    onClick={() => setAuthMode("register")}
                    className={`flex-1 rounded-md py-2.5 font-medium transition ${
                      authMode === "register"
                        ? "rounded-full bg-gray-900 text-white shadow"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Register
                  </button>

                </div>

                <div className="w-full">
                  {authMode === "login" ? (
                    <Login
                      onRegister={() => setAuthMode("register")}
                    />
                  ) : (
                    <Register
                      onLogin={() => setAuthMode("login")}
                    />
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