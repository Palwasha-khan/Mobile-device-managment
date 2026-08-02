import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // REQUIRED - lets the browser send/receive the refreshToken cookie
});

// In-memory storage for the current access token. NOT localStorage -
// access tokens are short-lived and only need to survive within the
// current tab session; keeping them out of localStorage also avoids
// exposing them to XSS attacks that read localStorage.
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Attach the access token to every outgoing request automatically
axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Track whether a refresh is already in progress, so if 5 requests fail
// at once (all with expired tokens), we only call /refresh-token ONCE,
// not 5 times in parallel
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeToRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

axiosClient.interceptors.response.use(
  (response) => response, // successful responses pass straight through
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a refresh on a 401, and only once per request
    // (the _retry flag prevents an infinite loop if refresh itself fails)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already happening (triggered by another failed
      // request), just wait for it to finish instead of firing a second one
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeToRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // No body needed here - the browser sends the refreshToken
        // cookie automatically because of withCredentials: true
        const { data } = await axiosClient.post("/auth/refresh-token");

        setAccessToken(data.accessToken);
        isRefreshing = false;
        onRefreshed(data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosClient(originalRequest); // retry the original failed request
      } catch (refreshError) {
        isRefreshing = false;
        setAccessToken(null);
        // Refresh itself failed - the session is truly over, force a
        // redirect to login. AuthContext will handle this properly once
        // built in Phase 2; for now this is the fallback.
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;