import Tracks from "../components/Tracks";
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";

function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#06152d] text-white">

      {/* ================= NAVBAR ================= */}

      <Navbar
        onLogin={() => setLoginOpen(true)}
        onRegister={() => {
          setApplicationOpen(true);
        }}
      />

      {/* ================= HERO ================= */}

      <Hero
        onRegistered={() => setApplicationOpen(true)}
      />

      {/* ================= TRACKS ================= */}

      <Tracks />

      {/* ================================================= */}
      {/* LOGIN MODAL */}
      {/* ================================================= */}

      {loginOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">

          <div className="min-h-screen flex items-center justify-center p-6">

            <div className="relative w-full max-w-[1200px]">

              {/* CLOSE BUTTON */}

              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                className="absolute -right-3 -top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-gray-500 shadow-lg transition hover:bg-gray-100 hover:text-gray-900"
              >
                ✕
              </button>

              {/* LOGIN PAGE */}

              <Login />

            </div>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* REGISTER / APPLICATION MODAL */}
      {/* ================================================= */}

      {applicationOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">

          <div className="min-h-screen flex items-center justify-center p-6">

            <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 text-gray-900 shadow-2xl">

              {/* CLOSE BUTTON */}

              <button
                type="button"
                onClick={() => setApplicationOpen(false)}
                className="absolute right-5 top-5 text-xl text-gray-500 hover:text-gray-900"
              >
                ✕
              </button>

              {/* HEADER */}

              <div className="pr-8">

                <h1 className="text-3xl font-bold">
                  Bootcamp Application
                </h1>

                <p className="mt-2 text-gray-600">
                  Please complete the application form below.
                </p>

              </div>

              {/* REGISTER FORM */}

              <div className="mt-8">
                <Register />
              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default Landing;