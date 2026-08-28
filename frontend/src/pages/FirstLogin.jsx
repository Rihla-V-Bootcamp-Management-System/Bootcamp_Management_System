import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

function FirstLogin() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const trimmedUserId = userId.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedUserId) {
      setError("Please enter your User ID.");
      return;
    }

    if (!trimmedOtp) {
      setError("Please enter your OTP.");
      return;
    }

    if (trimmedOtp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending OTP verification:", {
        userID: trimmedUserId,
        otp: trimmedOtp,
      });

      const response = await apiClient.post(
        "/auth/verify-otp",
        {
          userID: trimmedUserId,
          otp: trimmedOtp,
        }
      );

      console.log(
        "OTP verification response:",
        response.data
      );

      if (response.data?.verified === true) {
        navigate("/set-password", {
          state: {
            userID: trimmedUserId,
            otp: trimmedOtp,
          },
        });

        return;
      }

      setError(
        response.data?.message ||
          "OTP verification was unsuccessful."
      );
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* ICON */}

        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        {/* HEADER */}

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            First Login
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Enter the User ID and OTP provided to you.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* USER ID */}

          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              User ID
            </label>

            <div className="relative">
              <KeyRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) =>
                  setUserId(e.target.value)
                }
                placeholder="Enter your User ID"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* OTP */}

          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              OTP
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => {
                const value =
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                setOtp(value);
              }}
              placeholder="Enter your OTP"
              maxLength={6}
              autoComplete="one-time-code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* ERROR */}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        {/* FOOTER */}

        <p className="text-xs text-gray-400 text-center mt-6">
          Your OTP was provided when your application
          was accepted.
        </p>

      </div>
    </main>
  );
}

export default FirstLogin;