import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../services/apiClient";

function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userID = searchParams.get("userID") || "";
  const otp = searchParams.get("otp") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!userID || !otp) {
      setError(
        "Your invitation link is missing your User ID or OTP."
      );
      return;
    }

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

      const response = await apiClient.post(
        "/auth/set-password",
        {
          userID,
          otp,
          newPassword: password,
        }
      );

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      setPassword("");
      setConfirmPassword("");

      // Redirect based on the user's role
      if (user?.role === "superadmin") {
        navigate("/superadmin", { replace: true });
      } else if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user?.role === "mentor") {
        navigate("/mentor", { replace: true });
      } else if (user?.role === "student") {
        navigate("/student", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to set password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

        {/* ICON */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <LockKeyhole className="h-7 w-7 text-blue-600" />
          </div>
        </div>

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Set New Password
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create a new password for your account.
          </p>
        </div>

        {/* MISSING INVITATION DATA */}
        {!userID || !otp ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            This invitation link is incomplete.
            Please open the{" "}
            <strong>Set Your Password</strong> link from
            your invitation email.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* USER ID */}
            <div>
              <label
                htmlFor="userID"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                User ID
              </label>

              <input
                id="userID"
                type="text"
                value={userID}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
              />
            </div>

            {/* OTP */}
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                OTP
              </label>

              <input
                id="otp"
                type="text"
                value={otp}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none"
              />
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
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
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
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
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100"
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
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Setting Password..."
                : "Set Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Your password must contain at least 8 characters.
        </p>
      </div>
    </main>
  );
}

export default SetPassword;