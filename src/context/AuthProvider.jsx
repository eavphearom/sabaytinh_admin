import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import authService from "../features/auth/services/authService";
import { persistLogin, isCurrentSession } from "../services/authSession";
import Loading from "../components/ui/Loading";
import { useQueryClient } from "@tanstack/react-query";
import { SESSION_EXPIRED_EVENT } from "../services/apiClient";

export default function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  // Clearing React auth state lets ProtectedRoute redirect to login immediately.
  useEffect(() => {
    const handleSessionExpired = () => {
      setAuthError(null);
      setUser(null);
      setLoading(false);
      queryClient.clear();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [queryClient]);
  //Check current user
  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      setLoading(true);
      setAuthError(null);
      const token = localStorage.getItem("token");

      // No token = not authenticated
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authService.getCurrentUser();
        // Ignore an auth check that finishes after its session has expired.
        if (active && isCurrentSession(localStorage, token)) setUser(response.data);
      } catch (error) {
        if (active && isCurrentSession(localStorage, token)) {
          // Only the API client's 401 handler expires a session.
          setAuthError(error.response?.status === 403
            ? "Access denied. Your account cannot access this resource."
            : "Unable to verify your session. Please retry.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    checkAuth();
    return () => { active = false; };
  }, [attempt]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const userData = response.data;
    const currentUser = persistLogin(userData, localStorage);
    queryClient.clear();
    setAuthError(null);
    setUser(currentUser);
    return userData;
  };

  // Logout user
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      queryClient.clear();
      setAuthError(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {loading ? <Loading /> : authError ? (
        <div role="alert" className="p-8">
          <p>{authError}</p>
          <button onClick={() => setAttempt((value) => value + 1)}>Retry</button>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
