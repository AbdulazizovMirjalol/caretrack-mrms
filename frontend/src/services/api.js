import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const getApiErrorMessage = (
  error,
  fallback = "The request could not be completed. Please try again.",
) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ECONNABORTED") {
    return "The request timed out. Please check the connection and try again.";
  }
  if (!error.response) {
    return "The server is not reachable. It may be starting up, please try again in a moment.";
  }

  return fallback;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("caretrack_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("caretrack_token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
