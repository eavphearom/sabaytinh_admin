import axios from "axios";
export const ACCESS_DENIED_EVENT = "auth:access-denied";
export const SESSION_EXPIRED_EVENT = "auth:session-expired";
//Axios configuration
const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
// Attach the current session token before each request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
// Notify React when the API rejects the current session.
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const token = localStorage.getItem("token");
    const isLogin = error.config?.url === "/auth/login";
    const requestToken = error.config?.headers?.Authorization;
    // A late response from an old session must not log out a newly signed-in user.
    if (error.response?.status === 401 && !isLogin &&
        (!token || requestToken === `Bearer ${token}`)) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    if (error.response?.status === 403 && !isLogin && token &&
        requestToken === `Bearer ${token}`) {
      window.dispatchEvent(new Event(ACCESS_DENIED_EVENT));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
