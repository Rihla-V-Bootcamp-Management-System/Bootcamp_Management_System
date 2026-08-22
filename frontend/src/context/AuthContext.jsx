import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const login = async (email, password) => {
    const response = await apiClient.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    const responseUser = response.data?.user;
    const responseToken = response.data?.token;

    if (!responseUser || !responseToken) {
      throw new Error("Login response is missing user or token.");
    }

    localStorage.setItem(
      "user",
      JSON.stringify(responseUser)
    );

    localStorage.setItem("token", responseToken);

    setUser(responseUser);
    setToken(responseToken);

    return response.data;
  };

  const completeFirstLogin = (
    responseUser,
    responseToken
  ) => {
    if (!responseUser || !responseToken) {
      throw new Error("User and token are required.");
    }

    localStorage.setItem(
      "user",
      JSON.stringify(responseUser)
    );

    localStorage.setItem(
      "token",
      responseToken
    );

    setUser(responseUser);
    setToken(responseToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);

    toast.success("Logged out successfully!");

    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        completeFirstLogin,
        logout,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };