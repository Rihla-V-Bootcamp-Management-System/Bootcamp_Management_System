import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../context/useAuth";

import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(email, password);

      const user = response.user;

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "mentor") {
        navigate("/mentor");
      } else if (user.role === "student") {
        navigate("/student");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="w-full h-[620px] max-w-[1350px] rounded-2xl overflow-hidden bg-white shadow-2xl flex">

      {/* ================= LEFT SIDE ================= */}

      <section
        className="hidden md:flex w-1/2 relative bg-cover bg-center"
        style={{
          // backgroundImage: `url(${loginBackground})`,
        }}
      >

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#06103D]/20" />

        <div className="relative z-10 w-full p-10 flex flex-col justify-between">

        

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-xl border-2 border-blue-400 bg-[#07133F]/70 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                A
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                ASTU MSJ
              </h2>

              <p className="text-xs tracking-widest text-blue-300 font-semibold">
                SUMMER BOOTCAMP
              </p>
            </div>

          </div>

        

          <div className="max-w-md">

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              ASTU MSJ Bootcamp
            </p>

            <h1 className="text-5xl xl:text-6xl font-bold leading-[1] text-white">
              Learn.
              <br />
              Build.
              <br />
              Grow.
              <br />

              <span className="text-blue-400">
                Together.
              </span>
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-6 text-gray-200">
              Develop your skills, build real projects,
              and grow together with the ASTU MSJ community.
            </p>

          </div>

         

          <div className="max-w-md rounded-xl border border-blue-400/30 bg-[#07133F]/80 backdrop-blur-sm p-5">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText
                  size={23}
                  className="text-blue-300"
                />
              </div>

              <div>

                <p className="font-semibold text-white">
                  Join the community
                </p>

                <p className="mt-1 text-sm text-gray-300">
                  Learn, collaborate, and build together.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

     

      <section className="w-full md:w-1/2 bg-white flex items-center justify-center">

        <div className="w-full max-w-[470px] px-8">

      

          <h1 className="text-3xl font-bold text-[#071333]">
            Welcome back 
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to your ASTU MSJ Bootcamp account.
          </p>

         
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-4"
          >


            <div>

              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 rounded-lg border border-gray-200 pl-11 pr-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            

            <div>

              <label className="block mb-2 text-sm font-semibold text-gray-800">
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 rounded-lg border border-gray-200 pl-11 pr-11 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>

              </div>

            </div>

            

            <div className="flex justify-end">

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>

            </div>

            

            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-blue-600 text-sm font-semibold text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition"
            >
              <LogIn size={18} />
              Sign in
            </button>

           

            <div className="flex items-center gap-3 py-1">

              <div className="flex-1 h-px bg-gray-200" />

              <span className="text-xs text-gray-400">
                or
              </span>

              <div className="flex-1 h-px bg-gray-200" />

            </div>

           
            <button
              type="button"
              className="w-full h-12 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              <ShieldCheck
                size={18}
                className="text-blue-600"
              />

              Login with OTP
            </button>

           

            <div className="rounded-xl bg-[#F3F6FF] p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center">

                  <FileText
                    size={20}
                    className="text-blue-600"
                  />

                </div>

                <div className="flex-1">

                  <p className="text-xs font-semibold text-gray-900">
                    Don't have an account?
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Apply for the ASTU MSJ Bootcamp.
                  </p>

                </div>

                <Link
                  to="/register"
                  className="shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  Apply Now
                  <ArrowRight size={14} />
                </Link>

              </div>

            </div>

          </form>

        </div>

      </section>

    </div>
  );
}

export default Login;
