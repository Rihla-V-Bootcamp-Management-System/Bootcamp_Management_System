import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

   setTimeout(() => {
  setLoading(false);

  setPassword("");
  setConfirmPassword("");

  navigate("/student");
}, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

       
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <LockKeyhole className="w-7 h-7 text-blue-600" />
          </div>
        </div>

       
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Set New Password
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>

      
        <p className="text-xs text-gray-400 text-center mt-6">
          Your password must contain at least 8 characters.
        </p>
      </div>
    </main>
  );
}

export default SetPassword;