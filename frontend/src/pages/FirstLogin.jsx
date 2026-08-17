import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function FirstLogin() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!userId.trim()) {
      setError("Please enter your User ID.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter your OTP.");
      return;
    }

    setLoading(true);

    // Temporary simulation until backend is ready
    setTimeout(() => {
      setLoading(false);

      // Clear the fields
      setUserId("");
      setOtp("");

      // Go to Set Password page
      navigate("/set-password");
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            First Login
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Enter the User ID and OTP provided to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* User ID */}
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
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your User ID"
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
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter your OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Your OTP was provided when your application was accepted.
        </p>
      </div>
    </main>
  );
}

export default FirstLogin;