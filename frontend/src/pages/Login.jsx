import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../context/useAuth";
import apiClient from "../services/apiClient";

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
  X,
} from "lucide-react";

function Login({ isModal = false, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your registered email address.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    try {
      await apiClient.post("/auth/forgot-password", {
        email: forgotEmail.trim(),
      });
      setForgotSuccess(true);
    } catch (err) {
      console.error("FORGOT PASSWORD ERROR:", err);
      setForgotError(
        err.response?.data?.message ||
        "Failed to send reset instructions. Please check the email address."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter your email and password."
      );
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
        throw new Error(
          "Invalid login response."
        );
      }

      if (onClose) {
        onClose();
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
        setError(
          "Your account role is not recognized."
        );
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

  const loginCard = (
    <div className="w-full">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2">

        {/* ===================================================
            LEFT SIDE (Desktop Only)
        =================================================== */}

        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#06103D] md:flex md:min-h-[560px]">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e5f1ed]0/10 blur-3xl" />

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

            <div className="max-w-md my-6">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                ASTU MSJ Bootcamp
              </p>

              <h1 className="text-4xl font-bold leading-[1.05] text-white lg:text-5xl">
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
                Develop your skills, build real
                projects, collaborate with your peers,
                and grow together with the ASTU MSJ
                community.
              </p>
            </div>

            {/* COMMUNITY CARD */}

            <div className="max-w-md rounded-xl border border-blue-400/20 bg-blue-950/70 p-4 shadow-lg">

              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e5f1ed]0/15">
                  <FileText
                    size={20}
                    className="text-blue-300"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Join the community
                  </p>

                  <p className="mt-0.5 text-xs text-gray-300">
                    Learn, collaborate, and build
                    together.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ===================================================
            RIGHT SIDE (Login Form)
        =================================================== */}

        <section className="flex w-full items-center justify-center bg-[#F5F0E8] p-5 sm:p-8 lg:p-10">

          <div className="w-full max-w-[440px]">

            {/* HEADER */}

            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Welcome back
              </h1>

              <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-slate-400">
                Sign in to your ASTU MSJ Bootcamp
                account.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}


            {/* QUICK TEST ACCOUNTS */}
            <div className="mb-6 rounded-xl border border-blue-200 bg-[#e5f1ed]/80 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Quick Test Accounts:
              </p>
              <div className="flex flex-wrap gap-1.5 sm:grid sm:grid-cols-4 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("superadminn@gmail.com");
                    setPassword("password123");
                    setError("");
                  }}
                  className="flex-1 whitespace-nowrap rounded-lg border dark:border-[#15253f] border-blue-200 bg-white dark:bg-[#0b1528] px-2 py-1.5 text-center text-xs font-semibold text-blue-900 shadow-sm transition hover:bg-blue-100/70 hover:border-blue-300"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("audittestadmin@example.com");
                    setPassword("password");
                    setError("");
                  }}
                  className="flex-1 whitespace-nowrap rounded-lg border dark:border-[#15253f] border-blue-200 bg-white dark:bg-[#0b1528] px-2 py-1.5 text-center text-xs font-semibold text-blue-900 shadow-sm transition hover:bg-blue-100/70 hover:border-blue-300"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("mentor@test.com");
                    setPassword("Mentor12345");
                    setError("");
                  }}
                  className="rounded-lg border dark:border-[#15253f] border-blue-200 bg-white dark:bg-[#0b1528] px-2.5 py-1.5 text-center text-xs font-semibold text-blue-900 shadow-sm transition hover:bg-blue-100/70 hover:border-blue-300"
                >
                  Mentor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("studentflow2026@example.com");
                    setPassword("Student12345");
                    setError("");
                  }}
                  className="rounded-lg border dark:border-[#15253f] border-blue-200 bg-white dark:bg-[#0b1528] px-2.5 py-1.5 text-center text-xs font-semibold text-blue-900 shadow-sm transition hover:bg-blue-100/70 hover:border-blue-300"
                >
                  Student
                </button>
              </div>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-100"
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
                    className="h-12 w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] pl-11 pr-4 text-sm text-gray-800 dark:text-slate-100 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 disabled:bg-gray-100 dark:bg-[#070e1b]"
                  />

                </div>
              </div>

              {/* PASSWORD */}


              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-800 dark:text-slate-100"
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
                    className="h-12 w-full rounded-lg border dark:border-[#15253f] border-gray-200 dark:border-[#15253f] bg-white dark:bg-[#0b1528] pl-11 pr-11 text-sm text-gray-800 dark:text-slate-100 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 disabled:bg-gray-100 dark:bg-[#070e1b]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-800 dark:text-slate-100"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
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
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSuccess(false);
                    setForgotError("");
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-gray-700 transition hover:text-slate-900 dark:text-white hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* LOGIN */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1f6f5b] text-sm font-semibold text-white shadow-sm transition hover:bg-[#185848] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-[#15253f] bg-white text-sm font-semibold text-gray-700 dark:text-slate-200 transition hover:bg-slate-50 dark:bg-[#070e1b]"
              >
                <ShieldCheck
                  size={18}
                  className="text-gray-800 dark:text-slate-100"
                />

                First time login? Verify with OTP
              </Link>

              {/* REGISTER */}

              <div className="rounded-xl bg-[#EAE3D8] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-[#0b1528] shadow-sm">

                    <FileText
                      size={19}
                      className="text-gray-800 dark:text-slate-100"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      Don't have an account?
                    </p>

                    <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
                      Apply for the ASTU MSJ Bootcamp.
                    </p>

                  </div>

                  <Link
                    to="/register"
                    onClick={() => onClose?.()}
                    className="flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-800 dark:text-slate-100 transition hover:text-gray-600 dark:text-slate-300"
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

  if (isModal) {
    return loginCard;
  }

  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-center bg-[#06152d] p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1100px]">
          {loginCard}
        </div>
      </div>

      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0b1528] p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:bg-[#070e1b] hover:text-gray-700 dark:text-slate-200"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Forgot Password?
            </h2>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            {forgotError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
                {forgotError}
              </div>
            )}
            

            {forgotSuccess ? (
              <div className="mt-6 rounded-xl bg-green-50 p-4 border border-green-200 text-center">
                <p className="text-sm font-bold text-green-800">
                  Reset link sent!
                </p>
                <p className="mt-1 text-xs text-green-700">
                  Password reset instructions have been sent to <strong>{forgotEmail}</strong>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-4 rounded-lg bg-green-700 px-5 py-2 text-xs font-semibold text-white hover:bg-green-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      required
                      className="h-11 w-full rounded-lg border border-gray-300 dark:border-[#15253f] pl-10 pr-4 text-xs text-slate-900 dark:text-white focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-[#15253f] py-2.5 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-[#070e1b]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 rounded-lg bg-[#1f6f5b] py-2.5 text-xs font-semibold text-white hover:bg-[#185848] disabled:opacity-50"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Login;