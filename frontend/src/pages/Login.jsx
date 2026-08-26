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
  Loader2,
} from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        email.trim(),
        password
      );

      const user = response?.user;

      if (!user) {
        throw new Error("Invalid login response.");
      }

      // =====================================================
      // REDIRECT BASED ON ROLE
      // =====================================================

      if (user.role === "superadmin") {
        navigate("/superadmin");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "mentor") {
        navigate("/mentor");
      } else if (user.role === "student") {
        navigate("/student");
      } else {
        setError("Your account role is not recognized.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <section className="relative flex min-h-[620px] overflow-hidden bg-[#06103D]">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-8 sm:p-10 lg:p-12">

            {/* LOGO */}

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-blue-400/60 bg-blue-950/70 shadow-lg">
                <span className="text-3xl font-bold text-white">
                  A
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  ASTU MSJ
                </h2>

                <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-blue-300">
                  SUMMER BOOTCAMP
                </p>
              </div>
            </div>

            {/* HERO TEXT */}

            <div className="max-w-md">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                ASTU MSJ Bootcamp
              </p>

              <h1 className="text-5xl font-bold leading-[1.05] text-white lg:text-6xl">
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

              <p className="mt-6 max-w-md text-sm leading-7 text-gray-300">
                Develop your skills, build real projects,
                collaborate with your peers, and grow
                together with the ASTU MSJ community.
              </p>
            </div>

            {/* COMMUNITY CARD */}

            <div className="max-w-md rounded-xl border border-blue-400/20 bg-blue-950/70 p-5 shadow-lg">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                  <FileText
                    size={22}
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

        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <section className="flex min-h-[620px] items-center justify-center bg-[#F5F0E8] p-7 sm:p-9 lg:p-10">

          <div className="w-full max-w-[440px]">

            {/* HEADER */}

            <div className="mb-7">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Sign in to your ASTU MSJ Bootcamp account.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    disabled={loading}
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 disabled:bg-gray-100"
                  />

                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    disabled={loading}
                    autoComplete="current-password"
                    required
                    className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-800"
                  >
                    {showPassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>

                </div>
              </div>

              {/* FORGOT PASSWORD */}

              <div className="flex justify-end">

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-gray-700 transition hover:text-gray-900 hover:underline"
                >
                  Forgot password?
                </Link>

              </div>

              {/* LOGIN */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gray-900 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign in
                  </>
                )}

              </button>

              {/* DIVIDER */}

              <div className="flex items-center gap-3 py-1">

                <div className="h-px flex-1 bg-gray-300" />

                <span className="text-xs text-gray-400">
                  or
                </span>

                <div className="h-px flex-1 bg-gray-300" />

              </div>

              {/* FIRST LOGIN WITH OTP */}

              <Link
                to="/first-login"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ShieldCheck
                  size={18}
                  className="text-gray-800"
                />

                First time login? Verify with OTP
              </Link>

              {/* REGISTER */}

              <div className="rounded-xl bg-[#EAE3D8] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

                    <FileText
                      size={19}
                      className="text-gray-800"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-semibold text-gray-900">
                      Don't have an account?
                    </p>

                    <p className="mt-1 text-[11px] text-gray-500">
                      Apply for the ASTU MSJ Bootcamp.
                    </p>

                  </div>

                  <Link
                    to="/register"
                    className="flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-800 transition hover:text-gray-600"
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
    </div>
  );
}

export default Login;