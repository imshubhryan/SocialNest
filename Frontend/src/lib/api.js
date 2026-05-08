import axios from "axios";

/**
 * Centralized Axios instance for the entire SocialNest frontend.
 * - Uses VITE_API_URL from environment (falls back to localhost for dev)
 * - Sends cookies with every request (httpOnly auth tokens)
 * - Auto-refreshes expired access tokens (401 → refresh → retry)
 * - Redirects to /login if refresh also fails
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3000"),
  withCredentials: true,
});

// Track whether a token refresh is already in progress
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ─── RESPONSE INTERCEPTOR: Auto Token Refresh ────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors, skip if it's already a retry or a refresh request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh-token") &&
      !originalRequest.url?.includes("/api/auth/login")
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3000")}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — session is dead, redirect to login only if we are not already on a public page
        const publicPages = ["/login", "/register", "/forgot-password", "/reset-password"];
        if (!publicPages.includes(window.location.pathname)) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
