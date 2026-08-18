import loginImage from "../assets/login-image.png";
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

     
      <Navbar
  onLogin={() => setLoginOpen(true)}
  onRegister={() => {
    console.log("REGISTER CLICKED");
    setApplicationOpen(true);
  }}
/>
     
      <Hero
        onRegistered={() => setApplicationOpen(true)}
      />

      <Tracks />

     
      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="relative w-[90%] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">

           
            <button
              onClick={() => setLoginOpen(false)}
              className="absolute right-5 top-5 z-20 text-xl text-gray-500 hover:text-gray-900"
            >
              ✕
            </button>

            <div className="grid min-h-[550px] md:grid-cols-2">

              
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

              
              <div className="p-10">

                <Login />

              </div>

            </div>
          </div>

        </div>
      )}

      
      {applicationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-[90%] max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 text-gray-900 shadow-2xl">

            
            <button
              onClick={() => setApplicationOpen(false)}
              className="absolute right-5 top-5 text-xl text-gray-500 hover:text-gray-900"
            >
              ✕
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
      )}

    </main>
  );
}

export default Landing;