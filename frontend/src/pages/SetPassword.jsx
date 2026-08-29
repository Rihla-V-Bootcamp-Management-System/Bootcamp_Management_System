
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

function SetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // GET USER ID + OTP
  // =========================================================
  // FirstLogin.jsx sends these using React Router state:
  //
  // navigate("/set-password", {
  //   state: {
  //     userID,
  //     otp,
  //   },
  // });
  //
  // We read them here from location.state.
  // =========================================================

  const userID = location.state?.userID || "";
  const otp = location.state?.otp || "";

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ---------------------------------------------------------
    // Check invitation data
    // ---------------------------------------------------------

    if (!userID || !otp) {
      setError(
        "Your verification information is missing. Please verify your OTP again."
      );
      return;
    }

    // ---------------------------------------------------------
    // Validate password
    // ---------------------------------------------------------

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      console.log("Setting password for:", userID);

      const response = await apiClient.post(
        "/auth/set-password",
        {
          userID: userID.trim(),
          otp: otp.trim(),
          newPassword: password,
        }
      );

      console.log(
        "SET PASSWORD RESPONSE:",
        response.data
      );

      const { token, user } = response.data;

      // ---------------------------------------------------------
      // Save authentication token
      // ---------------------------------------------------------

      if (token) {
        localStorage.setItem("token", token);
      }

      // ---------------------------------------------------------
      // Save user
      // ---------------------------------------------------------

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      // ---------------------------------------------------------
      // Clear password fields
      // ---------------------------------------------------------

      setPassword("");
      setConfirmPassword("");

      // ---------------------------------------------------------
      // Redirect based on role
      // ---------------------------------------------------------

      if (user?.role === "superadmin") {
        navigate("/superadmin", {
          replace: true,
        });
      } else if (user?.role === "admin") {
        navigate("/admin", {
          replace: true,
        });
      } else if (user?.role === "mentor") {
        navigate("/mentor", {
          replace: true,
        });
      } else if (user?.role === "student") {
        navigate("/student", {
          replace: true,
        });
      } else {
        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      console.error(
        "SET PASSWORD ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Failed to set password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // MISSING USER ID / OTP
  // =========================================================

  if (!userID || !otp) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#070e1b] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-8 shadow-sm">

          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <LockKeyhole className="h-7 w-7 text-red-500" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Verification Required
            </h1>

            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
              Your verification information is missing.
              Please return to the First Login page and
              verify your User ID and OTP again.
            </p>

            <button
              type="button"
              onClick={() => navigate("/first-login")}
              className="mt-6 w-full rounded-lg bg-[#1f6f5b] py-3 font-medium text-white transition hover:bg-[#185848]"
            >
              Verify OTP
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#070e1b] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white dark:border-[#15253f] dark:bg-[#0b1528] p-8 shadow-sm">

        {/* ICON */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e5f1ed]">
            <LockKeyhole className="h-7 w-7 text-[#1f6f5b]" />
          </div>
        </div>

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Set New Password
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Create a new password for your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* USER ID */}
          <div>
            <label
              htmlFor="userID"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200"
            >
              User ID
            </label>

            <input
              id="userID"
              type="text"
              value={userID}
              readOnly
              className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] bg-gray-100 dark:bg-[#070e1b] px-4 py-3 text-sm text-gray-600 dark:text-slate-300 outline-none"
            />
          </div>

          {/* OTP */}
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200"
            >
              OTP
            </label>

            <input
              id="otp"
              type="text"
              value={otp}
              readOnly
              className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] bg-gray-100 dark:bg-[#070e1b] px-4 py-3 text-sm text-gray-600 dark:text-slate-300 outline-none"
            />
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200"
            >
              New Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter new password"
                disabled={loading}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] py-3 pl-10 pr-4 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#1f6f5b]/20 disabled:bg-gray-100 dark:bg-[#070e1b]"
              />
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200"
            >
              Confirm Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                disabled={loading}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-[#15253f] py-3 pl-10 pr-4 outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#1f6f5b]/20 disabled:bg-gray-100 dark:bg-[#070e1b]"
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#1f6f5b] py-3 font-medium text-white transition hover:bg-[#185848] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Setting Password..."
              : "Set Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Your password must contain at least 8 characters.
        </p>
      </div>
    </main>
  );
}

export default SetPassword;

