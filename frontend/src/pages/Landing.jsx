import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

import Tracks from "../components/Tracks";
import FAQ from "../components/FAQ";
import Mentors from "../components/Mentors";
import AboutSection from "../components/AboutSection";
import Login from "./Login";
import Register from "./Register";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import apiClient from "../services/apiClient";

const DEFAULT_ABOUT = {
  title: "Empowering Future Tech Leaders & Software Engineers",
  description:
    "The ASTU MSJ Summer Bootcamp is an intensive learning program designed to equip students with hands-on software engineering, competitive programming, and collaborative problem-solving skills.\n\nThrough structured learning modules, daily hands-on tasks, and direct mentorship from experienced engineers, participants build real-world projects, hone competitive coding abilities, and prepare for top-tier technology careers.",
};

function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [applicationClosed, setApplicationClosed] = useState(false);
  const [applicationError, setApplicationError] = useState("");

  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [aboutLoading, setAboutLoading] = useState(false);

  useEffect(() => {
    if (loginOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setLoginOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [loginOpen]);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        setAboutLoading(true);

        const response = await apiClient.get("/about");

        if (response.data && response.data.title) {
          setAbout(response.data);
        } else {
          setAbout(DEFAULT_ABOUT);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("LOAD ABOUT ERROR:", error);
        }
        setAbout(DEFAULT_ABOUT);
      } finally {
        setAboutLoading(false);
      }
    };

    loadAbout();
  }, []);

  const handleApply = async () => {
    try {
      setCheckingApplication(true);
      setApplicationClosed(false);
      setApplicationError("");

      const response = await apiClient.get(
        "/registration-settings"
      );

      if (response.data && response.data.registrationOpen === false) {
        setApplicationClosed(true);
        return;
      }

      setApplicationOpen(true);
    } catch (error) {
      console.error(
        "CHECK APPLICATION STATUS ERROR:",
        error
      );
      // Open application modal so user can proceed
      setApplicationOpen(true);
    } finally {
      setCheckingApplication(false);
    }
  };

  const currentAbout = about || DEFAULT_ABOUT;

  return (
    <main className="min-h-screen bg-[#f8f9fc] dark:bg-[#050b14] text-white">

      <Navbar
        onLogin={() => setLoginOpen(true)}
        onRegister={handleApply}
      />

      <Hero
        onRegistered={handleApply}
      />

      <AboutSection about={currentAbout} />

      <Tracks />

      <Mentors />

      <FAQ />

      {loginOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setLoginOpen(false)}
        >
          <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
            <div
              className="relative w-full max-w-[1100px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                className="absolute -right-2 -top-2 sm:-right-4 sm:-top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#0b1528] text-gray-700 dark:text-slate-200 shadow-2xl transition hover:scale-105 hover:bg-gray-100 dark:bg-[#070e1b] hover:text-black"
                title="Close"
              >
                <X size={20} />
              </button>

              <Login isModal={true} onClose={() => setLoginOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {checkingApplication && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="rounded-xl bg-white dark:bg-[#0b1528] px-8 py-6 text-center text-slate-900 dark:text-white shadow-2xl">

            <p className="text-sm font-medium">
              Checking application status...
            </p>

          </div>

        </div>
      )}

      {applicationClosed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0b1528] p-8 text-center text-slate-900 dark:text-white shadow-2xl">

            <h2 className="text-2xl font-bold">
              Application is currently closed
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-slate-300">
              Registration is not available at the moment.
              Please check back when the application period
              opens.
            </p>

            <button
              type="button"
              onClick={() => setApplicationClosed(false)}
              className="mt-6 rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f6f5b] hover:bg-[#185848]"
            >
              Close
            </button>

          </div>

        </div>
      )}

      {applicationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0b1528] p-8 text-center text-slate-900 dark:text-white shadow-2xl">

            <h2 className="text-2xl font-bold">
              Unable to check application
            </h2>

            <p className="mt-3 text-sm text-red-600">
              {applicationError}
            </p>

            <button
              type="button"
              onClick={() => setApplicationError("")}
              className="mt-6 rounded-lg bg-[#1f6f5b] hover:bg-[#185848] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f6f5b] hover:bg-[#185848]"
            >
              Close
            </button>

          </div>

        </div>
      )}


      {applicationOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setApplicationOpen(false)}
        >
          <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
            <div
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white dark:bg-[#0b1528] p-6 sm:p-8 text-slate-900 dark:text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setApplicationOpen(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-[#070e1b] text-gray-600 dark:text-slate-300 transition hover:bg-gray-200 hover:text-black"
                title="Close"
              >
                <X size={18} />
              </button>

              <div className="pt-2">
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