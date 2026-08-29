import axios from "axios";

let apiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

if (apiUrl && !apiUrl.endsWith("/api")) {
  apiUrl = `${apiUrl}/api`;
}

const apiClient = axios.create({
  baseURL: apiUrl,
});

// Attach JWT token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API ERROR:",
      error.response?.data || error.message
    );

    const isLoginRequest = error.config?.url?.includes("/auth/login");
    const pathname = window.location.pathname;
    const isPublicRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/apply" ||
      pathname === "/first-login" ||
      pathname === "/set-password";

    // Only redirect to login for protected dashboard routes
    if (error.response?.status === 401 && !isLoginRequest && !isPublicRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiClient;