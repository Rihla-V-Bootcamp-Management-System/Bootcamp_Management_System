import { useEffect, useState } from "react";
import { Info } from "lucide-react";

import Tracks from "../components/Tracks";
import FAQ from "../components/FAQ";
import Mentors from "../components/Mentors";
import Login from "./Login";
import Register from "./Register";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import apiClient from "../services/apiClient";

function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [applicationClosed, setApplicationClosed] = useState(false);
  const [applicationError, setApplicationError] = useState("");

  const [about, setAbout] = useState(null);
  const [aboutLoading, setAboutLoading] = useState(true);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        setAboutLoading(true);

        const response = await apiClient.get("/about");

        setAbout(response.data || null);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("LOAD ABOUT ERROR:", error);
        }

        setAbout(null);
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

      if (!response.data?.registrationOpen) {
        setApplicationClosed(true);
        return;
      }

      setApplicationOpen(true);
    } catch (error) {
      console.error(
        "CHECK APPLICATION STATUS ERROR:",
        error
      );

      setApplicationError(
        error.response?.data?.message ||
          "Unable to check application status."
      );
    } finally {
      setCheckingApplication(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#06152d] text-white">

      <Navbar
        onLogin={() => setLoginOpen(true)}
        onRegister={handleApply}
      />

      <Hero
        onRegistered={handleApply}
      />

      {!aboutLoading && about && (
        <section
          id="about"
          className="bg-white px-6 py-20 text-gray-900 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.5fr] lg:items-center">

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1769e0]">
                  <Info size={17} />
                  About Us
                </div>

                <h2 className="text-3xl font-bold leading-tight text-[#071629] sm:text-4xl">
                  {about.title}
                </h2>
              </div>

              <div>
                <p className="whitespace-pre-line text-base leading-8 text-gray-600">
                  {about.description}
                </p>
              </div>

            </div>

          </div>
        </section>
      )}

      <Tracks />

      <Mentors />

      <FAQ />

      {loginOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">

          <div className="flex min-h-screen items-center justify-center p-6">

            <div className="relative w-full max-w-[1200px]">

              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                className="absolute -right-3 -top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-gray-500 shadow-lg transition hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>

              <Login />

            </div>

          </div>

        </div>
      )}

      {checkingApplication && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="rounded-xl bg-white px-8 py-6 text-center text-gray-900 shadow-2xl">

            <p className="text-sm font-medium">
              Checking application status...
            </p>

          </div>

        </div>
      )}

      {applicationClosed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-gray-900 shadow-2xl">

            <h2 className="text-2xl font-bold">
              Application is currently closed
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Registration is not available at the moment.
              Please check back when the application period
              opens.
            </p>

            <button
              type="button"
              onClick={() => setApplicationClosed(false)}
              className="mt-6 rounded-lg bg-[#071629] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#10233b]"
            >
              Close
            </button>

          </div>

        </div>
      )}

      {applicationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-gray-900 shadow-2xl">

            <h2 className="text-2xl font-bold">
              Unable to check application
            </h2>

            <p className="mt-3 text-sm text-red-600">
              {applicationError}
            </p>

            <button
              type="button"
              onClick={() => setApplicationError("")}
              className="mt-6 rounded-lg bg-[#071629] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#10233b]"
            >
              Close
            </button>

          </div>

        </div>
      )}

      {applicationOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">

          <div className="flex min-h-screen items-center justify-center p-6">

            <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 text-gray-900 shadow-2xl">

              <button
                type="button"
                onClick={() => setApplicationOpen(false)}
                className="absolute right-5 top-5 text-xl text-gray-500 hover:text-gray-900"
              >
                ×
              </button>

              <div className="pr-8">

                <h1 className="text-3xl font-bold">
                  Bootcamp Application
                </h1>

                <p className="mt-2 text-gray-600">
                  Please complete the application form below.
                </p>

              </div>

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