import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../context/useAuth";

import { Eye, EyeOff } from "lucide-react";

function Login({ onRegister}) {
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
    <main className="relative w-full bg-gray-100 flex items-center justify-center">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">

        <h1 className="text-3xl text-black  font-bold">
          Welcome Back
        </h1>

        <p className="mt-4 text-gray-900 ">
          Log in to your ASTU MSJ Bootcamp account.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className=" text-black block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" text-gray-600  border-gray-600 hover:border-red-300 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className=" text-black block mb-2 font-medium">
              Password
            </label>
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full rounded-lg border border-gray-700 px-4 py-3 pr-12 outline-none focus:border-blue-600 text-gray-600"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
  >
    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
  </button>
</div>
           
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-800 rounded-lg  py-3 text-white transition hover:bg-yellow-600"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}

export default Login;

